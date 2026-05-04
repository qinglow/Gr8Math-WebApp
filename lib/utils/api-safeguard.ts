const NETWORK_ERROR_MSG = "An unexpected response was received from the server. Please check your internet connection and try again.";

export async function withNetworkSafeguard<T>(
  apiPromise: Promise<T>,
  timeoutMs: number = 15000 // Defaults to 15 seconds
): Promise<T | { success: false; error: string; message?: string }> {
  let timeoutId: NodeJS.Timeout;

  // 1. Create a promise that automatically rejects after X seconds
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error("TIMEOUT"));
    }, timeoutMs);
  });

  try {
    // 2. Race the actual API call against the timeout
    const result = await Promise.race([apiPromise, timeoutPromise]);
    clearTimeout(timeoutId!); 
    return result;
  } catch (error: any) {
    clearTimeout(timeoutId!);

    // 3. Handle the specific Timeout scenario
    if (error.message === "TIMEOUT") {
      return { success: false, error: NETWORK_ERROR_MSG };
    }

    // 4. Handle dropped connections (Browser throws a TypeError when fetch fails due to network)
    if (error instanceof TypeError || error.message?.toLowerCase().includes('network') || error.message?.toLowerCase().includes('fetch')) {
      return { success: false, error: NETWORK_ERROR_MSG };
    }

    // 5. Fallback for any other unexpected errors
    return { success: false, error: error.message || "An unexpected error occurred." };
  }
}