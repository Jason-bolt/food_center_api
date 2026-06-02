import { Router } from "express";
import foodRouter from "../modules/food/route";
import uploadRouter from "../modules/upload/route";
import influencerRouter from "../modules/influencer/route";
import recipesRouter from "../modules/recipes/route";
import authRouter from "../modules/auth/route";
import savedRecipesRouter from "../modules/savedRecipes/route";
import mealPlanRouter from "../modules/mealPlan/route";
import trendingRouter from "../modules/trending/route";
import pantryRouter from "../modules/pantry/route";
import editorialRouter from "../modules/editorial/route";

const router = Router();

router.use("/foods", foodRouter);
router.use("/upload", uploadRouter);
router.use("/influencers", influencerRouter);
router.use("/recipes", recipesRouter);
router.use("/auth", authRouter);
router.use("/saved-recipes", savedRecipesRouter);
router.use("/meal-plan", mealPlanRouter);
router.use("/trending", trendingRouter);
router.use("/pantry", pantryRouter);
router.use("/editorials", editorialRouter);

export default router;