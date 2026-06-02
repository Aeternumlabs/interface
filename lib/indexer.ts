/**
 * lib/indexer.ts
 *
 * Lightweight GraphQL client for the Aeternum protocol indexer.
 * Handles direct data fetching from the local Ponder instance or 
 * production database without heavy third-party dependencies.
 */

const INDEXER_URL = process.env.NEXT_PUBLIC_INDEXER_URL || "https://aeternum-indexer-production.up.railway.app/";

export async function fetchIndexer<T>(query: string, variables: Record<string, any> = {}): Promise<T> {
  try {
    const response = await fetch(INDEXER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });

    const { data, errors } = await response.json();

    if (errors) {
      // Force stringification so we can read the exact GraphQL complaint
      console.error("Indexer GraphQL Errors:", JSON.stringify(errors, null, 2));
      throw new Error("Failed to fetch data from indexer");
    }

    return data as T;
  } catch (error) {
    console.error("Network or parsing error in fetchIndexer:", error);
    throw error;
  }
}