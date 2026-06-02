import UserModel from "../../config/db/models/UserModel";
import logger from "../logger";

export type StatAction = "generate" | "save" | "fullWeek";

const XP: Record<StatAction, number> = {
  generate: 10,
  save:     20,
  fullWeek: 50,
};

/** Returns today's date as YYYY-MM-DD (UTC). */
const todayUTC     = (): string => new Date().toISOString().slice(0, 10);

/** Returns yesterday's date as YYYY-MM-DD (UTC). */
const yesterdayUTC = (): string => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
};

/**
 * Updates the user's XP, streak, and counters **atomically** using a
 * MongoDB aggregation-pipeline update (single round-trip, no read-modify-write
 * race condition).
 *
 * Fire-and-forget safe — errors are logged but never thrown.
 */
export const updateUserStats = async (
  userId: string,
  action: StatAction,
  extraData?: { weekStart?: string },
): Promise<void> => {
  try {
    const today     = todayUTC();
    const yesterday = yesterdayUTC();

    // ── Stage 1: XP, counters, streak, lastActiveDate ────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stage1: Record<string, any> = {

      // Streak — only advances if lastActiveDate has changed
      "stats.currentStreak": {
        $cond: {
          if:   { $eq: [{ $ifNull: ["$stats.lastActiveDate", null] }, today] },
          then: { $ifNull: ["$stats.currentStreak", 0] },           // already counted today
          else: {
            $cond: {
              if:   { $eq: [{ $ifNull: ["$stats.lastActiveDate", null] }, yesterday] },
              then: { $add: [{ $ifNull: ["$stats.currentStreak", 0] }, 1] }, // consecutive day
              else: 1,                                                        // reset / first action
            },
          },
        },
      },

      "stats.lastActiveDate": {
        $cond: {
          if:   { $eq: [{ $ifNull: ["$stats.lastActiveDate", null] }, today] },
          then: { $ifNull: ["$stats.lastActiveDate", today] },
          else: today,
        },
      },
    };

    // XP — conditional deduplication for fullWeek, plain increment otherwise
    if (action === "fullWeek") {
      const weekKey = extraData?.weekStart ?? today;

      stage1["stats.xp"] = {
        $cond: {
          if:   { $in: [weekKey, { $ifNull: ["$stats.completedWeeks", []] }] },
          then: { $ifNull: ["$stats.xp", 0] },                          // already awarded
          else: { $add: [{ $ifNull: ["$stats.xp", 0] }, XP.fullWeek] },
        },
      };
      stage1["stats.completedWeeks"] = {
        $cond: {
          if:   { $in: [weekKey, { $ifNull: ["$stats.completedWeeks", []] }] },
          then: { $ifNull: ["$stats.completedWeeks", []] },
          else: { $concatArrays: [{ $ifNull: ["$stats.completedWeeks", []] }, [weekKey]] },
        },
      };
    } else {
      stage1["stats.xp"] = { $add: [{ $ifNull: ["$stats.xp", 0] }, XP[action]] };

      if (action === "generate") {
        stage1["stats.totalRecipesGenerated"] = {
          $add: [{ $ifNull: ["$stats.totalRecipesGenerated", 0] }, 1],
        };
      }
      if (action === "save") {
        stage1["stats.totalRecipesSaved"] = {
          $add: [{ $ifNull: ["$stats.totalRecipesSaved", 0] }, 1],
        };
      }
    }

    // ── Stage 2: longestStreak (reads the currentStreak written in stage 1) ──
    const stage2 = {
      "stats.longestStreak": {
        $max: [
          { $ifNull: ["$stats.currentStreak", 0] },
          { $ifNull: ["$stats.longestStreak",  0] },
        ],
      },
    };

    // Single round-trip — fully atomic, no race condition
    await UserModel.findByIdAndUpdate(userId, [
      { $set: stage1 },
      { $set: stage2 },
    ]);

    logger.debug({ userId, action }, "[Stats]: Updated user stats atomically");
  } catch (err) {
    logger.error({ err, userId, action }, "[Stats]: Failed to update stats");
  }
};
