'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Gr8MathHeader } from '@/components/ui/Gr8MathHeader';
import { BlackboardCard, BlackboardData } from '@/components/card/BlackboardCard';

// --- INITIAL MOCK DATA ---
const INITIAL_BOARDS: BlackboardData[] = [
    { id: 1, title: 'Untitled Board 1', date: 'Jan. 1, 2026' },
    { id: 2, title: 'Untitled Board 2', date: 'Jan. 1, 2026' },
    { id: 3, title: 'Untitled Board 3', date: 'Jan. 1, 2026' },
];

export default function VirtualBlackboardSelectionPage() {
    const router = useRouter();
    
    // --- STATE ---
    const [boards, setBoards] = useState<BlackboardData[]>(INITIAL_BOARDS);

    // --- HANDLERS ---
    const handleAddBoard = () => {
        const nextId = boards.length > 0 ? Math.max(...boards.map(b => b.id)) + 1 : 1;
        
        const newBoard: BlackboardData = {
            id: nextId,
            title: `Untitled Board ${nextId}`,
            date: 'Jan. 1, 2026' 
        };

        setBoards([...boards, newBoard]);
    };

    const handleBoardClick = (boardTitle: string) => {
        // We pass the title in the URL so the editor knows what to display!
        router.push(`/virtual-blackboard/editor?title=${encodeURIComponent(boardTitle)}`);
    };

    return (
        <div className="min-h-screen bg-[#E2E7E9] font-sans flex flex-col relative overflow-x-hidden">
            
            <Gr8MathHeader />

            <main className="flex-1 w-full max-w-7xl mx-auto px-6 md:px-12 py-8 animate-in fade-in duration-500">
                
                {/* --- TOP BAR: Back Button & Title --- */}
                <div className="flex items-center gap-3 mb-10">
                    <button 
                        onClick={() => router.push('/class-manager')} // Or wherever they should go back to
                        className="p-1.5 -ml-1.5 text-[#0A7F93] hover:bg-black/5 rounded-lg transition-colors outline-none cursor-pointer"
                    >
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </button>
                    <h1 className="text-[20px] md:text-[22px] font-black text-[#222] m-0">Virtual Blackboard</h1>
                </div>

                {/* --- GRID: Blackboard Cards --- */}
                {boards.length === 0 ? (
                    <div className="text-center py-20 text-[#666] font-medium">
                        No boards yet. Click "Add" to create your first Virtual Blackboard.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10 pb-24">
                        {boards.map((board) => (
                            <BlackboardCard 
                                key={board.id} 
                                board={board} 
                                onClick={() => handleBoardClick(board.title)} 
                            />
                        ))}
                    </div>
                )}

            </main>

            {/* --- FLOATING ADD BUTTON --- */}
            <div className="fixed bottom-10 right-6 md:right-12 z-50">
                <button 
                    onClick={handleAddBoard}
                    className="bg-[#1A4C8B] text-white px-6 py-2.5 rounded-full font-black text-[13px] tracking-wide shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:bg-[#153a6b] transition-all flex items-center gap-x-2 outline-none cursor-pointer"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    ADD
                </button>
            </div>

        </div>
    );
}