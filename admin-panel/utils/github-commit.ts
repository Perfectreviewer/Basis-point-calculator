// GitHub API utility for committing config changes from Vercel serverless functions
// On Vercel, the filesystem is read-only. This module commits changes via the GitHub API,
// which triggers a redeploy with the updated config.

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const IS_VERCEL = !!process.env.VERCEL;

// Environment variables (set in Vercel dashboard):
//   GITHUB_TOKEN  – a fine-grained personal access token with "Contents: read & write" permission
//   GITHUB_REPO   – "owner/repo", e.g. "Perfectreviewer/Basis-point-calculator"
//   GITHUB_BRANCH – branch to commit to, defaults to "main"

function getGitHubConfig() {
    return {
        token: process.env.GITHUB_TOKEN || '',
        repo: process.env.GITHUB_REPO || '',
        branch: process.env.GITHUB_BRANCH || 'main',
    };
}

/**
 * Save a JSON config file. On local dev, writes to disk. On Vercel, commits via GitHub API.
 * @param filePath  Absolute path to the file (used for local dev & to derive the repo path)
 * @param data      The JSON data to write
 * @param commitMessage  Optional commit message
 */
export async function saveConfigFile(
    filePath: string,
    data: any,
    commitMessage?: string
): Promise<{ success: boolean; error?: string }> {
    const jsonContent = JSON.stringify(data, null, 2) + '\n';

    // ── Local dev: write to disk ──
    if (!IS_VERCEL) {
        const { writeFileSync, mkdirSync } = await import('node:fs');
        const { dirname } = await import('node:path');
        mkdirSync(dirname(filePath), { recursive: true });
        writeFileSync(filePath, jsonContent, 'utf-8');
        return { success: true };
    }

    // ── Vercel: commit via GitHub API ──
    const { token, repo, branch } = getGitHubConfig();

    if (!token || !repo) {
        const debugInfo = {
            isVercel: IS_VERCEL,
            vercelEnv: process.env.VERCEL_ENV || 'not set',
            hasToken: !!process.env.GITHUB_TOKEN,
            tokenLength: (process.env.GITHUB_TOKEN || '').length,
            hasRepo: !!process.env.GITHUB_REPO,
            repoValue: process.env.GITHUB_REPO || 'not set',
            envKeys: Object.keys(process.env).filter(k => k.startsWith('GITHUB')).join(', ') || 'none',
        };
        console.error('Missing env vars. Debug:', JSON.stringify(debugInfo));
        return {
            success: false,
            error: `Server configuration missing. Debug: ${JSON.stringify(debugInfo)}`,
        };
    }

    // Derive the repo-relative path (e.g. "src/config/navigation.json")
    // The filePath is typically: /var/task/src/config/navigation.json or similar
    const cwd = process.cwd();
    let repoPath = filePath.startsWith(cwd)
        ? filePath.slice(cwd.length + 1).replace(/\\/g, '/')
        : filePath.replace(/\\/g, '/');

    // Ensure path starts from src/ or admin-panel/
    const srcIdx = repoPath.indexOf('src/');
    const adminIdx = repoPath.indexOf('admin-panel/');
    if (srcIdx >= 0) repoPath = repoPath.slice(srcIdx);
    else if (adminIdx >= 0) repoPath = repoPath.slice(adminIdx);

    const message = commitMessage || `chore(admin): update ${repoPath.split('/').pop()}`;

    try {
        const apiBase = `https://api.github.com/repos/${repo}/contents/${repoPath}`;
        const headers = {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
            'Content-Type': 'application/json',
            'X-GitHub-Api-Version': '2022-11-28',
        };

        // 1. Get current file SHA (required for updates)
        const getRes = await fetch(`${apiBase}?ref=${branch}`, { headers });
        let sha: string | undefined;
        if (getRes.ok) {
            const fileData = await getRes.json() as any;
            sha = fileData.sha;
        }

        // 2. Create or update the file
        const body: any = {
            message,
            content: Buffer.from(jsonContent, 'utf-8').toString('base64'),
            branch,
        };
        if (sha) body.sha = sha;

        const putRes = await fetch(apiBase, {
            method: 'PUT',
            headers,
            body: JSON.stringify(body),
        });

        if (!putRes.ok) {
            const errData = await putRes.text();
            console.error(`GitHub API error (${putRes.status}):`, errData);
            return {
                success: false,
                error: `GitHub API error: ${putRes.status} – ${errData}`,
            };
        }

        return { success: true };
    } catch (err: any) {
        console.error('GitHub commit error:', err);
        return {
            success: false,
            error: `Failed to commit: ${err.message}`,
        };
    }
}

/**
 * Upload a binary file (like an image) directly to GitHub.
 * Returns the raw GitHub URL so the image can be viewed immediately before redeploy finishes.
 */
export async function uploadFileToGitHub(
    repoPath: string,
    base64Content: string,
    commitMessage?: string
): Promise<{ success: boolean; url?: string; error?: string }> {
    const { token, repo, branch } = getGitHubConfig();

    if (!token || !repo) {
        return { success: false, error: 'Missing GitHub configuration. Please set GITHUB_TOKEN and GITHUB_REPO in Vercel.' };
    }

    const message = commitMessage || `chore(admin): upload ${repoPath.split('/').pop()}`;
    const apiBase = `https://api.github.com/repos/${repo}/contents/${repoPath}`;

    try {
        const headers = {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
            'Content-Type': 'application/json',
            'X-GitHub-Api-Version': '2022-11-28',
        };

        const body = {
            message,
            content: base64Content,
            branch,
        };

        const putRes = await fetch(apiBase, {
            method: 'PUT',
            headers,
            body: JSON.stringify(body),
        });

        if (!putRes.ok) {
            const errData = await putRes.text();
            console.error(`GitHub API error (${putRes.status}):`, errData);
            return { success: false, error: `GitHub API error: ${putRes.status}` };
        }

        // Return a raw URL so the editor can preview it immediately
        // jsdelivr is a reliable CDN for GitHub files
        const cdnUrl = `https://cdn.jsdelivr.net/gh/${repo}@${branch}/${repoPath}`;

        return { success: true, url: cdnUrl };
    } catch (err: any) {
        console.error('GitHub file upload error:', err);
        return { success: false, error: `Failed to upload to GitHub: ${err.message}` };
    }
}
