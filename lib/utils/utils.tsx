export const formatTime = (timeString: string | null): string => {
    if (!timeString) return "Time N/A";
    
    try {
        const [hour, minute] = timeString.split(':');
        const h = parseInt(hour, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const formattedHour = h % 12 || 12;
        
        return `${formattedHour}:${minute} ${ampm}`;
    } catch (error) {
        console.error("Time formatting error:", error);
        return "Time N/A";
    }
};