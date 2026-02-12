// Auth utility — password hashing & session management
// Uses Web Crypto API (no external dependencies)

const SALT_LENGTH = 16;
const ITERATIONS = 100000;
const KEY_LENGTH = 32;
const SESSION_COOKIE = 'admin_session';
const SESSION_MAX_AGE = 60 * 60 * 24; // 24 hours

function buf2hex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}

function hex2buf(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes;
}

export async function hashPassword(password: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveBits']
    );
    const derivedBits = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt,
            iterations: ITERATIONS,
            hash: 'SHA-256',
        },
        keyMaterial,
        KEY_LENGTH * 8
    );

    return `${buf2hex(salt.buffer)}:${buf2hex(derivedBits)}`;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    const [saltHex, keyHex] = hash.split(':');
    if (!saltHex || !keyHex) return false;

    const salt = hex2buf(saltHex);
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveBits']
    );
    const derivedBits = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt,
            iterations: ITERATIONS,
            hash: 'SHA-256',
        },
        keyMaterial,
        KEY_LENGTH * 8
    );

    return buf2hex(derivedBits) === keyHex;
}

// Simple session token: base64(username:timestamp:signature)
const SECRET = process.env.ADMIN_SECRET || 'basispoint-admin-secret-change-me';

async function sign(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(SECRET),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
    return buf2hex(signature);
}

async function verifySignature(data: string, sig: string): Promise<boolean> {
    const expected = await sign(data);
    return expected === sig;
}

export async function createSessionToken(userId: string, username: string, role: string): Promise<string> {
    const payload = `${userId}|${username}|${role}|${Date.now()}`;
    const signature = await sign(payload);
    const token = btoa(`${payload}|${signature}`);
    return token;
}

export async function validateSessionToken(token: string): Promise<{
    userId: string;
    username: string;
    role: string;
} | null> {
    try {
        const decoded = atob(token);
        const parts = decoded.split('|');
        if (parts.length !== 5) return null;

        const [userId, username, role, timestamp, signature] = parts;
        const payload = `${userId}|${username}|${role}|${timestamp}`;

        // Check signature
        if (!(await verifySignature(payload, signature))) return null;

        // Check expiry (24h)
        const age = Date.now() - parseInt(timestamp);
        if (age > SESSION_MAX_AGE * 1000) return null;

        return { userId, username, role };
    } catch {
        return null;
    }
}

export function getSessionCookieName(): string {
    return SESSION_COOKIE;
}

export function getSessionMaxAge(): number {
    return SESSION_MAX_AGE;
}

export function getSessionFromCookies(cookieHeader: string | null): string | null {
    if (!cookieHeader) return null;
    const cookies = cookieHeader.split(';').map((c) => c.trim());
    const sessionCookie = cookies.find((c) => c.startsWith(`${SESSION_COOKIE}=`));
    if (!sessionCookie) return null;
    return sessionCookie.split('=')[1] || null;
}
