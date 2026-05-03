'use server'

import * as ClassService from "@/app/service/classes";
import { revalidatePath } from "next/cache";

export async function getTeacherClasses(userId: string, searchQuery?: string) {
    try {
        return await ClassService.fetchTeacherClasses(userId, searchQuery);
    } catch (error) {
        console.error("Action Error (getTeacherClasses):", error);
        return [];
    }
}

export async function getSearchHistory(userId: string) {
    return await ClassService.fetchSearchHistory(userId);
}

export async function saveSearchHistory(userId: string, term: string) {
    if (!term.trim()) return;
    await ClassService.insertSearchHistory(userId, term);
}

export async function createClass(userId: string, className: string, size: number, start: string, end: string) {
    try {
        const { classCode } = await ClassService.insertClass(userId, className, size, start, end);
        

        revalidatePath('/class-manager'); 
        
        return { success: true, classCode };
    } catch (error: any) {
        console.error("Action Error (createClass):", error);
        return { success: false, error: error.message };
    }
}



export async function editClass(classId: string, className: string, size: number, start: string, end: string) {
    try {
        await ClassService.updateClass(classId, className, size, start, end);
        revalidatePath('/class-manager');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function removeClass(classId: string) {
    try {
        await ClassService.deleteClass(classId);
        revalidatePath('/class-manager');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}