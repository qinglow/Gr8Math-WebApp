'use server'
import * as ClassService from "@/app/service/class-page";

// app/(teacher)/class-page/action.ts
export async function getClassFeed(courseId: string) {
    console.log("--- DEBUG: Fetching Feed for ID:", courseId); // LOG 1
    try {
        const feed = await ClassService.fetchClassFeed(courseId);
        console.log("--- DEBUG: Feed Result Count:", feed.length); // LOG 2
        return feed;
    } catch (e: any) {
        console.error("--- DEBUG: Feed Error:", e.message);
        return [];
    }
}

export async function getClassDetails(courseId: string) {
    console.log("--- DEBUG: Fetching Details for ID:", courseId); // LOG 3
    try {
        const details = await ClassService.fetchClassDetails(courseId);
        console.log("--- DEBUG: Details Result:", details); // LOG 4
        return details;
    } catch (e: any) {
        console.error("--- DEBUG: Details Error:", e.message);
        return null;
    }
}