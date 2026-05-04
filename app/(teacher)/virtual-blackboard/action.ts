'use server'

import * as BlackboardDB from "@/app/service/blackboard";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// --- TIGRIS S3 SETUP ---
const s3Client = new S3Client({
    region: "auto",
    endpoint: process.env.TIGRIS_ENDPOINT_URL,
    credentials: {
        accessKeyId: process.env.TIGRIS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.TIGRIS_SECRET_ACCESS_KEY!,
    },
});

// 1. NEW: Upload Blackboard Canvas to Tigris
export async function uploadBlackboardToTigrisAction(formData: FormData) {
    try {
        const file = formData.get('file') as File;
        const boardId = formData.get('boardId') as string;

        if (!file) throw new Error("No file provided");

        const buffer = Buffer.from(await file.arrayBuffer());

        // Save it in a specific blackboard folder to keep your bucket clean
        const fileName = `board_${boardId}.png`;
        const filePath = `blackboards/board_${boardId}/${fileName}`;
        const bucketName = process.env.TIGRIS_BUCKET_NAME;

        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: filePath,
            Body: buffer,
            ContentType: file.type,
        });

        await s3Client.send(command);

        const publicUrl = `https://${bucketName}.fly.storage.tigris.dev/${filePath}`;

        return { success: true, publicUrl };
    } catch (error: any) {
        console.error("Tigris Upload Error:", error);
        return { success: false, error: error.message };
    }
}


export async function saveBlackboardDataAction(boardId: number, imageUrl: string, title: string) {
    const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    });

    try {
        const payload = {
            currentFrameUrl: `${imageUrl}?t=${Date.now()}`,
            lastSaved: today
        };
        const { error } = await BlackboardDB.updateBlackboardData(boardId, payload, title);

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}


export async function fetchBlackboardsAction(sectionId: number) {
    try {
        const { data, error } = await BlackboardDB.getBlackboardsBySection(sectionId);
        if (error) throw error;
        return { success: true, data };
    } catch (error: any) {
        // Catch foreign key or not found errors
        if (error.message?.includes('not found') || error.message?.includes('violates')) {
             return { success: false, error: "CLASS_DELETED_FLAG" };
        }
        return { success: false, error: error.message };
    }
}

export async function createBlackboardAction(sectionId: number, sessionName: string) {
    try {
        const { data, error } = await BlackboardDB.insertBlackboard(sectionId, sessionName);
        if (error) throw error;
        return { success: true, data };
    } catch (error: any) {
        // Standardize the fatal flag for the frontend
        if (error.message?.includes('foreign key constraint') || error.message?.includes('violates')) {
            return { success: false, error: "CLASS_DELETED_FLAG" };
        }
        return { success: false, error: error.message };
    }
}

export async function fetchSingleBlackboardAction(boardId: number) {
    try {
        const { data, error } = await BlackboardDB.getBlackboardById(boardId);
        if (error) throw error;
        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}