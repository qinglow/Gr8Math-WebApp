'use server'

import { createClient } from "@/lib/supabase/server";

export async function checkContentModeration(text: string) {
    const supabase = await createClient();

    const { data: bannedWords } = await supabase.from('banned_words').select('word');
    const wordList = bannedWords?.map(d => d.word) || [];
    const lowercaseText = text.toLowerCase();
    const offendingWord = wordList.find(banned => lowercaseText.includes(banned.toLowerCase()));

    const linkRegex = /(?:https?:\/\/|www\.)[^\s"<>]+/g;
    const matches = text.match(linkRegex) || [];

    const suspiciousLinks = matches.filter(link =>
        !link.includes('fly.storage.tigris.dev') &&
        !link.includes('math.now.sh')
    );

    if (offendingWord || suspiciousLinks.length > 0) {
        return {
            isSafe: false,
            offendingWord: offendingWord || (suspiciousLinks.length > 0 ? suspiciousLinks[0] : 'Suspicious Link'),
            reasonCode: suspiciousLinks.length > 0 ? 'Suspicious Link' : 'Banned Word'
        };
    }

    return { isSafe: true };
}

export async function decideModeration(actionId: number, decision: 'allowed' | 'disapproved') {
    const supabase = await createClient();
    const { data: action } = await supabase.from('moderation_actions').select('*').eq('id', actionId).single();

    if (!action) return;

    const table = action.content_type === 'lesson' ? 'lesson' : 'assessment_created';

    if (decision === 'allowed') {
        await supabase.from(table).update({ status: 'approved' }).eq('id', action.content_id);
        await supabase.from('moderation_actions').update({ status: 'allowed' }).eq('id', actionId);

        const { data: contentData } = await supabase.from(table).select('course_id').eq('id', action.content_id).single();
        if (contentData) {
            const { data: bridge } = await supabase.from('course_content').select('section_id').eq('id', contentData.course_id).single();
            if (bridge) {
                const { data: students } = await supabase.from('student_class').select('student(user_id)').eq('class_id', bridge.section_id);
                if (students && students.length > 0) {
                    const notifications = students.map((s: any) => ({
                        user_id: s.student.user_id,
                        type: action.content_type,
                        title: `New ${action.content_type === 'lesson' ? 'Lesson' : 'Assessment'} Approved`,
                        message: `A new ${action.content_type} is now available.`,
                        meta: {
                            course_id: contentData.course_id,
                            section_id: bridge.section_id,
                            content_id: action.content_id
                        }
                    }));
                    await supabase.from('notifications').insert(notifications);
                }
            }
        }

    } else {
        await supabase.from(table).delete().eq('id', action.content_id);
        await supabase.from('moderation_actions').update({ status: 'disapproved' }).eq('id', actionId);

        const { data: userData } = await supabase.from('user').select('warning_count').eq('id', action.target_user_id).single();
        const newCount = (userData?.warning_count || 0) + 1;
        const shouldRestrict = newCount >= 3;

        await supabase.from('user').update({
            warning_count: newCount,
            is_restricted: shouldRestrict,
            restricted_at: shouldRestrict ? new Date().toISOString() : null
        }).eq('id', action.target_user_id);

        await supabase.from('notifications').insert({
            user_id: action.target_user_id,
            type: 'warning',
            title: 'Content Removed',
            message: `Your content was removed due to a ${action.reason_code}.|${newCount}`,
            meta: { flash_ui: true }
        });
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (user && user.email) {
        const { data: modUser } = await supabase.from('user').select('id').eq('email_add', user.email).single();

        if (modUser) {
            await supabase.from('audit_trails').insert({
                user_id: modUser.id,
                resource: 'Moderation',
                action: decision === 'allowed' ? 'APPROVE' : 'DISAPPROVE',
                status: 'SUCCESS',
                details: `Moderator ${decision} a flagged ${action.content_type} (Action ID: ${actionId})`
            });
        }
    }
}

export async function checkAndLiftRestriction(userId: number) {
    const supabase = await createClient();

    const { data: user } = await supabase.from('user')
        .select('is_restricted, restricted_at')
        .eq('id', userId)
        .single();

    if (!user || !user.is_restricted || !user.restricted_at) {
        return { stillRestricted: false, hoursRemaining: 0, minutesRemaining: 0 };
    }

    const restrictionDate = new Date(user.restricted_at).getTime();
    const now = new Date().getTime();
    const diffMs = now - restrictionDate;

    const minutesPassed = diffMs > 0 ? Math.floor(diffMs / (1000 * 60)) : 0;
    const totalMinutesInDay = 1440;

    if (minutesPassed >= totalMinutesInDay) {
        await supabase.from('user').update({
            is_restricted: false,
            restricted_at: null,
            warning_count: 0
        }).eq('id', userId);
        return { stillRestricted: false, hoursRemaining: 0, minutesRemaining: 0 };
    }

    const minutesRemainingTotal = totalMinutesInDay - minutesPassed;
    const h = Math.floor(minutesRemainingTotal / 60);
    const m = minutesRemainingTotal % 60;

    return {
        stillRestricted: true,
        hoursRemaining: h,
        minutesRemaining: m
    };
}

/**
 * Fetch the list for the Dashboard UI
 */
export async function getCustomBannedWords() {
    const supabase = await createClient();
    const { data } = await supabase.from('banned_words').select('word');
    return data?.map(d => d.word) || [];
}

/**
 * Add a new word to the DB
 */
export async function addBannedWord(word: string) {
    const supabase = await createClient();
    return await supabase.from('banned_words').insert({ word: word.toLowerCase() });
}

/**
 * Remove a word from the DB
 */
export async function removeBannedWord(word: string) {
    const supabase = await createClient();
    return await supabase.from('banned_words').delete().eq('word', word);
}


//future uses
export async function getPendingViolations() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('moderation_actions')
        .select(`
            id,
            content_type,
            violation_details,
            reason_code,
            target_user:user!moderation_actions_target_user_id_fkey(first_name, last_name)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((v: any) => ({
        id: v.id,
        studentName: `${v.target_user?.first_name || 'Unknown'} ${v.target_user?.last_name || ''}`.trim(),
        description: v.violation_details, // This holds the full context 
        issue: `Content contains ${v.reason_code}`,
        offendingWord: v.reason_code // Or extract the specific word if you want
    }));
}

export async function submitAppealAction(reason: string, imageUrl: string | null) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "User not authenticated." };

    const { data: dbUser } = await supabase.from('user').select('id').eq('email_add', user.email).single();

    // Prevent users from spamming multiple appeals
    const { data: existing } = await supabase.from('moderation_actions')
        .select('id')
        .eq('target_user_id', dbUser?.id)
        .eq('action_type', 'appeal')
        .eq('status', 'pending')
        .single();

    if (existing) return { error: "You already have a pending appeal." };

    const formattedDetails = imageUrl
        ? `${reason}\n\n[PROOF IMAGE]\n${imageUrl}`
        : reason;

    // Insert the appeal into the database
    const { error } = await supabase.from('moderation_actions').insert({
        target_user_id: dbUser?.id,
        action_type: 'appeal',           // Tags it as an appeal
        content_type: 'account',         // Applies to the whole account
        violation_details: formattedDetails, // The user's typed reason + Image URL
        reason_code: 'Restriction Appeal',
        status: 'pending'
    });

    if (error) return { error: error.message };
    return { success: true };
}