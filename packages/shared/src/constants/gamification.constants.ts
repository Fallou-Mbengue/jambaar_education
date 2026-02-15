export const XP_RULES = {
  CONTENT_VIEWED: 10,
  CONTENT_COMPLETED: 25,
  QUIZ_PASSED: 50,
  QUIZ_FAILED: 5,
  CHALLENGE_DAY_COMPLETED: 30,
  CHALLENGE_COMPLETED: 200,
  STREAK_BONUS_7_DAYS: 100,
  STREAK_BONUS_30_DAYS: 500,
  PROFILE_COMPLETED: 50,
  FIRST_LOGIN: 20,
  PROGRAM_COMPLETED: 300,
} as const;

export type XpAction = keyof typeof XP_RULES;

export const LEVELS = [
  { name: 'Starter', minXp: 0,    maxXp: 499   },
  { name: 'Warrior', minXp: 500,  maxXp: 1999  },
  { name: 'Lion',    minXp: 2000, maxXp: 4999  },
  { name: 'GOAT',   minXp: 5000, maxXp: Infinity },
] as const;

export type LevelName = typeof LEVELS[number]['name'];

export function calculateLevel(totalXp: number): LevelName {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVELS[i].minXp) {
      return LEVELS[i].name;
    }
  }
  return 'Starter';
}

export function xpToNextLevel(totalXp: number): number {
  const currentLevelIdx = LEVELS.findIndex(
    (l, i) =>
      totalXp >= l.minXp &&
      (i === LEVELS.length - 1 || totalXp < LEVELS[i + 1].minXp),
  );
  if (currentLevelIdx === LEVELS.length - 1) return 0; // GOAT, no next level
  return LEVELS[currentLevelIdx + 1].minXp - totalXp;
}

export const STREAK_RULES = {
  RESET_AFTER_MISSED_DAYS: 1,
  BONUS_MILESTONE_7: 7,
  BONUS_MILESTONE_30: 30,
} as const;

export const BADGE_RULES = {
  STREAK_7_DAYS: 'streak_7_days',
  STREAK_30_DAYS: 'streak_30_days',
  FIRST_CHALLENGE_COMPLETE: 'first_challenge_complete',
  PITCH_MASTER: 'pitch_master',
  PRODUCTIVITY_PRO: 'productivity_pro',
  LEADER: 'leader',
  COMMUNICATOR: 'communicator',
} as const;
