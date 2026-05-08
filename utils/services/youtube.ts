import { getYouTubeID } from "./helpers";
import logger from "../logger";

type ThumbnailSize = "maxres" | "high" | "medium" | "default";
const THUMBNAIL_PREFERENCE: ThumbnailSize[] = ["maxres", "high", "medium", "default"];

const getYoutubeVideoTitleAndThumbnail = async (videoUrl: string) => {
  const videoId = getYouTubeID(videoUrl);

  if (!videoId) {
    throw new Error(`Could not extract video ID from URL: ${videoUrl}`);
  }

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${process.env.GOOGLE_YOUTUBE_API_KEY}`,
  );

  if (!res.ok) {
    throw new Error(`YouTube API error: ${res.status} ${res.statusText}`);
  }

  const video = await res.json();

  if (!video.items || video.items.length === 0) {
    throw new Error(`No YouTube video found for ID: ${videoId}`);
  }

  const snippet = video.items[0].snippet;
  const thumbnails = snippet?.thumbnails ?? {};

  const thumbnailUrl = THUMBNAIL_PREFERENCE.reduce<string | null>(
    (found, size) => found ?? thumbnails[size]?.url ?? null,
    null,
  );

  if (!thumbnailUrl) {
    logger.warn({ videoId }, "[youtube]: No thumbnail found for video");
  }

  return {
    thumbnailUrl: thumbnailUrl ?? "",
    title: snippet?.title ?? "",
    publishedAt: snippet?.publishedAt ?? null,
    videoId,
  };
};

export default getYoutubeVideoTitleAndThumbnail;
