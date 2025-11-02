/**
 * ELO Rating System for Legal LLM Arena
 *
 * Standard ELO calculation with K-factor adjustment based on:
 * - Number of games played (higher K for new models)
 * - Rating difference (larger changes for upsets)
 */

export interface EloResult {
  playerAChange: number;
  playerBChange: number;
  playerANewRating: number;
  playerBNewRating: number;
}

/**
 * Calculate expected score for a player
 * @param ratingA - Rating of player A
 * @param ratingB - Rating of player B
 * @returns Expected score (0-1) for player A
 */
export function calculateExpectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

/**
 * Calculate K-factor based on number of games and rating
 * @param gamesPlayed - Number of games played by the model
 * @param rating - Current rating
 * @returns K-factor for ELO calculation
 */
export function calculateKFactor(gamesPlayed: number, rating: number): number {
  // New models (< 30 games): Higher K-factor for faster adjustment
  if (gamesPlayed < 30) {
    return 40;
  }

  // Established models (30-100 games): Medium K-factor
  if (gamesPlayed < 100) {
    return 32;
  }

  // High-rated models (> 2400): Lower K-factor for stability
  if (rating >= 2400) {
    return 16;
  }

  // Standard K-factor for established models
  return 24;
}

/**
 * Calculate ELO rating changes after a match
 * @param ratingA - Current rating of model A
 * @param ratingB - Current rating of model B
 * @param gamesPlayedA - Number of games played by model A
 * @param gamesPlayedB - Number of games played by model B
 * @param result - Actual result (1 = A wins, 0 = B wins, 0.5 = tie)
 * @returns ELO changes and new ratings for both models
 */
export function calculateEloChange(
  ratingA: number,
  ratingB: number,
  gamesPlayedA: number,
  gamesPlayedB: number,
  result: number
): EloResult {
  // Validate result
  if (result !== 0 && result !== 0.5 && result !== 1) {
    throw new Error('Result must be 0 (B wins), 0.5 (tie), or 1 (A wins)');
  }

  // Calculate expected scores
  const expectedA = calculateExpectedScore(ratingA, ratingB);
  const expectedB = 1 - expectedA;

  // Calculate K-factors
  const kA = calculateKFactor(gamesPlayedA, ratingA);
  const kB = calculateKFactor(gamesPlayedB, ratingB);

  // Calculate rating changes
  const changeA = kA * (result - expectedA);
  const changeB = kB * ((1 - result) - expectedB);

  // Calculate new ratings
  const newRatingA = ratingA + changeA;
  const newRatingB = ratingB + changeB;

  return {
    playerAChange: Math.round(changeA * 10) / 10, // Round to 1 decimal place
    playerBChange: Math.round(changeB * 10) / 10,
    playerANewRating: Math.round(newRatingA * 10) / 10,
    playerBNewRating: Math.round(newRatingB * 10) / 10,
  };
}

/**
 * Determine result code from winner ID
 * @param modelAId - ID of model A
 * @param modelBId - ID of model B
 * @param winnerId - ID of winning model (null for tie)
 * @returns Result code (1 = A wins, 0 = B wins, 0.5 = tie)
 */
export function getResultFromWinner(
  modelAId: string,
  modelBId: string,
  winnerId: string | null
): number {
  if (winnerId === null) {
    return 0.5; // Tie
  }

  if (winnerId === modelAId) {
    return 1; // A wins
  }

  if (winnerId === modelBId) {
    return 0; // B wins
  }

  throw new Error('Winner ID must be either modelAId, modelBId, or null');
}

/**
 * Calculate win probability for model A
 * @param ratingA - Rating of model A
 * @param ratingB - Rating of model B
 * @returns Probability (0-1) that model A will win
 */
export function calculateWinProbability(ratingA: number, ratingB: number): number {
  return calculateExpectedScore(ratingA, ratingB);
}

/**
 * Get rating tier/rank based on ELO rating
 * @param rating - ELO rating
 * @returns Tier name
 */
export function getRatingTier(rating: number): string {
  if (rating >= 2700) return 'Legendary';
  if (rating >= 2500) return 'Master';
  if (rating >= 2300) return 'Expert';
  if (rating >= 2100) return 'Advanced';
  if (rating >= 1900) return 'Intermediate';
  if (rating >= 1700) return 'Developing';
  return 'Novice';
}
