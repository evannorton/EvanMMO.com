import { faPlayCircle, faStopCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Image, MediaQuery, Text, Title } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { type NextPage } from "next";
import { useContext, useRef } from "react";
import { TwitchEmbed } from "react-twitch-embed";
import Head from "../components/Head";
import Section from "../components/Section";
import YouTubeCarousel from "../components/test";
import twitchUsername from "../constants/twitchUsername";
import context from "../context";
import streamIsLive from "../server/streamIsLive";
import youtubeAPI from "../server/youtubeAPI";
import type YouTubeVideo from "../types/YouTubeVideo";
import { api } from "../utils/api";

interface ServerSideProps {
  readonly streamIsLive: boolean;
  readonly youtubeVideos: YouTubeVideo[][];
}

interface Props extends ServerSideProps {}

const Home: NextPage<Props> = ({ streamIsLive, youtubeVideos }) => {
  const { videoID, gameID, setGameID } = useContext(context);
  const gameRef = useRef<HTMLIFrameElement>(null);
  const { data: games } = api.game.getAll.useQuery();
  const game = games?.find((game) => game.id === gameID);
  useQuery({});
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
                style={{
                  border: "none",
                  display: "block",
                  width: "100%",
                  height: "auto",
                  aspectRatio: 16 / 9,
                }}
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
      <Section>
        <>
          <Title id="games" color="gray.0" mb="md">
            Games
          </Title>
          {game && (
            <>
              <Box
                style={{
                  width: "100%",
                  overflow: "auto",
                }}
                mb="md"
              >
                <iframe
                  style={{
                    border: "none",
                    display: "block",
                    width: `${game.width}px`,
                    height: `${game.height}px`,
                    margin: "0 auto",
                  }}
                  src={game.embedURL}
                  allowFullScreen={false}
                  ref={gameRef}
                />
              </Box>
              <Box mb="md">
                <Text style={{ width: "90%", margin: "0 auto" }} align="center">
                  {game.description}
                </Text>
              </Box>
            </>
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              marginRight: "-16px",
            }}
          >
            {games?.map((game) => (
              <MediaQuery
                largerThan="md"
                styles={{
                  width: "calc(25% - 16px)",
                }}
                key={game.id}
              >
                <MediaQuery
                  smallerThan="md"
                  styles={{
                    width: "calc(50% - 16px)",
                  }}
                  key={game.id}
                >
                  <Box style={{ marginRight: "16px" }}>
                    <div
                      style={{ cursor: "pointer", position: "relative" }}
                      onClick={() => {
                        if (gameID !== game.id) {
                          setGameID(game.id);
                        } else {
                          setGameID(null);
                        }
                      }}
                    >
                      <div style={{ position: "relative" }}>
                        <Image
                          alt={game.title}
                          src={game.thumbnailURL}
                          style={{ opacity: gameID === game.id ? 1 : 0.75 }}
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
                          icon={
                            gameID !== game.id ? faPlayCircle : faStopCircle
                          }
                        />
                        {gameID === game.id && (
                          <div
                            style={{
                              border: "4px solid white",
                              position: "absolute",
                              top: 0,
                              width: "100%",
                              height: "100%",
                            }}
                          />
                        )}
                      </div>
                      <Text px="md" pt="xs" pb="md" align="center">
                        {game.title}
                      </Text>
                    </div>
                  </Box>
                </MediaQuery>
              </MediaQuery>
            ))}
          </div>
        </>
      </Section>
    </>
  );
};

export const getServerSideProps = async (): Promise<{
  readonly props: ServerSideProps;
}> => {
  // YouTube videos
  const youtubeVideos: YouTubeVideo[][] = [];
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
    ).data.items
      ?.filter((video) => video.snippet?.liveBroadcastContent === "none")
      .map((video) => ({
        id: video?.id || null,
        title: video?.snippet?.title || null,
        thumbnailURL: video?.snippet?.thumbnails?.maxres?.url || null,
      }));
    if (videos) {
      youtubeVideos.push(videos);
    }
  }
  return {
    props: {
      streamIsLive: await streamIsLive(),
      youtubeVideos,
    },
  };
};

export default Home;
