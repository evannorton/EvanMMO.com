import type { youtube_v3 } from "googleapis";
import { Carousel } from "@mantine/carousel";
import { Image } from "@mantine/core";

interface Props {
  readonly videos: youtube_v3.Schema$Video[];
}

const YoutubeCarousel: React.FC<Props> = ({ videos }) => {
  console.log(videos);
  return (
    <Carousel mb="md" slideSize="33.333333%" slideGap="md" align="start" loop>
      {videos.map((video) => {
        if (video.snippet) {
          if (video.snippet.title && video.snippet.thumbnails?.maxres?.url) {
            return (
              <Carousel.Slide key={video.id}>
                <Image
                  alt={video.snippet.title}
                  src={video.snippet.thumbnails.maxres.url}
                />
              </Carousel.Slide>
            );
          }
        }
        return null;
      })}
    </Carousel>
  );
};

export default YoutubeCarousel;
