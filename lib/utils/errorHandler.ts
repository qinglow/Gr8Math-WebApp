export function handleActionError(error: any) {
    // // 1. Log the real, raw error to your server console so YOU can still see it
    // console.error("🚨 Server Action Error:", error);

    const errorMessage = error?.message?.toLowerCase() || '';

    // 2. Catch network, timeout, or connection drops
    if (
        errorMessage.includes('fetch') || 
        errorMessage.includes('timeout') || 
        errorMessage.includes('network') || 
        error?.code === '503'
    ) {
        return { error: "Network error. Please check your connection and try again." };
    }
    
    return { error: "An unexpected error occurred. Please try again later." };
}