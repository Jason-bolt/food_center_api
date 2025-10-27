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

// // --- Examples ---
// console.log("Standard URL: " + getYouTubeID("https://www.youtube.com/watch?v=OtJV9SCyfuE&t=4362s"));
// console.log("Short URL: " + getYouTubeID("https://youtu.be/OtJV9SCyfuE"));
// console.log("Embed URL: " + getYouTubeID("https://www.youtube.com/embed/OtJV9SCyfuE"));
// console.log("Playlist URL (Still works): " + getYouTubeID("https://www.youtube.com/watch?v=OtJV9SCyfuE&list=PLrA_dE0P6T25v5Wf4f_4c3s&index=1"));
// console.log("Invalid URL: " + getYouTubeID("https://www.google.com/"));
