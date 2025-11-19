import { getYouTubeID } from "./helpers";

const getYoutubeVideoTitleAndThumbnail = async (videoUrl: string) => {
  const videoId = getYouTubeID(videoUrl);
  const video = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${process.env.GOOGLE_YOUTUBE_API_KEY}`
  ).then((res) => res.json());

  const thumbnailUrl = video.items[0].snippet.thumbnails.maxres.url;
  const title = video.items[0].snippet.title;
  const publishedAt = video.items[0].snippet.publishedAt;

  return {
    thumbnailUrl,
    title,
    publishedAt,
    videoId,
  };
};

export default getYoutubeVideoTitleAndThumbnail;
