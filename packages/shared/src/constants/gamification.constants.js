"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BADGE_RULES = exports.STREAK_RULES = exports.LEVELS = exports.XP_RULES = void 0;
exports.calculateLevel = calculateLevel;
exports.xpToNextLevel = xpToNextLevel;
exports.XP_RULES = {
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
};
exports.LEVELS = [
    { name: 'Starter', minXp: 0, maxXp: 499 },
    { name: 'Warrior', minXp: 500, maxXp: 1999 },
    { name: 'Lion', minXp: 2000, maxXp: 4999 },
    { name: 'GOAT', minXp: 5000, maxXp: Infinity },
];
function calculateLevel(totalXp) {
    for (let i = exports.LEVELS.length - 1; i >= 0; i--) {
        if (totalXp >= exports.LEVELS[i].minXp) {
            return exports.LEVELS[i].name;
        }
    }
    return 'Starter';
}
function xpToNextLevel(totalXp) {
    const currentLevelIdx = exports.LEVELS.findIndex((l, i) => totalXp >= l.minXp &&
        (i === exports.LEVELS.length - 1 || totalXp < exports.LEVELS[i + 1].minXp));
    if (currentLevelIdx === exports.LEVELS.length - 1)
        return 0; // GOAT, no next level
    return exports.LEVELS[currentLevelIdx + 1].minXp - totalXp;
}
exports.STREAK_RULES = {
    RESET_AFTER_MISSED_DAYS: 1,
    BONUS_MILESTONE_7: 7,
    BONUS_MILESTONE_30: 30,
};
exports.BADGE_RULES = {
    STREAK_7_DAYS: 'streak_7_days',
    STREAK_30_DAYS: 'streak_30_days',
    FIRST_CHALLENGE_COMPLETE: 'first_challenge_complete',
    PITCH_MASTER: 'pitch_master',
    PRODUCTIVITY_PRO: 'productivity_pro',
    LEADER: 'leader',
    COMMUNICATOR: 'communicator',
};
//# sourceMappingURL=gamification.constants.js.map