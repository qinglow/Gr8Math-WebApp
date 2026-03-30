export const formatTime = (timeString: string | null): string => {
    if (!timeString) return "Time N/A";
    try {
        const [hour, minute] = timeString.split(':');
        const h = parseInt(hour, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const formattedHour = h % 12 || 12;
        return `${formattedHour}:${minute} ${ampm}`;
    } catch (error) {
        return "Time N/A";
    }
};

// 1. Robust parser: Reads "March 22, 2026 10:00pm"
export const pickerToDate = (str: string | null | undefined): Date | null => {
    if (!str || typeof str !== 'string' || str.trim() === '') return null;
    try {
        const longDateRegex = /([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})\s+(\d{1,2}):(\d{2})\s*([AaPp][Mm])/;
        const match = str.match(longDateRegex);
        if (match) {
            const [_, monthStr, day, year, hour, minute, ampm] = match;
            const monthNames = ["january", "february", "march", "april", "may", "june",
                "july", "august", "september", "october", "november", "december"];
            const month = monthNames.findIndex(m => m.startsWith(monthStr.toLowerCase()));
            let h = parseInt(hour, 10);
            if (ampm.toUpperCase() === 'PM' && h < 12) h += 12;
            if (ampm.toUpperCase() === 'AM' && h === 12) h = 0;
            return new Date(parseInt(year), month, parseInt(day), h, parseInt(minute));
        }
        // Native fallback
        const fixedStr = str.replace(/(\d{2})(am|pm)/i, '$1 $2');
        const d = new Date(fixedStr);
        return isNaN(d.getTime()) ? null : d;
    } catch (e) { return null; }
};

// 2. Database Converter: Uses the parser above to create an ISO string
export const convertToIso = (rawDate: string | null | undefined): string | null => {
    const d = pickerToDate(rawDate);
    return d ? d.toISOString() : null;
};

// 3. UI Reverter: Converts Supabase ISO back to "March 22, 2026 10:00pm"
export const revertIsoToPicker = (isoString: string | null | undefined): string => {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    const fullMonthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let h = date.getHours();
    const ampm = h >= 12 ? 'pm' : 'am';
    h = h % 12 || 12;
    const formattedH = String(h).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${fullMonthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} ${formattedH}:${min}${ampm}`;
};


export function formatDllDateRange(startStr: string, endStr: string) {
    if (!startStr || !endStr) return '';
    const cleanStart = startStr.replace(/\s\d{1,2}:\d{2}[a-zA-Z]{2}/i, '').trim();
    const cleanEnd = endStr.replace(/\s\d{1,2}:\d{2}[a-zA-Z]{2}/i, '').trim();

    const start = new Date(cleanStart);
    const end = new Date(cleanEnd);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return '';
    
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const sMonth = months[start.getMonth()];
    const sDay = start.getDate();
    const sYear = start.getFullYear();
    
    const eMonth = months[end.getMonth()];
    const eDay = end.getDate();
    const eYear = end.getFullYear();
    
    if (sYear === eYear && sMonth === eMonth) {
        return `${sMonth}. ${sDay}-${eDay}, ${sYear}`; 
    } 
    else if (sYear === eYear) {
        return `${sMonth}. ${sDay} - ${eMonth}. ${eDay}, ${sYear}`; 
    } 
    else {
        return `${sMonth}. ${sDay}, ${sYear} - ${eMonth}. ${eDay}, ${eYear}`;
    }
}
