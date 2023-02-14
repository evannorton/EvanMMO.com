import { type NextPage } from "next";
import { Box, Title } from "@mantine/core";
import { TwitchEmbed } from "react-twitch-embed";
import twitchUsername from "../constants/twitchUsername";
import Head from "../components/Head";
import streamIsLive from "../server/streamIsLive";
import Section from "../components/Section";
import youtubeAPI from "../server/youtubeAPI";
import { type youtube_v3 } from "googleapis";
import YouTubeCarousel from "../components/YouTubeCarousel";
import { useContext } from "react";
import context from "../context";

interface ServerSideProps {
  readonly streamIsLive: boolean;
  readonly youtubeVideos: youtube_v3.Schema$Video[][];
}

interface Props extends ServerSideProps {}

const Home: NextPage<Props> = ({ streamIsLive, youtubeVideos }) => {
  const { videoID } = useContext(context);
  return (
    <>
      <Head description="A hub for EvanMMO's content creation and game development" />
      {streamIsLive && (
        <Section>
          <>
            <Title id="livestream" color="gray.0" mb="md">
              Livestream
            </Title>
            <TwitchEmbed channel={twitchUsername} width="100%" height="75vh" />
          </>
        </Section>
      )}
      <Section>
        <>
          <Title id="videos" color="gray.0" mb="md">
            Videos
          </Title>
          {videoID && (
            <Box mb="md">
              <iframe
                style={{ border: "none", display: "block", height: "75vh" }}
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoID}?autoplay=1`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </Box>
          )}
          {youtubeVideos.map((channelYouTubeVideos, key) => (
            <YouTubeCarousel videos={channelYouTubeVideos} key={key} />
          ))}
        </>
      </Section>
    </>
  );
};

export const getServerSideProps = async (): Promise<{
  readonly props: ServerSideProps;
}> => {
  const youtubeVideos: youtube_v3.Schema$Video[][] = [];
  for (const playlistID of [
    "UULF3yvezJgR4p42q7XxKCY5SA",
    "UULFqxh53Dp_hb-Pxlc5ge1kCg",
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
    ).data.items?.filter(
      (video) => video.snippet?.liveBroadcastContent === "none"
    );
    if (videos) {
      youtubeVideos.push(videos);
    }
  }
  return {
    props: { streamIsLive: await streamIsLive(), youtubeVideos },
  };
};

export default Home;
