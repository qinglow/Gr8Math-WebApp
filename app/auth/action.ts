'use server'

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { z } from "zod"
import * as AuthService from "@/app/service/auth";
import { logAuditTrail } from "@/app/service/audit-trails";


export async function login(formData: FormData) {
    const supabase = await createClient();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
        const { data: existingUser } = await AuthService.getUserProfile(email);
        const targetUserId = existingUser ? existingUser.id : null;

        await logAuditTrail(
            targetUserId,
            'Authentication',
            'LOGIN',
            'FAILED',
            `Failed login attempt for ${email}.`
        );

        return { error: "Email or Password not found" };
    }

    const { data: user, error: userError } = await AuthService.getUserProfile(email);

    if (userError || !user) return { error: "Email or Password not found" };

    // --- NEW: STRICT MFA ENFORCEMENT FOR TEACHERS ---
    if (user.roles === 'Teacher') {
        const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();

        if (factorsError || !factorsData) {
            await supabase.auth.signOut();
            return { error: "Failed to check security settings." };
        }

        const allFactors = (factorsData as any).all || (factorsData as any).factors || [];

        // 1. Check for active, verified Authenticator app
        const totpFactor = allFactors.find(
            (f: any) => f.factor_type === 'totp' && f.status === 'verified'
        );

        if (totpFactor) {
            // Verified exists: Force them to enter the code
            return { mfaRequired: true, mfaType: 'verify', factorId: totpFactor.id };
        }

        // 2. Clean up any abandoned "unverified" attempts from past logins
        const unverifiedFactors = allFactors.filter((f: any) => f.factor_type === 'totp' && f.status === 'unverified');
        for (const uf of unverifiedFactors) {
            await supabase.auth.mfa.unenroll({ factorId: uf.id });
        }

        // 3. Generate a fresh QR Code for them to scan
        const { data: enrollData, error: enrollError } = await supabase.auth.mfa.enroll({
            factorType: 'totp'
        });

        if (enrollError || !enrollData) {
            await supabase.auth.signOut(); // Securely wipe the partial session
            return { error: "Failed to load MFA setup. Please try again." };
        }

        // Return QR Code SVG to frontend
        return {
            mfaRequired: true,
            mfaType: 'setup',
            factorId: enrollData.id,
            qrCode: enrollData.totp.qr_code
        };
    }

    await logAuditTrail(
        user.id,
        'Authentication',
        'LOGIN',
        'SUCCESS',
        'Successful Login.'
    );

    if (user.roles === 'Admin') {
        redirect('/dashboard');
    } else if (user.roles === 'Student') {
        redirect('/auth/access-denied');
    }

    redirect('/class-manager');
}

export async function verifyMfaAction(factorId: string, code: string) {
    const supabase = await createClient();

    const { data: { user: authUser } } = await supabase.auth.getUser();
    let profileId: number | null = null;
    let userRole: string = '';

    if (authUser && authUser.email) {
        const { data: profile } = await AuthService.getUserProfile(authUser.email);
        if (profile) {
            profileId = profile.id;
            userRole = profile.roles;
        }
    }

    try {
        const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
        if (challengeError) return { error: "Invalid authentication session." };

        const { error: verifyError } = await supabase.auth.mfa.verify({
            factorId,
            challengeId: challengeData.id,
            code
        });

        if (verifyError) {
            if (profileId) {
                await logAuditTrail(
                    profileId,
                    'Authentication',
                    'MFA_VERIFY',
                    'FAILED',
                    'Failed MFA verification attempt.'
                );
            }
            return { error: "Incorrect code. Please try again." };
        }

    } catch (err: any) {
        return { error: "An unexpected error occurred." };
    }

    if (profileId) {
        await logAuditTrail(
            profileId,
            'Authentication',
            'LOGIN',
            'SUCCESS',
            'Successful Login via MFA.'
        );
    }

    if (userRole === 'Admin') {
        redirect('/dashboard');
    } else if (userRole === 'Student') {
        redirect('/auth/access-denied');
    }

    redirect('/class-manager');
}

// --- NEW: Securely destroy partial session if user backs out ---
export async function cancelLoginAction() {
    const supabase = await createClient();
    await supabase.auth.signOut();
}


// --- EVERYTHING BELOW THIS LINE IS UNTOUCHED ---

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
    if (error) {
        const { data: existingUser } = await AuthService.getUserProfile(email);
        const targetUserId = existingUser ? existingUser.id : null;
        await logAuditTrail(targetUserId, 'Authentication', 'REQUEST_RESET', 'FAILED', `Failed OTP request: ${error.message}`);
        return { error: error.message };
    }

    const { data: existingUser } = await AuthService.getUserProfile(email);
    if (existingUser) {
        await logAuditTrail(existingUser.id, 'Authentication', 'REQUEST_RESET', 'SUCCESS', 'Requested password reset OTP.');
    }

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

    if (error) {
        const { data: existingUser } = await AuthService.getUserProfile(email);
        const targetUserId = existingUser ? existingUser.id : null;
        await logAuditTrail(targetUserId, 'Authentication', 'VERIFY_RESET', 'FAILED', 'Failed OTP verification.');
        return { error: "Invalid code or expired" };
    }
    return { success: true };
}

export async function updatePassword(formData: FormData) {
    const supabase = await createClient();
    const password = formData.get('password') as string;

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
        if (user && user.email) {
            const { data: profile } = await AuthService.getUserProfile(user.email);
            if (profile) {
                await logAuditTrail(profile.id, 'Authentication', 'UPDATE_PASSWORD', 'FAILED', `Password update failed: ${error.message}`);
            }
        }
        return { error: error.message };
    }

    if (user && user.email) {
        const { data: profile } = await AuthService.getUserProfile(user.email);
        if (profile) {
            await logAuditTrail(profile.id, 'Authentication', 'UPDATE_PASSWORD', 'SUCCESS', 'Password updated successfully.');
        }
    }

    const message = encodeURIComponent("Password updated successfully");
    redirect(`/auth/login?msg=${message}`);
}