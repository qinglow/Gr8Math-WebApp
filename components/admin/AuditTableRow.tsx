import React from 'react';

// Define the shape of the data the backend will send
export interface AuditLogData {
    id: string | number;
    datetime: string;
    user: string;
    resource: string;
    action: string;
    details: string;
    status: string;
}

export function AuditTableRow({ log }: { log: AuditLogData }) {
    // We can put any complex logic for formatting dates or status colors right here!
    const isSuccess = log.status.toUpperCase() === 'SUCCESS';

    return (
        <tr className="hover:bg-[#F9FAFB] transition-colors">
            <td className="px-6 py-3.5 text-[13px] font-bold text-[#444]">{log.datetime}</td>
            <td className="px-6 py-3.5 text-[13px] font-semibold text-[#222]">{log.user}</td>
            <td className="px-6 py-3.5 text-[13px] font-medium text-[#666]">{log.resource}</td>
            <td className="px-6 py-3.5 text-[13px] font-medium text-[#666]">{log.action}</td>
            <td className="px-6 py-3.5 text-[13px] font-medium text-[#666]">{log.details}</td>
            <td className="px-6 py-3.5">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider ${
                    isSuccess ? 'bg-[#E6F4EA] text-[#0A7F93]' : 'bg-[#FDE7E9] text-[#ED1F24]'
                }`}>
                    {log.status}
                </span>
            </td>
        </tr>
    );
}