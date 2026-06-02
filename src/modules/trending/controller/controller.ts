import { Request, Response } from "express";
import { zTopWithScores } from "../../../../utils/services/redis";
import logger from "../../../../utils/logger";

/** Returns the Monday of today as a YYYY-MM-DD string (UTC). */
export const currentWeekKey = (): string => {
  const now = new Date();
  const day = now.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() + diff);
  return monday.toISOString().slice(0, 10);
};

export const TRENDING_KEY = (week: string) => `trending:ingredients:${week}`;

class TrendingController {
  /** GET /trending — top 10 ingredients searched this week */
  get = async (_req: Request, res: Response): Promise<void> => {
    try {
      const key = TRENDING_KEY(currentWeekKey());
      const results = await zTopWithScores(key, 10);
      res.json({
        week: currentWeekKey(),
        ingredients: results.map((r) => ({ name: r.value, count: r.score })),
      });
    } catch (err) {
      logger.error({ err }, "[Trending]: Failed to fetch trending data");
      res.json({ week: currentWeekKey(), ingredients: [] });
    }
  };
}

export default new TrendingController();
