/**
 * Extracts the YouTube video ID from various URL formats.
 * @param {string} url The YouTube video URL.
 * @returns {string|null} The 11-character video ID, or null if not found.
 */
export const getYouTubeID = (url: string) => {
  if (!url || typeof url !== "string") {
    return null;
  }
  const regex =
    // eslint-disable-next-line no-useless-escape
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match && match[1].length === 11 ? match[1] : null;
};

