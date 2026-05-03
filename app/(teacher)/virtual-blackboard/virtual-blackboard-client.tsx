'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Gr8MathHeader } from '@/components/ui/Gr8MathHeader';
import { BlackboardCard, BlackboardData } from '@/components/card/BlackboardCard';
import { fetchBlackboardsAction, createBlackboardAction } from './action';
import { Gr8LoadingOverlay } from '@/components/ui/Gr8LoadingOverlay';

const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-white/40 border-2 border-dashed border-[#B0B8C1] rounded-3xl p-10 md:p-16 max-w-md">
            <h2 className="text-[20px] font-black text-[#222] mb-3 uppercase">No content yet.</h2>
            <p className="text-[14px] text-[#666]">Tap <span className="font-black text-[#1A4C8B]">'Add'</span> to create your first Virtual Blackboard.</p>
        </div>
    </div>
);

export default function VirtualBlackboardSelectionPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const isCreatingRef = useRef(false);

    // We need to know which class this blackboard belongs to!
    const courseId = parseInt(searchParams.get('courseId') || '0');

    const [boards, setBoards] = useState<BlackboardData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // --- FETCH BOARDS ON LOAD ---
    useEffect(() => {
        if (courseId === 0) return;
        const loadBoards = async () => {
            setIsLoading(true);
            const res = await fetchBlackboardsAction(courseId);
            if (res.success && res.data) {
                const mappedBoards = res.data.map((b: any) => {
                    const savedDate = b.drawing_data?.lastSaved;
                    return {
                        id: b.id,
                        title: b.session_name,
                        date: savedDate ? `Saved ${savedDate}` : 'New Board',
                        previewUrl: b.drawing_data?.currentFrameUrl
                    };
                });
                setBoards(mappedBoards);
            }
            setIsLoading(false);
        };
        loadBoards();
    }, [courseId]);


    const handleAddBoard = async () => {
        if (courseId === 0) {
            alert("Error: Course ID is missing.");
            return;
        }

        // 1. INSTANT GATEKEEPER: Check the Ref first
        if (isCreatingRef.current || isLoading) return;

        // 2. LOCK THE GATE IMMEDIATELY
        isCreatingRef.current = true;
        setIsLoading(true);

        const nextNumber = boards.length + 1;
        const newTitle = `Untitled Board ${nextNumber}`;

        try {
            const res = await createBlackboardAction(courseId, newTitle);

            if (res.success && res.data) {
                // Success: Navigate away (Ref remains true to prevent clicks during transition)
                router.push(`/virtual-blackboard/editor?boardId=${res.data.id}&title=${encodeURIComponent(newTitle)}&courseId=${courseId}`);
            } else {
                throw new Error("Failed to create");
            }
        } catch (error) {
            alert("Failed to create board.");
            // 3. UNLOCK only if there was an error so they can try again
            isCreatingRef.current = false;
            setIsLoading(false);
        }
    };
    const handleBoardClick = (boardId: number, boardTitle: string) => {
        router.push(`/virtual-blackboard/editor?boardId=${boardId}&title=${encodeURIComponent(boardTitle)}&courseId=${courseId}`);
    };

    return (
        <div className="min-h-screen bg-[#E2E7E9] font-sans flex flex-col relative overflow-x-hidden">
            <Gr8MathHeader />
            <Gr8LoadingOverlay isLoading={isLoading} message="Loading..." />
            <main className="flex-1 w-full max-w-7xl mx-auto px-6 md:px-12 py-8 animate-in fade-in duration-500">

                <div className="flex items-center gap-3 mb-10">
                    <button
                        aria-label='back'
                        onClick={() => {
                            if (courseId && courseId !== 0) {
                                // WE USE 'id' HERE BECAUSE THAT IS WHAT CLASS-PAGE EXPECTS
                                window.location.href = `/class-page?id=${courseId}`;
                            } else {
                                window.location.href = '/class-manager';
                            }
                        }}
                        className="p-1.5 -ml-1.5 text-[#0A7F93] hover:bg-black/5 rounded-lg transition-colors outline-none cursor-pointer"
                    >
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </button>
                    <h1 className="text-[20px] md:text-[22px] font-black text-[#222] m-0">Virtual Blackboard</h1>
                </div>

                {!isLoading && boards.length === 0 && (
                    <EmptyState />
                )}

                {!isLoading && boards.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10 pb-24">
                        {boards.map((board) => (
                            <BlackboardCard key={board.id} board={board} onClick={() => handleBoardClick(board.id, board.title)} />
                        ))}
                    </div>
                )}
            </main>

            <div className="fixed bottom-10 right-6 md:right-12 z-50">
                <button
                    onClick={handleAddBoard}
                    disabled={isLoading} // Prevents the browser from sending click events
                    className={`bg-[#1A4C8B] text-white px-6 py-2.5 rounded-full font-black text-[13px] tracking-wide shadow-lg transition-all flex items-center gap-x-2 outline-none ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl hover:-translate-y-0.5 hover:bg-[#153a6b] cursor-pointer'}`}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    {isLoading ? 'CREATING...' : 'ADD'}
                </button>
            </div>
        </div>
    );
}