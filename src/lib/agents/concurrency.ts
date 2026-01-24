import { db } from "@/lib/db";
import { systemSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import pLimit from "p-limit";

// Global limiter instance
let limiter = pLimit(1);
let currentConcurrency = 1;
let currentInterval = 0; // Default 0ms

export async function getConcurrencyValues(): Promise<{ limit: number, interval: number }> {
    try {
        const settings = await db
            .select()
            .from(systemSettings)
            .where(
                eq(systemSettings.key, "pollinations_concurrency")
            );

        const intervalSetting = await db
            .select()
            .from(systemSettings)
            .where(
                eq(systemSettings.key, "pollinations_interval")
            );

        let limit = 1;
        let interval = 0;

        if (settings.length > 0) {
            const val = parseInt(settings[0].value, 10);
            limit = isNaN(val) || val < 1 ? 1 : val;
        }

        if (intervalSetting.length > 0) {
            const val = parseInt(intervalSetting[0].value, 10);
            // Convert seconds to ms if user inputs '3' for 3 seconds
            // Assuming the input is in seconds as explicitly requested by user "3 seconds"
            interval = isNaN(val) || val < 0 ? 0 : val * 1000;
        }

        return { limit, interval };

    } catch (e) {
        console.warn("Failed to fetch concurrency settings from DB, using defaults.", e);
        return { limit: 1, interval: 0 };
    }
}

// Helper to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to wrap tasks with the dynamic limiter AND interval
export async function withConcurrencyLimit<T>(fn: () => Promise<T>): Promise<T> {
    return limiter(async () => {
        const result = await fn();
        if (currentInterval > 0) {
            console.log(`Waiting ${currentInterval}ms before next request...`);
            await delay(currentInterval);
        }
        return result;
    });
}

export async function updateLimiter() {
    const { limit, interval } = await getConcurrencyValues();

    // Update concurrency limit if changed
    if (limit !== currentConcurrency) {
        console.log(`Updating concurrency limit to ${limit}`);
        limiter = pLimit(limit);
        currentConcurrency = limit;
    }

    // Update interval if changed
    if (interval !== currentInterval) {
        console.log(`Updating interval to ${interval}ms`);
        currentInterval = interval;
    }
}
