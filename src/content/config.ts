import { z, defineCollection } from 'astro:content';

const blogCollection = defineCollection({
    schema: z.object({
        title: z.string(),
        description: z.string(),
        date: z.date(),
        lastUpdated: z.date().optional(),
        draft: z.boolean().optional(),
        author: z.string(),
        tags: z.array(z.string()),
        image: z.object({
            url: z.string(),
            alt: z.string()
        }).optional(),
        categories: z.array(z.string()),
        featured: z.boolean().optional(),
    })
})

const projectCollection = defineCollection({
    schema: z.object({
        title: z.string(),
        description: z.string(),
        date: z.date(),
        image: z.string().optional(),
        banner: z.string().optional(),
        url: z.string().optional(),
        sourceCodeUrl: z.string().optional(),
        featured: z.boolean().optional(),
    })
})

export const collections = {
    'blog': blogCollection,
    'projects': projectCollection,
}