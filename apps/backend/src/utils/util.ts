export const isDevelopment = process.env.NODE_ENV !== 'production';

export async function retry<T>(
  fn: () => Promise<T>,
  retryCount: number = 3,
  delayMs: number = 200,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= retryCount; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      // If this was the last attempt → throw
      if (attempt === retryCount) {
        throw lastError;
      }

      // Optional delay between retries
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }

  // Should never reach here
  throw lastError;
}
