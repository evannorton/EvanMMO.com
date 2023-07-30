import { Box, Loader } from "@mantine/core";
import { api } from "../utils/api";
import { useContext } from "react";
import YouTubeCarousel from "../components/YouTubeCarousel";
import context from "../context";

interface Props {}

const DiscordEmbed: React.FC<Props> = () => {
  const { selectedVideoID } = useContext(context);
  const { data: youtubeVideos, isLoading: isLoadingVideos } =
    api.youtube.videos.useQuery();
  return (
    <>
      {isLoadingVideos && <Loader />}
      {selectedVideoID && (
        <Box mb="md">
          <iframe
            style={{
              border: "none",
              display: "block",
              width: "100%",
              height: "auto",
              aspectRatio: "16 / 9",
            }}
            src={`https://www.youtube.com/embed/${selectedVideoID}?autoplay=1`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </Box>
      )}
      {youtubeVideos?.map((channelYouTubeVideos, key) => (
        <YouTubeCarousel videos={channelYouTubeVideos} key={key} />
      ))}
    </>
  );
};

export default DiscordEmbed;
