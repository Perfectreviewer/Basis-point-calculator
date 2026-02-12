// Text Content Extractor — Parses .astro files to extract editable text
// Handles: pageTitle, pageDescription, faqs[], links[], trustSignals[], categories[], relatedCalculators[]

interface FaqItem {
    question: string;
    answer: string;
}

interface LinkItem {
    title: string;
    description: string;
    url?: string;
    icon?: string;
}

interface ExtractedContent {
    pageTitle: string;
    pageDescription: string;
    faqs: FaqItem[];
    links: LinkItem[];
    trustSignals: LinkItem[];
    categories: { name: string; description: string }[];
    relatedCalculators: { name: string }[];
    htmlSections: { tag: string; text: string; line: number }[];
}

/**
 * Extract the frontmatter block from an .astro file (between --- delimiters)
 */
function getFrontmatter(content: string): { frontmatter: string; startLine: number; endLine: number } | null {
    const lines = content.split('\n');
    let fmStart = -1;
    let fmEnd = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim() === '---') {
            if (fmStart === -1) { fmStart = i; }
            else { fmEnd = i; break; }
        }
    }
    if (fmStart === -1 || fmEnd === -1) return null;
    return {
        frontmatter: lines.slice(fmStart + 1, fmEnd).join('\n'),
        startLine: fmStart + 1,
        endLine: fmEnd,
    };
}

/**
 * Extract a simple string constant: const varName = "value"; or const varName = 'value';
 * Also handles multiline: const varName =\n  "value";
 * Also handles i18n pattern: const varName = t.key || "fallback";
 */
function extractStringConst(fm: string, varName: string): string {
    // Pattern 1: const varName = "value";
    const re1 = new RegExp(`const\\s+${varName}\\s*=\\s*(?:[^;]*?\\|\\|\\s*)?["'\`]([\\s\\S]*?)["'\`]\\s*;`, 'm');
    const m1 = fm.match(re1);
    if (m1) return m1[1].replace(/\\n/g, '\n').trim();

    // Pattern 2: multiline with concatenation
    const re2 = new RegExp(`const\\s+${varName}\\s*=\\s*\\n\\s*(?:[^;]*?\\|\\|\\s*)?["'\`]([\\s\\S]*?)["'\`]\\s*;`, 'm');
    const m2 = fm.match(re2);
    if (m2) return m2[1].replace(/\\n/g, '\n').trim();

    return '';
}

/**
 * Extract an array of objects with question/answer properties (FAQs)
 */
function extractFaqs(fm: string, varName: string = 'faqs'): FaqItem[] {
    const results: FaqItem[] = [];
    // Find the array block
    const arrayRe = new RegExp(`const\\s+${varName}\\s*=\\s*\\[([\\s\\S]*?)\\];`, 'm');
    const arrayMatch = fm.match(arrayRe);
    if (!arrayMatch) return results;

    const arrayContent = arrayMatch[1];
    // Extract each { question: "...", answer: "..." } block
    const objRe = /\{\s*question:\s*["'`]([\s\S]*?)["'`]\s*,\s*answer:\s*["'`]([\s\S]*?)["'`]\s*,?\s*\}/g;
    let m;
    while ((m = objRe.exec(arrayContent)) !== null) {
        results.push({ question: m[1].trim(), answer: m[2].trim() });
    }
    return results;
}

/**
 * Extract an array of objects with title/description (links, trustSignals)
 */
