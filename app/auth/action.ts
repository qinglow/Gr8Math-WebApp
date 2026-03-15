'use server'

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { z } from "zod"
import * as AuthService from "@/app/service/auth";


export async function login(formData: FormData) {
    const supabase = await createClient();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) return { error: "Email or Password not found" };

    const { data: user, error: userError } = await AuthService.getUserProfile(email);

    if (userError || !user) return { error: "Email or Password not found" };

    redirect(`/class-manager`);
}

const RegistrationSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string()
        .min(8, "Minimum 8 characters")
        .max(16, "Maximum 16 characters")
        .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z\d]).*$/,
            "Password must have 1 Upper, 1 Lower, 1 Number, and 1 Special Character"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    gender: z.string().min(1, "Gender is required"),
    birthdate: z.string().min(1, "Birthdate is required"),
    role: z.enum(["Student", "Teacher"]),
    extra: z.string().min(1, "This field is required"),
}).refine((data) => {
    if (data.role === 'Student') {
        return /^\d{12}$/.test(data.extra);
    }
    return true;
}, {
    message: "LRN must be exactly 12 digits",
    path: ["extra"],
});

export async function register(formData: FormData) {
    const supabase = await createClient()
    const rawData = Object.fromEntries(formData.entries())
    const validated = RegistrationSchema.safeParse(rawData)

    if (!validated.success) return { error: validated.error.issues[0].message };

    const { email, password, firstName, lastName, gender, birthdate, role, extra } = validated.data

    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password })
    if (authError) return { error: authError.message }
    if (!authData.user) return { error: "User creation failed" }

    const { data: userData, error: userError } = await AuthService.insertUser({
        auth_id: authData.user.id,
        first_name: firstName,
        last_name: lastName,
        email_add: email,
        gender: gender,
        birthdate: birthdate,
        roles: role,
        first_login: true
    });

    if (userError) return { error: userError.message }

    const roleData = role === 'Student'
        ? { user_id: userData.id, learners_ref_number: extra, grade_level: 8 }
        : { user_id: userData.id, teaching_position: extra };

    const { error: roleError } = await AuthService.insertRoleSpecificData(role, roleData);
    if (roleError) return { error: `${role} data failed` }

    return { success: true }
}


export async function checkAvailability(type: 'email' | 'lrn', value: string) {
    const table = type === 'email' ? 'user' : 'student';
    const column = type === 'email' ? 'email_add' : 'learners_ref_number';

    const exists = await AuthService.checkValueExists(table, column, value);
    return { exists };
}

export async function sendResetCode(formData: FormData) {
    const supabase = await createClient();
    const email = formData.get('email') as string;

    if (!email) return { error: "Please enter your email" };

    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) return { error: error.message };

    return { success: true };
}

export async function verifyResetCode(formData: FormData) {
    const supabase = await createClient();
    const email = formData.get('email') as string;
    const code = formData.get('code') as string;

    if (!code) return { error: "Please enter the code" };

    const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'recovery',
    });

    if (error) return { error: "Invalid code or expired" };
    return { success: true };
}

export async function updatePassword(formData: FormData) {
    const supabase = await createClient();
    const password = formData.get('password') as string;

    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { error: error.message };

    const message = encodeURIComponent("Password updated successfully");
    redirect(`/auth/login?msg=${message}`);
}