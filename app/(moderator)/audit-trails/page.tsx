'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Gr8MathHeader } from '@/components/ui/Gr8MathHeader';
import { AuditTableRow, AuditLogData } from '@/components/admin/AuditTableRow'; 

// Replace this path with the actual path to your action.ts file
import { getAllAuditTrails } from '@/app/service/audit-trails'; 

// Extend the interface locally so we can store the raw Date object for easy filtering
interface ExtendedAuditLogData extends AuditLogData {
    rawDate: Date;
}

const ITEMS_PER_PAGE = 10; // You can change how many items show per page here

export default function AuditTrailsPage() {
    const router = useRouter();

    // --- STATE: Data ---
    const [auditLogs, setAuditLogs] = useState<ExtendedAuditLogData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // --- STATE: Dropdown Filter ---
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('All Time'); // Default to showing everything
    const filterOptions = ['All Time', 'Today', 'Last Week', 'Last Month', 'Last Year'];
    const dropdownRef = useRef<HTMLDivElement>(null);

    // --- STATE: Pagination ---
    const [currentPage, setCurrentPage] = useState(1);

    // --- STATE: Live Bottom Clock ---
    const [currentTime, setCurrentTime] = useState('');

    // --- 1. Fetch real data on load ---
    useEffect(() => {
        async function fetchLogs() {
            setIsLoading(true);
            const rawLogs = await getAllAuditTrails();
            
            const formattedLogs: ExtendedAuditLogData[] = rawLogs.map((log: any) => {
                const dateObj = new Date(log.timestamp);
                return {
                    id: log.id,
                    datetime: dateObj.toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
                    user: log.user ? `${log.user.first_name} ${log.user.last_name || ''}`.trim() : 'System / Unknown',
                    resource: log.resource,
                    action: log.action,
                    details: log.details,
                    status: log.status,
                    rawDate: dateObj // Save the raw date for filtering logic
                };
            });

            setAuditLogs(formattedLogs);
            setIsLoading(false);
        }

        fetchLogs();
    }, []);

    // --- 2. Live Bottom Clock Logic ---
    useEffect(() => {
        const updateClock = () => {
            setCurrentTime(new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
        };
        updateClock(); // Set immediately
        const timer = setInterval(updateClock, 1000); // Update every second
        return () => clearInterval(timer);
    }, []);

    // Close dropdown if clicked outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // --- 3. FILTERING LOGIC ---
    const filteredLogs = auditLogs.filter(log => {
        if (selectedFilter === 'All Time') return true;

        const now = new Date();
        const logDate = log.rawDate;
        
        // Calculate difference in days
        const diffTime = Math.abs(now.getTime() - logDate.getTime());
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        switch (selectedFilter) {
            case 'Today': return diffDays <= 1;
            case 'Last Week': return diffDays <= 7;
            case 'Last Month': return diffDays <= 30;
            case 'Last Year': return diffDays <= 365;
            default: return true;
        }
    });

    // --- 4. PAGINATION LOGIC ---
    const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE) || 1;
    
    // Reset to page 1 if the filter changes and leaves us on an empty page
    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(1);
    }, [selectedFilter, totalPages, currentPage]);

    const paginatedLogs = filteredLogs.slice(
        (currentPage - 1) * ITEMS_PER_PAGE, 
        currentPage * ITEMS_PER_PAGE
    );

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(prev => prev - 1);
    };

    return (
        <div className="min-h-screen bg-[#E2E7E9] font-sans relative overflow-x-hidden flex flex-col">
            
            <Gr8MathHeader />

            <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 py-8 animate-in fade-in duration-500 flex flex-col">
                
                {/* --- TOP BAR: Back Button & Title & Dropdown --- */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    
                    {/* Back Button and Title */}
                    <div className="flex items-center gap-3">
                        <button 
                        aria-label='dww'
                            onClick={() => router.back()} 
                            className="p-1.5 -ml-1.5 text-[#0A7F93] hover:bg-black/5 rounded-lg transition-colors outline-none cursor-pointer"
                        >
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                        </button>
                        <h1 className="text-[22px] md:text-[26px] font-black text-[#222] m-0">Audit Trails</h1>
                    </div>

                    {/* Custom Filter Dropdown */}
                    <div className="relative w-full sm:w-48" ref={dropdownRef}>
                        <button 
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-full flex items-center justify-between bg-white border border-[#B0B8C1] px-4 py-2.5 rounded-lg text-[13px] font-bold text-[#222] hover:border-[#0A7F93] transition-colors outline-none shadow-sm"
                        >
                            {selectedFilter}
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#D1D8DD] rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                {filterOptions.map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => {
                                            setSelectedFilter(option);
                                            setCurrentPage(1); // Reset page on filter change
                                            setIsDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-3 text-[13px] font-semibold transition-colors outline-none
                                            ${selectedFilter === option ? 'bg-[#F4F6F8] text-[#0A7F93]' : 'text-[#444] hover:bg-gray-50'}
                                        `}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* --- TABLE CONTAINER --- */}
                <div className="bg-white border border-[#D1D8DD] rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-[#F4F6F8] border-b border-[#D1D8DD]">
                                    <th className="px-6 py-4 text-[13px] font-black text-[#222] uppercase tracking-wider w-[20%]">Date & Time</th>
                                    <th className="px-6 py-4 text-[13px] font-black text-[#222] uppercase tracking-wider w-[15%]">User</th>
                                    <th className="px-6 py-4 text-[13px] font-black text-[#222] uppercase tracking-wider w-[15%]">Resource</th>
                                    <th className="px-6 py-4 text-[13px] font-black text-[#222] uppercase tracking-wider w-[15%]">Action</th>
                                    <th className="px-6 py-4 text-[13px] font-black text-[#222] uppercase tracking-wider w-[20%]">Details</th>
                                    <th className="px-6 py-4 text-[13px] font-black text-[#222] uppercase tracking-wider w-[15%]">Status</th>
                                </tr>
                            </thead>
                            
                            <tbody className="divide-y divide-[#E8E8E8]">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-[#666] font-bold">
                                            Loading audit trails...
                                        </td>
                                    </tr>
                                ) : paginatedLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-[#666] font-bold">
                                            No audit trails found for this time period.
                                        </td>
                                    </tr>
                                ) : (
                                    // Map over paginatedLogs instead of the raw auditLogs
                                    paginatedLogs.map((log) => (
                                        <AuditTableRow key={log.id} log={log} />
                                    ))
                                )}
                            </tbody>

                        </table>
                    </div>
                </div>

                {/* --- BOTTOM BAR: Live Timestamp & Pagination --- */}
                <div className="flex flex-col sm:flex-row items-center justify-between mt-6 px-2 gap-4">
                    <div className="text-[13px] font-black text-[#222] font-mono">
                        {currentTime}
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <button 
                        aria-label='cew'
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className="w-9 h-9 flex items-center justify-center rounded-full border border-[#B0B8C1] text-[#0A7F93] hover:bg-white hover:border-[#0A7F93] transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-transparent outline-none"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        </button>
                        
                        <span className="text-[13px] font-bold text-[#222]">
                            {currentPage} <span className="font-medium text-[#666]">out of</span> {totalPages}
                        </span>

                        <button
                        aria-label='de' 
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className="w-9 h-9 flex items-center justify-center rounded-full border border-[#B0B8C1] text-[#0A7F93] hover:bg-white hover:border-[#0A7F93] transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-transparent outline-none"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </button>
                    </div>
                </div>

            </main>
        </div>
    );
}