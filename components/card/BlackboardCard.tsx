import React from 'react';

// Define what data a board needs
export interface BlackboardData {
    id: number;
    title: string;
    date: string;
}

interface BlackboardCardProps {
    board: BlackboardData;
    onClick: () => void;
}

export function BlackboardCard({ board, onClick }: BlackboardCardProps) {
    return (
        <div onClick={onClick} className="flex flex-col group cursor-pointer w-full max-w-[380px]">
            {/* Thumbnail Placeholder - Color updated to F4EFED */}
            <div className="bg-[#F4EFED] border border-[#DCD3CC] aspect-[4/2.5] w-full rounded shadow-sm mb-3 group-hover:shadow-md transition-all group-hover:-translate-y-1"></div>
            
            {/* Details */}
            <div className="px-1">
                {/* Added a hover color effect to the title to indicate it's clickable */}
                <h3 className="font-extrabold text-[#222] text-[15px] leading-snug tracking-tight mb-0.5 group-hover:text-[#0A7F93] transition-colors">
                    {board.title}
                </h3>
                <span className="text-[12px] font-semibold text-[#888]">
                    {board.date}
                </span>
            </div>
        </div>
    );
}