import type { LiveMatch } from "./types";

export interface FootballDataProvider {
  getLiveMatch(matchId: string): Promise<LiveMatch | null>;
}
