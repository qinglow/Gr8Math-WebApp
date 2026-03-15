import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getClassFeed, getClassDetails } from "./action";
import ClassPageClient from "./class-page-client";
import { Gr8LoadingOverlay } from "@/components/ui/Gr8LoadingOverlay";


export default async function Page({ 
    searchParams 
}: { 
    searchParams: Promise<{ id?: string }> 
}) {
  
    const { id } = await searchParams;

    if (!id) {
        redirect('/class-manager');
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        redirect('/auth/login');
    }

    return (
        <Suspense fallback={<Gr8LoadingOverlay isLoading={true} message="Loading..." />}>
            <ClassContentLoader courseId={id} />
        </Suspense>
    );
}

async function ClassContentLoader({ courseId }: { courseId: string }) {
    // 3. Fetch data using the query ID
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