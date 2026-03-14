// app/auth/action.ts
'use server'

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: "Email or Password not found" }
    }

    redirect('/dashboard') 
}

export async function sendResetCode(formData: FormData) {
    const supabase = await createClient();
    const email = formData.get('email') as string;

    if (!email || email.trim() === '') {
        return { error: "Please enter your email" };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
        return { error: error.message || "Failed to send code" };
    }
    return { success: true };
}

export async function verifyResetCode(formData: FormData) {
    const supabase = await createClient();
    const email = formData.get('email') as string;
    const code = formData.get('code') as string;

    if (!code || code.trim() === '') {
        return { error: "Please enter the code" };
    }

    const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'recovery',
    });

    if (error) {
        return { error: "Invalid code or expired" };
    }
    return { success: true };
}

export async function updatePassword(formData: FormData) {
    const supabase = await createClient();
    const password = formData.get('password') as string;

    const { error } = await supabase.auth.updateUser({
        password: password
    });

    if (error) {
        return { error: error.message || "Failed to update password" };
    }
    

    redirect('/auth/login'); 
}