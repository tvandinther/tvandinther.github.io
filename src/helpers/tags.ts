import { getAllPosts } from "@helpers/posts";

export async function getAllTags() {
    const allPosts = await getAllPosts();
    return allPosts.map((post) => post.data.tags).flat();
}

export async function getAllTagsCounts() {
    const allTags = await getAllTags();
    return allTags.reduce((acc, tag) => {
        acc[tag] = (acc[tag] ?? 0) + 1;
        return acc;
        }, {} as Record<string, number>);
}