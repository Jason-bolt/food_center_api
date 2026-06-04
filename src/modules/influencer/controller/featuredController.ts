import { Request, Response } from "express";
import FeaturedSlotModel from "../../../../config/db/models/FeaturedSlotModel";
import InfluencerModel from "../../../../config/db/models/InfluencerModel";
import { sendFeaturedInquiryEmail } from "../../../../utils/services/mailgun";
import logger from "../../../../utils/logger";

class FeaturedController {
  /** GET /influencers/featured-slots/active — public, used by the home page hero */
  getActiveFeaturedSlot = async (_req: Request, res: Response): Promise<void> => {
    const now = new Date();
    const slot = await FeaturedSlotModel.findOne({
      position: "hero",
      startDate: { $lte: now },
      endDate:   { $gte: now },
    })
      .sort({ createdAt: -1 })
      .populate("influencerId", "name description imageUrl instagram youtube tiktok");

    res.json(slot ?? null);
  };

  /** GET /influencers/featured-slots — admin */
  getAllSlots = async (_req: Request, res: Response): Promise<void> => {
    const slots = await FeaturedSlotModel.find()
      .sort({ startDate: -1 })
      .populate("influencerId", "name imageUrl");
    res.json(slots);
  };

  /** POST /influencers/featured-slots — admin */
  createSlot = async (req: Request, res: Response): Promise<void> => {
    const { influencerId, startDate, endDate, position, price, note } = req.body as {
      influencerId: string; startDate: string; endDate: string;
      position?: "hero" | "sidebar"; price: number; note?: string;
    };

    const influencer = await InfluencerModel.findById(influencerId);
    if (!influencer) { res.status(404).json({ error: "Influencer not found" }); return; }

    const slot = await FeaturedSlotModel.create({
      influencerId, startDate: new Date(startDate), endDate: new Date(endDate),
      position: position ?? "hero", price, note,
    });

    // Mark the influencer as featured
    await InfluencerModel.findByIdAndUpdate(influencerId, { featured: true });

    logger.info({ slotId: slot._id }, "[FeaturedController]: Featured slot created");
    res.status(201).json(slot);
  };

  /** PUT /influencers/featured-slots/:id — admin */
  updateSlot = async (req: Request, res: Response): Promise<void> => {
    const slot = await FeaturedSlotModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!slot) { res.status(404).json({ error: "Slot not found" }); return; }
    res.json(slot);
  };

  /** DELETE /influencers/featured-slots/:id — admin */
  deleteSlot = async (req: Request, res: Response): Promise<void> => {
    const slot = await FeaturedSlotModel.findByIdAndDelete(req.params.id);
    if (!slot) { res.status(404).json({ error: "Slot not found" }); return; }

    // If no other active slots exist for this influencer, unmark featured
    const remaining = await FeaturedSlotModel.countDocuments({ influencerId: slot.influencerId });
    if (remaining === 0) {
      await InfluencerModel.findByIdAndUpdate(slot.influencerId, { featured: false });
    }

    res.json({ message: "Slot deleted" });
  };

  /** POST /influencers/inquiry — public, "want to be featured?" contact form */
  submitInquiry = async (req: Request, res: Response): Promise<void> => {
    const { name, email, message } = req.body as { name: string; email: string; message: string };
    if (!name || !email || !message) {
      res.status(400).json({ error: "name, email, and message are required" });
      return;
    }
    // Fire-and-forget — never block the response
    sendFeaturedInquiryEmail({ name, email, message });
    res.json({ message: "Inquiry received. We'll be in touch!" });
  };
}

export default new FeaturedController();
