import inngest from "..";
import FoodModel from "../../config/db/models/FoodModel";
import InfluencerFoodModel from "../../config/db/models/InfluencerFoodModel";
import InfluencerModel from "../../config/db/models/InfluencerModel";
import logger from "../../utils/logger";
import getYoutubeVideoTitleAndThumbnail from "../../utils/services/youtube";

const updateInfluencerFoodYoutubeDetails = inngest.createFunction(
  { id: "update_influencer_food_youtube_details", retries: 3 },
  { event: "update_influencer_food_youtube_details.event" },
  async ({ event, step }) => {
    try {
      const validFoods = await step.run("check_if_foods_exist", async () => {
        const validFoods: {
          foodId: string;
          videoUrls: string[];
        }[] = [];

        await Promise.all(
          event.data.foodLinks.map(
            async (foodLink: { foodId: string; videoUrls: string[] }) => {
              const food = await FoodModel.findById(foodLink.foodId);
              console.log("Food", food);
              if (food) {
                validFoods.push({
                  foodId: foodLink.foodId,
                  videoUrls: foodLink.videoUrls,
                });
              }
            }
          )
        );

        console.log("validFoods", validFoods);
        return validFoods;
      });

      const influencer = await step.run("get_influencer", async () => {
        const influencer = await InfluencerModel.findOne({
          name: event.data.influencerName,
        }).exec();

        if (!influencer) throw new Error("Influencer not found!");

        return influencer;
      });

      await step.run("update_influencer_food_youtube_details", async () => {
        const influencerId = (influencer as { _id: string })?._id;
        await Promise.all(
          validFoods.map(async (validFood) => {
            await Promise.all(
              validFood.videoUrls.map(async (videoUrl: string) => {
                const { thumbnailUrl, title, publishedAt } =
                  await getYoutubeVideoTitleAndThumbnail(videoUrl);
                console.log(thumbnailUrl, title, publishedAt);

                const influencerFood = new InfluencerFoodModel({
                  foodId: validFood.foodId,
                  influencerId: influencerId,
                  videoUrl,
                  videoTitle: title,
                  videoThumbnailUrl: thumbnailUrl,
                  videoPublishedAt: publishedAt,
                });
                await influencerFood.save();
              })
            );
          })
        );
      });

      return {
        success: true,
      };
    } catch (error) {
      logger.debug(error, "Error from influencer food youtube details.");
      return {
        success: false,
      };
    }
  }
);

export default [updateInfluencerFoodYoutubeDetails];
