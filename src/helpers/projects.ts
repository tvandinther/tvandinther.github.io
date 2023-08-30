import { type CollectionEntry, getCollection } from "astro:content";

export async function getAllProjects() {
    return await getCollection('projects')
}

export const byLatest = (a: CollectionEntry<"projects">, b: CollectionEntry<"projects">) => a.data.date < b.data.date ? 1 : -1;