function extractTitleDescArray(fm: string, varName: string): LinkItem[] {
    const results: LinkItem[] = [];
    const arrayRe = new RegExp(`const\\s+${varName}\\s*=\\s*\\[([\\s\\S]*?)\\];`, 'm');
    const arrayMatch = fm.match(arrayRe);
    if (!arrayMatch) return results;

    const arrayContent = arrayMatch[1];
    // Extract { title: "...", ... description: "..." } patterns
    const objRe = /\{\s*[\s\S]*?title:\s*["'`]([\s\S]*?)["'`][\s\S]*?description:\s*["'`]([\s\S]*?)["'`][\s\S]*?\}/g;
    let m;
    while ((m = objRe.exec(arrayContent)) !== null) {
        results.push({ title: m[1].trim(), description: m[2].trim() });
    }

    // If no title/description found, try icon/title/description pattern
    if (results.length === 0) {
        const objRe2 = /\{\s*icon:\s*["'`][\s\S]*?["'`]\s*,\s*title:\s*["'`]([\s\S]*?)["'`]\s*,\s*description:\s*["'`]([\s\S]*?)["'`][\s\S]*?\}/g;
        let m2;
        while ((m2 = objRe2.exec(arrayContent)) !== null) {
            results.push({ title: m2[1].trim(), description: m2[2].trim() });
        }
    }

    return results;
}

/**
 * Extract categories array (name, description)
 */
function extractCategories(fm: string): { name: string; description: string }[] {
    const results: { name: string; description: string }[] = [];
    const arrayRe = /const\s+categories\s*=\s*\[([\s\S]*?)\];/m;
    const arrayMatch = fm.match(arrayRe);
    if (!arrayMatch) return results;

    const arrayContent = arrayMatch[1];
    const objRe = /name:\s*["'`]([\s\S]*?)["'`][\s\S]*?description:\s*["'`]([\s\S]*?)["'`]/g;
    let m;
    while ((m = objRe.exec(arrayContent)) !== null) {
        results.push({ name: m[1].trim(), description: m[2].trim() });
    }
    return results;
}

/**
 * Extract relatedCalculators array (name only)
 */
function extractRelatedCalculators(fm: string): { name: string }[] {
    const results: { name: string }[] = [];
    const arrayRe = /const\s+relatedCalculators\s*=\s*\[([\s\S]*?)\];/m;
    const arrayMatch = fm.match(arrayRe);
    if (!arrayMatch) return results;

    const arrayContent = arrayMatch[1];
    const nameRe = /name:\s*["'`]([\s\S]*?)["'`]/g;
    let m;
    while ((m = nameRe.exec(arrayContent)) !== null) {
        results.push({ name: m[1].trim() });
    }
    return results;
}

/**
 * Extract heading and paragraph text from the HTML template (after frontmatter)
 */
function extractHtmlText(content: string): { tag: string; text: string; line: number }[] {
    const sections: { tag: string; text: string; line: number }[] = [];
    const lines = content.split('\n');

    // Find after frontmatter
    let afterFm = false;
    let fmCount = 0;

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim() === '---') {
            fmCount++;
            if (fmCount === 2) { afterFm = true; continue; }
        }
        if (!afterFm) continue;

        const line = lines[i];

        // Extract h1, h2, h3 text content (standalone text, not {variable})
        const headingMatch = line.match(/<h([1-3])[^>]*>([^{<][^<]*)<\/h\1>/);
        if (headingMatch) {
            const text = headingMatch[2].trim();
            if (text && !text.includes('{') && text.length > 2) {
                sections.push({ tag: `h${headingMatch[1]}`, text, line: i + 1 });
            }
        }

        // Extract standalone paragraph text (simple cases)
        const pMatch = line.match(/<p[^>]*>([^{<][^<]{10,})<\/p>/);
        if (pMatch) {
            const text = pMatch[1].trim();
            if (text && !text.includes('{') && text.length > 15) {
                sections.push({ tag: 'p', text, line: i + 1 });
            }
        }
    }

    return sections;
}


/**
 * Main extraction function — extract all text content from an .astro file
 */
export function extractTextContent(content: string): ExtractedContent {
    const fm = getFrontmatter(content);
    const frontmatter = fm?.frontmatter || '';

    return {
        pageTitle: extractStringConst(frontmatter, 'pageTitle'),
        pageDescription: extractStringConst(frontmatter, 'pageDescription'),
        faqs: extractFaqs(frontmatter),
        links: extractTitleDescArray(frontmatter, 'links'),
        trustSignals: extractTitleDescArray(frontmatter, 'trustSignals'),
        categories: extractCategories(frontmatter),
        relatedCalculators: extractRelatedCalculators(frontmatter),
        htmlSections: extractHtmlText(content),
    };
}

/**
 * Write extracted text content back into an .astro file
 * Replaces string values in the frontmatter using exact-match find-and-replace
 */
export function updateTextContent(
    originalContent: string,
    updates: {
        pageTitle?: string;
        pageDescription?: string;
        faqs?: FaqItem[];
        links?: LinkItem[];
        trustSignals?: LinkItem[];
        categories?: { name: string; description: string }[];
        relatedCalculators?: { name: string }[];
        htmlSections?: { tag: string; text: string; originalText: string; line: number }[];
    }
): string {
    let content = originalContent;

    // Update pageTitle
    if (updates.pageTitle !== undefined) {
        content = replaceStringConst(content, 'pageTitle', updates.pageTitle);
    }

    // Update pageDescription
    if (updates.pageDescription !== undefined) {
        content = replaceStringConst(content, 'pageDescription', updates.pageDescription);
    }

    // Update FAQ items
    if (updates.faqs !== undefined) {
        content = replaceFaqs(content, 'faqs', updates.faqs);
    }

    // Update links
    if (updates.links !== undefined) {
        content = replaceTitleDescArray(content, 'links', updates.links);
    }

    // Update trustSignals
    if (updates.trustSignals !== undefined) {
        content = replaceTitleDescArray(content, 'trustSignals', updates.trustSignals);
    }

    // Update HTML text
    if (updates.htmlSections) {
        for (const section of updates.htmlSections) {
            if (section.originalText && section.text !== section.originalText) {
                content = content.replace(section.originalText, section.text);
            }
        }
    }

    return content;
}

/**
 * Replace a string constant value in the source
 */
function replaceStringConst(content: string, varName: string, newValue: string): string {
    // Pattern: const varName = "old value";
    // or: const varName = t.key || "old value";
    const patterns = [
        // Simple: const varName = "...";
        new RegExp(`(const\\s+${varName}\\s*=\\s*)["'\`]([\\s\\S]*?)["'\`](\\s*;)`, 'm'),
        // With i18n fallback: const varName = t.key || "...";
        new RegExp(`(const\\s+${varName}\\s*=\\s*[^;]*?\\|\\|\\s*)["'\`]([\\s\\S]*?)["'\`](\\s*;)`, 'm'),
        // Multiline: const varName =\n  "...";
        new RegExp(`(const\\s+${varName}\\s*=\\s*\\n\\s*)["'\`]([\\s\\S]*?)["'\`](\\s*;)`, 'm'),
        // Multiline with i18n: const varName =\n  t.key ||\n  "...";
        new RegExp(`(const\\s+${varName}\\s*=\\s*\\n\\s*[^;]*?\\|\\|\\s*\\n?\\s*)["'\`]([\\s\\S]*?)["'\`](\\s*;)`, 'm'),
    ];

    for (const re of patterns) {
        const match = content.match(re);
        if (match) {
            // Determine the quote character used
            const quoteChar = content.charAt(match.index! + match[1].length);
            return content.replace(re, `$1${quoteChar}${newValue}${quoteChar}$3`);
        }
    }
    return content;
}

/**
 * Replace FAQ array items in the source
 */
function replaceFaqs(content: string, varName: string, faqs: FaqItem[]): string {
    const arrayRe = new RegExp(`(const\\s+${varName}\\s*=\\s*)\\[([\\s\\S]*?)\\](\\s*;)`, 'm');
    const match = content.match(arrayRe);
    if (!match) return content;

    const faqStr = faqs.map(f =>
        `  {\n    question: "${f.question.replace(/"/g, '\\"')}",\n    answer:\n      "${f.answer.replace(/"/g, '\\"')}",\n  }`
    ).join(',\n');

    return content.replace(arrayRe, `$1[\n${faqStr},\n]$3`);
}

/**
 * Replace title/description array items in the source
 */
function replaceTitleDescArray(content: string, varName: string, items: LinkItem[]): string {
    // For links/trustSignals, we only update the text values, not restructure
    // We do individual find-replace for each title/description
    let result = content;

    const arrayRe = new RegExp(`const\\s+${varName}\\s*=\\s*\\[([\\s\\S]*?)\\];`, 'm');
    const arrayMatch = content.match(arrayRe);
    if (!arrayMatch) return result;

    // Extract original items to find what to replace
    const origItems = extractTitleDescArray(content.split('---')[1] || '', varName);

    for (let i = 0; i < Math.min(origItems.length, items.length); i++) {
        if (origItems[i].title !== items[i].title) {
            result = result.replace(origItems[i].title, items[i].title);
        }
        if (origItems[i].description !== items[i].description) {
            result = result.replace(origItems[i].description, items[i].description);
        }
    }

    return result;
}

export type { ExtractedContent, FaqItem, LinkItem };
