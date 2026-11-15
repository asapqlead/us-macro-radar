/**
 * Environment configuration for FRED API.
 */
export function getFredApiKey(): string | undefined {
  return process.env.FRED_API_KEY?.trim() || undefined;
}

export function isFredConfigured(): boolean {
  const key = getFredApiKey();
  return Boolean(key && key !== "YOUR_FRED_API_KEY_HERE" && key.length > 5);
}

export const FRED_API_BASE_URL = "https://api.stlouisfed.org/fred";
export const DEFAULT_REVALIDATE_SECONDS = 3600; // 1 hour server cache
