import type { FootballDataProvider } from "./football-provider";
import type { LiveMatch } from "./types";

export class FootballApiProvider implements FootballDataProvider {
  constructor(private readonly baseUrl = "") {}

  async getLiveMatch(matchId: string): Promise<LiveMatch | null> {
    const response = await fetch(`${this.baseUrl}/api/live-match/${encodeURIComponent(matchId)}`, {
      cache: "no-store",
    });

    if (response.status === 404) return null;

    if (response.status === 429) {
      const retryAfter = Number(response.headers.get("retry-after") ?? "30");
      throw new Error(`Rate limited. Retry after ${retryAfter} seconds.`);
    }

    if (!response.ok) {
      throw new Error(`Live match request failed with ${response.status}.`);
    }

    const payload = (await response.json()) as { match: LiveMatch | null };
    return payload.match;
  }
}
