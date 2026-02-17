export declare const XP_RULES: {
    readonly CONTENT_VIEWED: 10;
    readonly CONTENT_COMPLETED: 25;
    readonly QUIZ_PASSED: 50;
    readonly QUIZ_FAILED: 5;
    readonly CHALLENGE_DAY_COMPLETED: 30;
    readonly CHALLENGE_COMPLETED: 200;
    readonly STREAK_BONUS_7_DAYS: 100;
    readonly STREAK_BONUS_30_DAYS: 500;
    readonly PROFILE_COMPLETED: 50;
    readonly FIRST_LOGIN: 20;
    readonly PROGRAM_COMPLETED: 300;
};
export type XpAction = keyof typeof XP_RULES;
export declare const LEVELS: readonly [{
    readonly name: "Starter";
    readonly minXp: 0;
    readonly maxXp: 499;
}, {
    readonly name: "Warrior";
    readonly minXp: 500;
    readonly maxXp: 1999;
}, {
    readonly name: "Lion";
    readonly minXp: 2000;
    readonly maxXp: 4999;
}, {
    readonly name: "GOAT";
    readonly minXp: 5000;
    readonly maxXp: number;
}];
export type LevelName = typeof LEVELS[number]['name'];
export declare function calculateLevel(totalXp: number): LevelName;
export declare function xpToNextLevel(totalXp: number): number;
export declare const STREAK_RULES: {
    readonly RESET_AFTER_MISSED_DAYS: 1;
    readonly BONUS_MILESTONE_7: 7;
    readonly BONUS_MILESTONE_30: 30;
};
export declare const BADGE_RULES: {
    readonly STREAK_7_DAYS: "streak_7_days";
    readonly STREAK_30_DAYS: "streak_30_days";
    readonly FIRST_CHALLENGE_COMPLETE: "first_challenge_complete";
    readonly PITCH_MASTER: "pitch_master";
    readonly PRODUCTIVITY_PRO: "productivity_pro";
    readonly LEADER: "leader";
    readonly COMMUNICATOR: "communicator";
};
//# sourceMappingURL=gamification.constants.d.ts.map