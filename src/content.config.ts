import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const blogDir = path.join(__dirname, 'blog');

// glob loader expects a file URL if using absolute paths with special characters or drive letters on Windows
const blogBase = pathToFileURL(blogDir).href;

const blog = defineCollection({
    schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        image: z.string().optional(),
        date: z.date().or(z.string().transform(str => new Date(str))),
        author: z.string().optional(),
        authorTitle: z.string().optional(),
        authorBio: z.string().optional(),
        category: z.string().optional(),
        status: z.string().optional(),
        visibility: z.string().optional(),
        seoKeywords: z.string().optional(),
        seoTitle: z.string().optional(),
        ogTitle: z.string().optional(),
        ogDescription: z.string().optional(),
        tags: z.string().optional(),
    }),
    loader: glob({ pattern: "**/*.{md,mdx}", base: blogBase }),
});

export const collections = { blog };