import type { FootballDataProvider } from "./football-provider";
import type { LiveMatch } from "./types";

export class MockFootballProvider implements FootballDataProvider {
  constructor(private readonly matches: Record<string, LiveMatch | null> = {}) {}

  async getLiveMatch(matchId: string): Promise<LiveMatch | null> {
    return this.matches[matchId] ?? null;
  }
}
