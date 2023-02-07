import { z, defineCollection } from 'astro:content';

const blogCollection = defineCollection({
    schema: z.object({
        title: z.string(),
        description: z.string(),
        date: z.date(),
        draft: z.boolean().optional(),
        author: z.string(),
        tags: z.array(z.string()),
        image: z.object({
            url: z.string(),
            alt: z.string()
        }).optional(),
        categories: z.array(z.string()),
    })
})

export const collections = {
    'blog': blogCollection
}