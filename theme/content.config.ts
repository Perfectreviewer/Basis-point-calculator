// 1. Import utilities from `astro:content`
import { defineCollection, z } from 'astro:content';

// 2. Import loader(s)
import { glob } from 'astro/loaders';

// 3. Define your collection(s)
const blog = defineCollection({
    schema: z.object({
        title: z.string(),
        description: z.string(),
        image: z.string(),
        date: z.date(),
        author: z.string(),
        category: z.string(),
    }),
    loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/blog" }),
});

// 4. Export a single `collections` object to register your collection(s)
const collections = { blog };

export default collections;