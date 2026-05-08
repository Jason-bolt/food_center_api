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
    const validFoods = await step.run("check_if_foods_exist", async () => {
      // Single query instead of one findById per food link
      const foodIds = event.data.foodLinks.map(
        (f: { foodId: string }) => f.foodId,
      );
      const foundFoods = await FoodModel.find({ _id: { $in: foodIds } });
      const foundIds = new Set(foundFoods.map((f) => String(f._id)));
      return (event.data.foodLinks as { foodId: string; videoUrls: string[] }[]).filter(
        (fl) => foundIds.has(fl.foodId),
      );
    });

    const influencer = await step.run("get_influencer", async () => {
      const found = await InfluencerModel.findOne({
        name: event.data.influencerName,
      }).exec();

      if (!found) throw new Error("Influencer not found");

      return found;
    });

    await step.run("upsert_influencer_food_records", async () => {
      const influencerId = influencer._id;

      await Promise.all(
        validFoods.map(async (validFood) => {
          await Promise.all(
            validFood.videoUrls.map(async (videoUrl: string) => {
              const { thumbnailUrl, title, publishedAt, videoId } =
                await getYoutubeVideoTitleAndThumbnail(videoUrl);

              logger.debug(
                { videoId, title, influencerId },
                "[Inngest]: Upserting InfluencerFood record",
              );

              // Single upsert replaces the manual findOne + branch, eliminating
              // an extra round-trip and the TOCTOU race on concurrent retries.
              await InfluencerFoodModel.findOneAndUpdate(
                { food: validFood.foodId, influencer: influencerId, videoId },
                {
                  food: validFood.foodId,
                  influencer: influencerId,
                  videoUrl,
                  videoId,
                  videoTitle: title,
                  videoThumbnailUrl: thumbnailUrl,
                  videoPublishedAt: publishedAt,
                },
                { upsert: true, new: true },
              );
            }),
          );
        }),
      );
    });

    return { success: true };
  },
);

export default [updateInfluencerFoodYoutubeDetails];
