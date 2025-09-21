import { createTRPCRouter, publicProcedure } from "../trpc";
import youtubeAPI from "../../youtubeAPI";
import type YouTubeVideo from "../../../types/YouTubeVideo";

export const youtubeRouter = createTRPCRouter({
  getVideos: publicProcedure.query(async () => {
    // YouTube videos
    const youtubeVideos: YouTubeVideo[][] = [];
    for (const playlistID of [
      "UULF3yvezJgR4p42q7XxKCY5SA", // EvanMMO
    ]) {
      const playlistItems =
        (
          await youtubeAPI.playlistItems.list({
            playlistId: playlistID,
            part: ["contentDetails", "status"],
            maxResults: 50,
          })
        ).data.items || [];
      const videoIDs: string[] = [];
      playlistItems.forEach((playlistItem) => {
        if (playlistItem.contentDetails?.videoId && playlistItem) {
          videoIDs.push(playlistItem.contentDetails.videoId);
        }
      });
      const videos = (
        await youtubeAPI.videos.list({
          id: videoIDs,
          part: ["snippet"],
        })
      ).data.items
        ?.filter((video) => video.snippet?.liveBroadcastContent === "none")
        .map((video) => ({
          id: video?.id || null,
          title: video?.snippet?.title || null,
          thumbnailURL: video?.snippet?.thumbnails?.maxres?.url || null,
        }));
      console.log(videos);
      if (videos) {
        youtubeVideos.push(videos);
      }
    }
    return youtubeVideos;
  }),
});
