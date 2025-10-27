import { z } from "zod";

export const createFoodSchema = z.object({
  name: z.string().min(1),
  country: z.string().min(1),
  region: z.string().min(1),
  culturalStory: z.string().min(1),
  description: z.string().min(1),
  imageUrl: z.string().min(1),
  ingredients: z.array(z.string()).min(1),
});