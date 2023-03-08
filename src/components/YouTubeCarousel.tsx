import {
  faChevronLeft,
  faChevronRight,
  faPlayCircle,
  faStopCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Carousel } from "@mantine/carousel";
import { Image, Text } from "@mantine/core";
import { useContext } from "react";
import context from "../context";
import type YouTubeVideo from "../types/YouTubeVideo";

interface Props {
  readonly videos: YouTubeVideo[];
}

const YouTubeCarousel: React.FC<Props> = ({ videos }) => {
  const { videoID, setVideoID } = useContext(context);
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
              <div
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
                <div style={{ position: "relative" }}>
                  <Image
                    alt={video.title}
                    src={video.thumbnailURL}
                    style={{ opacity: videoID === video.id ? 1 : 0.75 }}
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
                    <div
                      style={{
                        border: "4px solid white",
                        position: "absolute",
                        left: 0,
                        top: 0,
                        width: "100%",
                        height: "100%",
                      }}
                    />
                  )}
                </div>
                <Text px="md" pt="xs" pb="md" align="center">
                  {video.title}
                </Text>
              </div>
            </Carousel.Slide>
          );
        }
        return null;
      })}
    </Carousel>
  );
};

export default YouTubeCarousel;
