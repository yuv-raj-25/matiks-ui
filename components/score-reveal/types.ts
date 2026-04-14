export interface ScoreRevealProps {
  /** Final score to animate to, e.g. 2840 */
  finalScore: number;
  /** Combo streak count, e.g. 7 */
  comboStreak: number;
  /** Player rank, e.g. 3 */
  rank: number;
  /** Total players in the session, e.g. 1200 */
  totalPlayers: number;
  /** Optional player name */
  playerName?: string;
}
