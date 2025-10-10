import { z } from "zod";

export const createInfluencerSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  imageUrl: z.string().min(1).optional(),
  instagram: z.string().min(1).optional(),
  facebook: z.string().min(1).optional(),
  twitter: z.string().min(1).optional(),
  snapchat: z.string().min(1).optional(),
  website: z.string().min(1).optional(),
  youtube: z.string().min(1).optional(),
  tiktok: z.string().min(1).optional(),
  linkedin: z.string().min(1).optional(),
  foodLinks: z.array(
    z.object({
      foodId: z.string().min(1),
      videoUrls: z.array(z.string()).min(1),
    })
  ),
});
