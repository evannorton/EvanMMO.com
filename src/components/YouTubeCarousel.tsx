import { Box, Image, Text } from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faPlayCircle,
  faStopCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useContext } from "react";
import context from "../context";
import type YouTubeVideo from "../types/YouTubeVideo";

interface Props {
  readonly videos: YouTubeVideo[];
}

const YouTubeCarousel: React.FC<Props> = ({ videos }) => {
  const { selectedVideoID: videoID, setSelectedVideoID: setVideoID } =
    useContext(context);
  return (
    <Carousel
      mb="md"
      slideSize={`${100 / 4}%`}
      slideGap="md"
      align="start"
      loop
      breakpoints={[
        { maxWidth: "md", slideSize: `${100 / 3}%` },
        { maxWidth: "sm", slideSize: `${100 / 2}%` },
        { maxWidth: "xs", slideSize: "100%", slideGap: 0 },
      ]}
      controlSize={40}
      previousControlIcon={
        <FontAwesomeIcon style={{ width: "1em" }} icon={faChevronLeft} />
      }
      nextControlIcon={
        <FontAwesomeIcon style={{ width: "1em" }} icon={faChevronRight} />
      }
    >
      {videos.map((video) => {
        if (video.title && video.thumbnailURL) {
          return (
            <Carousel.Slide key={video.id}>
              <Box
                style={{ cursor: "pointer" }}
                onClick={() => {
                  if (video.id) {
                    if (videoID !== video.id) {
                      setVideoID(video.id);
                    } else {
                      setVideoID(null);
                    }
                  }
                }}
              >
                <Box
                  pos="relative"
                  style={{
                    borderRadius: "0.5rem",
                    overflow: "hidden",
                  }}
                >
                  <Image
                    alt={video.title}
                    src={video.thumbnailURL}
                    style={{
                      opacity: videoID === video.id ? 1 : 0.75,
                    }}
                  />
                  <FontAwesomeIcon
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      right: 0,
                      margin: "auto",
                      width: "20%",
                      height: "auto",
                      boxShadow: "5px 5px 50px 5px #000000",
                      borderRadius: "50%",
                    }}
                    icon={videoID !== video.id ? faPlayCircle : faStopCircle}
                  />
                  {videoID === video.id && (
                    <Box
                      pos="absolute"
                      left={0}
                      top={0}
                      style={{
                        border: "4px solid white",
                        width: "100%",
                        height: "100%",
                      }}
                    />
                  )}
                </Box>
                <Text px="md" pt="xs" pb="md" align="center">
                  {video.title}
                </Text>
              </Box>
            </Carousel.Slide>
          );
        }
        return null;
      })}
    </Carousel>
  );
};

export default YouTubeCarousel;
