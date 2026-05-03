'use server'

import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { handleActionError } from "@/lib/utils/errorHandler";

const s3Client = new S3Client({
    region: "auto",
    endpoint: process.env.TIGRIS_ENDPOINT_URL,
    credentials: {
        accessKeyId: process.env.TIGRIS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.TIGRIS_SECRET_ACCESS_KEY!,
    },
});

export async function uploadLessonMediaToTigris(formData: FormData) {
    try {
        const file = formData.get('file') as File;
        const courseId = formData.get('courseId') as string;

        if (!file) throw new Error("No file provided");

        // 2. Convert the file into a Buffer for the AWS SDK
        const buffer = Buffer.from(await file.arrayBuffer());

        // 3. Construct the exact same file path you used in Android
        const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
        const filePath = `course_${courseId}/${fileName}`;
        const bucketName = process.env.TIGRIS_BUCKET_NAME;

        // 4. Send to Tigris
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

export async function deleteMediaFromTigris(fileKey: string) {
    try {
        const command = new DeleteObjectCommand({
            Bucket: process.env.TIGRIS_BUCKET_NAME!, 
            Key: fileKey,
        });

        await s3Client.send(command);
        return { success: true };
    } catch (error: any) {
        console.error("Failed to delete from Tigris:", error);
        return { success: false, error: error.message };
    }
}