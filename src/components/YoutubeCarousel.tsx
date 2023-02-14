import type { youtube_v3 } from "googleapis";
import { Carousel } from "@mantine/carousel";
import { Image, Text } from "@mantine/core";
import { useContext } from "react";
import context from "../context";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlayCircle, faStopCircle } from "@fortawesome/free-solid-svg-icons";

interface Props {
  readonly videos: youtube_v3.Schema$Video[];
}

const YouTubeCarousel: React.FC<Props> = ({ videos }) => {
  const { videoID, setVideoID } = useContext(context);
  return (
    <Carousel
      mb="md"
      slideSize="33.333333%"
      slideGap="md"
      align="start"
      loop
      breakpoints={[
        { maxWidth: "md", slideSize: "50%" },
        { maxWidth: "sm", slideSize: "100%", slideGap: 0 },
      ]}
    >
      {videos.map((video) => {
        if (video.snippet) {
          if (video.snippet.title && video.snippet.thumbnails?.maxres?.url) {
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
                      alt={video.snippet.title}
                      src={video.snippet.thumbnails.maxres.url}
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
                  </div>
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
                  <Text px="md" pt="xs" pb="md" align="center">
                    {video.snippet.title}
                  </Text>
                </div>
              </Carousel.Slide>
            );
          }
        }
        return null;
      })}
    </Carousel>
  );
};

export default YouTubeCarousel;
