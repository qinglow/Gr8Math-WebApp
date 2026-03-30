'use server'
import * as ClassService from "@/app/service/class-page";

export async function getClassFeed(courseId: string) {
    try {
        const feed = await ClassService.fetchClassFeed(courseId);
        return feed;
    } catch (e: any) {
        return [];
    }
}

export async function getClassDetails(courseId: string) {
    try {
        const details = await ClassService.fetchClassDetails(courseId);
        return details;
    } catch (e: any) {
        return null;
    }
}