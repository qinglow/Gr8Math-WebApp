'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Gr8MathHeader } from '@/components/ui/Gr8MathHeader';
import { AuditTableRow, AuditLogData } from '@/components/admin/AuditTableRow';
import { getAllAuditTrails } from '@/app/service/audit-trails';

interface ExtendedAuditLogData extends AuditLogData {
    rawDate: Date;
}

const ITEMS_PER_PAGE = 10;

export default function AuditTrailsPage() {
    const router = useRouter();

    // --- STATE: Data ---
    const [auditLogs, setAuditLogs] = useState<ExtendedAuditLogData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // --- STATE: Global Search ---
    const [globalSearch, setGlobalSearch] = useState('');

    // --- STATE: Dropdown Filter ---
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('All Time');
    const filterOptions = ['All Time', 'Today', 'Last Week', 'Last Month', 'Last Year'];
    const dropdownRef = useRef<HTMLDivElement>(null);

    // --- STATE: Column Filters (Excel Style) ---
    const [activeFilterCol, setActiveFilterCol] = useState<string | null>(null);
    const [filterUser, setFilterUser] = useState('');
    const [filterResource, setFilterResource] = useState('');
    const [filterAction, setFilterAction] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const tableRef = useRef<HTMLDivElement>(null);

    // --- STATE: Pagination & Clock ---
    const [currentPage, setCurrentPage] = useState(1);
    const [currentTime, setCurrentTime] = useState('');

    // --- 1. Fetch Logic (Extracted for Refresh Button) ---
    const fetchLogs = useCallback(async () => {
        setIsLoading(true);
        try {
            const rawLogs = await getAllAuditTrails();
            const formattedLogs: ExtendedAuditLogData[] = rawLogs.map((log: any) => {
                const dateObj = new Date(log.timestamp);
                return {
                    id: log.id,
                    datetime: dateObj.toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
                    user: log.user ? `${log.user.first_name} ${log.user.last_name || ''}`.trim() : 'System / Unknown',
                    resource: log.resource,
                    action: log.action,
                    details: log.details || '',
                    status: log.status,
                    rawDate: dateObj
                };
            });
            setAuditLogs(formattedLogs);
        } catch (error) {
            console.error("Failed to fetch logs", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial Fetch
    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    // --- 2. Live Bottom Clock Logic ---
    useEffect(() => {
        const updateClock = () => {
            setCurrentTime(new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
        };
        updateClock();
        const timer = setInterval(updateClock, 1000);
        return () => clearInterval(timer);
    }, []);

    // Close dropdowns if clicked outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
            if (tableRef.current && !tableRef.current.contains(event.target as Node)) {
                setActiveFilterCol(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // --- 3. FILTERING LOGIC ---
    const filteredLogs = auditLogs.filter(log => {
        // A. Time Filter Check
        let timeMatch = true;
        if (selectedFilter !== 'All Time') {
            const now = new Date();
            const logDate = log.rawDate;

            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const logDay = new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate());
            const diffDays = Math.floor((todayStart.getTime() - logDay.getTime()) / (1000 * 60 * 60 * 24));

            switch (selectedFilter) {
                case 'Today':
                    timeMatch = diffDays === 0;
                    break;
                case 'Last Week':
                    timeMatch = diffDays >= 0 && diffDays <= 6;
                    break;
                case 'Last Month':
                    timeMatch = diffDays >= 0 && diffDays <= 29;
                    break;
                case 'Last Year':
                    timeMatch = diffDays >= 0 && diffDays <= 364;
                    break;
            }
        }

        // B. Column Filter Check
        const userMatch = filterUser === '' || log.user === filterUser;
        const resourceMatch = filterResource === '' || log.resource === filterResource;
        const actionMatch = filterAction === '' || log.action === filterAction;
        const statusMatch = filterStatus === '' || log.status === filterStatus;

        // C. Global Search Check
        const searchLower = globalSearch.toLowerCase();
        const searchMatch = globalSearch === '' ||
            log.user.toLowerCase().includes(searchLower) ||
            log.resource.toLowerCase().includes(searchLower) ||
            log.action.toLowerCase().includes(searchLower) ||
            log.details.toLowerCase().includes(searchLower) ||
            log.status.toLowerCase().includes(searchLower) ||
            log.datetime.toLowerCase().includes(searchLower);

        return timeMatch && userMatch && resourceMatch && actionMatch && statusMatch && searchMatch;
    });

    // --- 4. PAGINATION LOGIC ---
    const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE) || 1;

    // Reset to page 1 whenever ANY filter or search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedFilter, filterUser, filterResource, filterAction, filterStatus, globalSearch]);

    const paginatedLogs = filteredLogs.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(prev => prev + 1); };
    const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(prev => prev - 1); };

    const handlePrint = () => {
        window.print();
    };

    const renderFilterDropdown = (
        columnKey: string,
        currentFilter: string,
        setFilter: (val: string) => void,
        dataKey: keyof ExtendedAuditLogData,
        isLastColumn: boolean = false
    ) => {
        const uniqueValues = Array.from(new Set(auditLogs.map(log => String(log[dataKey])))).filter(Boolean).sort();

        return (
            <div className="relative inline-block ml-2">
                <button
                    aria-label='ederf'
                    onClick={() => setActiveFilterCol(activeFilterCol === columnKey ? null : columnKey)}
                    className={`p-1.5 rounded transition-colors outline-none flex items-center justify-center
                        ${currentFilter ? 'bg-[#0A7F93] text-white' : 'text-[#888] hover:bg-gray-200'}
                    `}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                    </svg>
                </button>

                {activeFilterCol === columnKey && (
                    <div className={`absolute top-full ${isLastColumn ? 'right-0' : 'left-0'} mt-1 bg-white border border-[#D1D8DD] shadow-2xl rounded-lg z-[100] min-w-[160px] max-h-[250px] overflow-y-auto py-1 animate-in fade-in zoom-in-95`}>
                        <button
                            onClick={() => { setFilter(''); setActiveFilterCol(null); setCurrentPage(1); }}
                            className={`w-full text-left px-4 py-2 text-[12px] font-bold outline-none ${currentFilter === '' ? 'bg-[#F4F6F8] text-[#0A7F93]' : 'text-[#444] hover:bg-gray-50'}`}
                        >
                            (All)
                        </button>
                        {uniqueValues.map(val => (
                            <button
                                key={val}
                                onClick={() => { setFilter(val); setActiveFilterCol(null); setCurrentPage(1); }}
                                className={`w-full text-left px-4 py-2 text-[12px] font-medium outline-none border-t border-gray-50 
                                    ${currentFilter === val ? 'bg-[#F4F6F8] text-[#0A7F93] font-bold' : 'text-[#444] hover:bg-gray-50'}
                                `}
                            >
                                {val}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#E2E7E9] print:bg-white font-sans relative flex flex-col w-full">

            {/* CSS to enforce real page margins and prevent rows from breaking mid-print */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page {
                        margin: 15mm; /* Adds proper physical margins for both portrait and landscape */
                        size: auto;
                    }
                    body {
                        -webkit-print-color-adjust: exact;
                    }
                    table { page-break-inside: auto; }
                    tr    { page-break-inside: avoid; page-break-after: auto; }
                }
            `}} />

            {/* --- WEB UI: Hidden completely when printing (print:hidden) --- */}
            <div className="print:hidden flex-1 flex flex-col w-full">
                <Gr8MathHeader />

                <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 py-8 animate-in fade-in duration-500 flex flex-col">

                    {/* TOP BAR: Flexible container for all controls */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">

                        {/* Title & Back Button */}
                        <div className="flex items-center gap-3">
                            <button
                                aria-label='e243'
                                onClick={() => router.back()}
                                className="p-1.5 -ml-1.5 text-[#0A7F93] hover:bg-black/5 rounded-lg transition-colors outline-none cursor-pointer"
                            >
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="15 18 9 12 15 6"></polyline>
                                </svg>
                            </button>
                            <h1 className="text-[22px] md:text-[26px] font-black text-[#222] m-0">Audit Trails</h1>
                        </div>

                        {/* Controls Container: Search, Refresh, Print, Dropdown */}
                        <div className="flex flex-wrap items-center gap-3">

                            {/* SEARCH BAR */}
                            <div className="relative w-full sm:w-auto flex-1 sm:flex-none">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search records..."
                                    value={globalSearch}
                                    onChange={(e) => setGlobalSearch(e.target.value)}
                                    className="w-full sm:w-60 pl-9 pr-4 py-2.5 bg-white border border-[#B0B8C1] rounded-lg text-[13px] font-medium outline-none focus:border-[#0A7F93] transition-colors shadow-sm text-[#222] placeholder-gray-400"
                                />
                                {globalSearch && (
                                    <button aria-label='ddew33' onClick={() => setGlobalSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 outline-none">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                    </button>
                                )}
                            </div>

                            {/* REFRESH BUTTON */}
                            <button
                                onClick={fetchLogs}
                                disabled={isLoading}
                                className="flex items-center justify-center bg-white border border-[#B0B8C1] p-2.5 rounded-lg text-[#222] hover:border-[#0A7F93] hover:text-[#0A7F93] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed outline-none"
                                title="Refresh Logs"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={isLoading ? 'animate-spin' : ''}>
                                    <polyline points="23 4 23 10 17 10"></polyline>
                                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                                </svg>
                            </button>

                            {/* PRINT BUTTON */}
                            <button
                                onClick={handlePrint}
                                className="flex items-center gap-2 bg-white border border-[#B0B8C1] px-4 py-2.5 rounded-lg text-[13px] font-bold text-[#222] hover:border-[#0A7F93] hover:text-[#0A7F93] transition-colors shadow-sm outline-none"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="6 9 6 2 18 2 18 9"></polyline>
                                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                                    <rect x="6" y="14" width="12" height="8"></rect>
                                </svg>
                                <span className="hidden sm:inline">Print</span>
                            </button>

                            {/* DROPDOWN FILTER */}
                            <div className="relative w-full sm:w-40" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="w-full flex items-center justify-between bg-white border border-[#B0B8C1] px-4 py-2.5 rounded-lg text-[13px] font-bold text-[#222] hover:border-[#0A7F93] transition-colors outline-none shadow-sm"
                                >
                                    <span className="truncate mr-2">{selectedFilter}</span>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`flex-shrink-0 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </button>
                                {isDropdownOpen && (
                                    <div className="absolute top-full right-0 mt-1 w-full min-w-[160px] bg-white border border-[#D1D8DD] rounded-lg shadow-xl z-50 overflow-hidden">
                                        {filterOptions.map((option) => (
                                            <button
                                                key={option}
                                                onClick={() => {
                                                    setSelectedFilter(option);
                                                    setCurrentPage(1);
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
                    </div>

                    {/* Paginated Table Container */}
                    <div className="bg-white border border-[#D1D8DD] rounded-xl shadow-sm flex-1 flex flex-col" ref={tableRef}>
                        <div className="overflow-x-auto flex-1 rounded-xl">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="bg-[#F4F6F8] border-b border-[#D1D8DD]">
                                        <th className="px-6 py-4 w-[20%]"><span className="text-[13px] font-black text-[#222] uppercase tracking-wider">Date & Time</span></th>
                                        <th className="px-6 py-4 w-[15%]"><div className="flex items-center justify-between"><span className="text-[13px] font-black text-[#222] uppercase tracking-wider">User</span>{renderFilterDropdown('user', filterUser, setFilterUser, 'user')}</div></th>
                                        <th className="px-6 py-4 w-[15%]"><div className="flex items-center justify-between"><span className="text-[13px] font-black text-[#222] uppercase tracking-wider">Resource</span>{renderFilterDropdown('resource', filterResource, setFilterResource, 'resource')}</div></th>
                                        <th className="px-6 py-4 w-[15%]"><div className="flex items-center justify-between"><span className="text-[13px] font-black text-[#222] uppercase tracking-wider">Action</span>{renderFilterDropdown('action', filterAction, setFilterAction, 'action')}</div></th>
                                        <th className="px-6 py-4 w-[20%]"><span className="text-[13px] font-black text-[#222] uppercase tracking-wider block">Details</span></th>
                                        <th className="px-6 py-4 w-[15%]"><div className="flex items-center justify-between"><span className="text-[13px] font-black text-[#222] uppercase tracking-wider">Status</span>{renderFilterDropdown('status', filterStatus, setFilterStatus, 'status', true)}</div></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E8E8E8]">
                                    {isLoading ? (
                                        <tr><td colSpan={6} className="px-6 py-8 text-center text-[#666] font-bold">Loading audit trails...</td></tr>
                                    ) : paginatedLogs.length === 0 ? (
                                        <tr><td colSpan={6} className="px-6 py-8 text-center text-[#666] font-bold">No records found</td></tr>
                                    ) : (
                                        paginatedLogs.map((log) => <AuditTableRow key={log.id} log={log} />)
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between mt-6 px-2 gap-4">
                        <div className="text-[13px] font-black text-[#222] font-mono">{currentTime}</div>
                        <div className="flex items-center gap-4">
                            <button aria-label='e33322ded' onClick={handlePrevPage} disabled={currentPage === 1} className="w-9 h-9 flex items-center justify-center rounded-full border border-[#B0B8C1] text-[#0A7F93] hover:bg-white hover:border-[#0A7F93] transition-all disabled:opacity-50 outline-none">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                            </button>
                            <span className="text-[13px] font-bold text-[#222]">{currentPage} <span className="font-medium text-[#666]">out of</span> {totalPages}</span>
                            <button aria-label='dewqs21w' onClick={handleNextPage} disabled={currentPage === totalPages} className="w-9 h-9 flex items-center justify-center rounded-full border border-[#B0B8C1] text-[#0A7F93] hover:bg-white hover:border-[#0A7F93] transition-all disabled:opacity-50 outline-none">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </button>
                        </div>
                    </div>
                </main>
            </div>

            {/* --- PRINT ONLY UI: Hidden on screen, visible only during print --- */}
            <div className="hidden print:block w-full bg-white text-black font-serif">
                {/* Formal Header Top */}
                <div className="flex justify-between items-center text-xs mb-6 border-b border-black pb-2">
                    <p>Prepared by: <strong>Current User / Admin</strong></p>
                    <p>{new Date().toLocaleDateString('en-US')} | {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>

                {/* GR8 Math Title Block */}
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold uppercase tracking-wide">GR8 MATH AUDIT TRAILS</h1>
                </div>

                {/* All Filtered Logs Data */}
                <table className="w-full text-[11px] border-collapse border border-black table-fixed break-words">
                    <thead>
                        <tr className="bg-gray-100 border border-black">
                            <th className="border border-black p-2 font-bold w-[18%]">Date & Time</th>
                            <th className="border border-black p-2 font-bold w-[16%]">User</th>
                            <th className="border border-black p-2 font-bold w-[16%]">Resource</th>
                            <th className="border border-black p-2 font-bold w-[16%]">Action</th>
                            <th className="border border-black p-2 font-bold w-[22%]">Details</th>
                            <th className="border border-black p-2 font-bold w-[12%]">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs.length === 0 ? (
                            <tr><td colSpan={6} className="p-4 text-center border border-black">No records to print based on current filters.</td></tr>
                        ) : (
                            filteredLogs.map((log) => (
                                <tr key={log.id} className="border border-black">
                                    <td className="border border-black p-2 text-center">{log.datetime}</td>
                                    <td className="border border-black p-2">{log.user}</td>
                                    <td className="border border-black p-2">{log.resource}</td>
                                    <td className="border border-black p-2">{log.action}</td>
                                    <td className="border border-black p-2">{log.details}</td>
                                    <td className="border border-black p-2 text-center">{log.status}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}