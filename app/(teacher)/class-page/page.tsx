export const dynamic = 'force-dynamic';

import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getClassFeed, getClassDetails } from "./action";
import ClassPageClient from "./class-page-client";
import { Gr8LoadingOverlay } from "@/components/ui/Gr8LoadingOverlay";

export default async function Page({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
    const { id } = await searchParams;
    const supabase = await createClient();

    // 1. ADD THE BOUNCER: Check for session first
    const { data: { user } } = await supabase.auth.getUser();
    
    // If testing for NFT-SEC-01 (Strict 401), use unauthorized()
    // If testing for general UX, use redirect('/auth/login')
    if (!user) {
        redirect('/auth/login'); 
    }

    if (!id) {
        redirect('/class-manager');
    }

    return (
        <Suspense fallback={<Gr8LoadingOverlay isLoading={true} message="Loading..." />}>
            <ClassContentLoader courseId={id} />
        </Suspense>
    );
}
async function ClassContentLoader({ courseId }: { courseId: string }) {
    const [feed, details] = await Promise.all([
        getClassFeed(courseId),
        getClassDetails(courseId)
    ]);

    const sectionName = (details as any)?.class?.[0]?.class_name || "Classroom";

    return (
        <ClassPageClient 
            initialFeed={feed} 
            sectionName={sectionName} 
            courseId={courseId} 
        />
    );
}