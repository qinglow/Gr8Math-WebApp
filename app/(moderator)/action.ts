'use server';

import { getModeratorProfile, updateModeratorProfile } from '@/app/service/profile';
import { uploadProfileImageToTigris } from '@/app/service/upload'; 
import { revalidatePath } from 'next/cache';

// Fetch Action
export async function fetchProfileData() {
    try {
        const data = await getModeratorProfile();
        return { success: true, data };
    } catch (error: any) {
        console.error("Fetch Profile Error:", error);
        return { success: false, error: error.message || "Failed to load profile" };
    }
}

// Update Action
export async function saveProfileData(formData: FormData) {
    try {
        // Extract text fields
        const first_name = formData.get('first_name') as string;
        const last_name = formData.get('last_name') as string;
        const gender = formData.get('gender') as string;
        const birthdate = formData.get('birthdate') as string;
        
        // Extract the file
        const file = formData.get('profile_pic') as File | null;

        if (!first_name || !last_name) {
            return { success: false, error: "First and Last name are required." };
        }

        let profile_pic_url: string | undefined = undefined;

        // If a new file is attached, upload it to Tigris
        if (file && file.size > 0) {
            const uploadResult = await uploadProfileImageToTigris(file);
            if (!uploadResult.success) {
                return { success: false, error: uploadResult.error || "Failed to upload image to Tigris" };
            }
            profile_pic_url = uploadResult.publicUrl;
        }

        // Update the database
        await updateModeratorProfile({
            first_name,
            last_name,
            gender,
            birthdate,
            ...(profile_pic_url && { profile_pic: profile_pic_url }) 
        });

        // Refresh the UI caches
        revalidatePath('/account-settings');
        revalidatePath('/dashboard'); 

        return { success: true };
    } catch (error: any) {
        console.error("Save Profile Error:", error);
        return { success: false, error: error.message || "Failed to save profile" };
    }
}