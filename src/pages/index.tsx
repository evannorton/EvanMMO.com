import {
  Box,
  Button,
  Card,
  Image,
  Loader,
  Pagination,
  SimpleGrid,
  Text,
  Title,
} from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type NextPage } from "next";
import { TwitchEmbed } from "react-twitch-embed";
import { api } from "../utils/api";
import { faPlayCircle, faStopCircle } from "@fortawesome/free-solid-svg-icons";
import { getDescriptionPreview } from "../utils/description";
import { getFormattedDateString } from "../utils/date";
import { useContext, useRef, useState } from "react";
import Head from "../components/Head";
import Section from "../components/Section";
import VODPlayer from "../components/VODPlayer";
import YouTubeCarousel from "../components/YouTubeCarousel";
import context from "../context";
import twitchUsername from "../constants/twitchUsername";
import vodsPerPage from "../constants/vodsPerPage";

const Home: NextPage = () => {
  const { data: streamIsLive } = api.twitch.isLive.useQuery();
  const { data: youtubeVideos, isLoading: isLoadingVideos } =
    api.youtube.videos.useQuery();
  const [vodsPage, setVODsPage] = useState(1);
  const { data: vods, isLoading: isLoadingVODs } = api.vod.getAll.useQuery({
    page: vodsPage - 1,
  });
  const { data: vodsCount, isLoading: isLoadingVODsCount } =
    api.vod.getCount.useQuery();
  const { vodID, setVODID, videoID, gameID, setGameID } = useContext(context);
  const vod = vods?.find((vod) => vod.id === vodID);
  const gameRef = useRef<HTMLIFrameElement>(null);
  const { data: games, isLoading: isLoadingGames } = api.game.getAll.useQuery();
  const game = games?.find((game) => game.id === gameID);
  return (
    <>
      <Head description="A hub for EvanMMO's content creation and game development" />
      {streamIsLive && (
        <Section>
          <>
            <Title id="livestream" color="gray.0" mb="md">
              Livestream
            </Title>
            <Box
              style={{
                aspectRatio: 16 / 9,
                width: "100%",
                borderRadius: "0.5rem",
                overflow: "hidden",
              }}
            >
              <TwitchEmbed
                channel={twitchUsername}
                width="100%"
                height="100%"
              />
            </Box>
          </>
        </Section>
      )}
      <Section>
        <>
          <Title id="community" color="gray.0" mb="md">
            Community
          </Title>
          <iframe
            style={{ border: "none", borderRadius: "0.5rem", height: "25rem" }}
            src="https://discordapp.com/widget?id=543159733821898773&theme=dark"
            width="100%"
            sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
          />
        </>
      </Section>
      <Section>
        <>
          <Title id="videos" color="gray.0" mb="md">
            Videos
          </Title>
          {isLoadingVideos && <Loader />}
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
          {youtubeVideos?.map((channelYouTubeVideos, key) => (
            <YouTubeCarousel videos={channelYouTubeVideos} key={key} />
          ))}
        </>
      </Section>
      <Section>
        <>
          <Title id="broadcasts" color="gray.0" mb="md">
            Broadcasts
          </Title>
          {(isLoadingVODs || isLoadingVODsCount) && <Loader />}
          {vod && (
            <>
              <Box style={{ aspectRatio: 16 / 9, width: "100%" }} mb="md">
                <VODPlayer
                  pieces={vod.pieces.map((piece) => ({
                    id: piece.id,
                    mp4URL: piece.mp4URL,
                    jsonURL: piece.jsonURL,
                  }))}
                />
              </Box>
              <Box mb="md">
                <Text style={{ width: "90%", margin: "0 auto" }} align="center">
                  {vod.description}
                </Text>
              </Box>
            </>
          )}
          {typeof vodsCount !== "undefined" && (
            <Pagination
              value={vodsPage}
              onChange={setVODsPage}
              mb="md"
              total={Math.ceil(vodsCount / vodsPerPage)}
              withEdges
            />
          )}
          {vods && typeof vodsCount !== "undefined" && (
            <SimpleGrid
              cols={4}
              spacing="md"
              breakpoints={[{ maxWidth: "sm", cols: 2 }]}
            >
              {vods.map((vod) => {
                return (
                  <Card
                    style={{ flexDirection: "column", borderRadius: "0.5rem" }}
                    display="flex"
                    key={vod.id}
                  >
                    <Text size="lg" mb="sm">
                      {getFormattedDateString(vod.streamDate)}
                    </Text>
                    {getDescriptionPreview(vod.description)
                      .split("\n")
                      .map((line, key) => (
                        <Text key={key}>{line}</Text>
                      ))}
                    <Box mt="auto">
                      {vodID !== vod.id && (
                        <Button
                          color="green"
                          mt="sm"
                          onClick={() => {
                            setVODID(vod.id);
                          }}
                        >
                          Play
                        </Button>
                      )}
                      {vodID === vod.id && (
                        <Button
                          color="red"
                          mt="sm"
                          onClick={() => {
                            setVODID(null);
                          }}
                        >
                          Stop
                        </Button>
                      )}
                    </Box>
                  </Card>
                );
              })}
            </SimpleGrid>
          )}
          {typeof vodsCount !== "undefined" && (
            <Pagination
              value={vodsPage}
              onChange={setVODsPage}
              total={Math.ceil(vodsCount / vodsPerPage)}
              withEdges
              mt="sm"
            />
          )}
        </>
      </Section>
      <Section>
        <>
          <Title id="games" color="gray.0" mb="md">
            Games
          </Title>
          {isLoadingGames && <Loader />}
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
          <SimpleGrid
            cols={4}
            spacing="md"
            breakpoints={[{ maxWidth: "sm", cols: 2 }]}
          >
            {games?.map((game) => (
              <Box key={game.id}>
                <Box
                  style={{ cursor: "pointer", position: "relative" }}
                  onClick={() => {
                    if (gameID !== game.id) {
                      setGameID(game.id);
                    } else {
                      setGameID(null);
                    }
                  }}
                >
                  <Box
                    style={{
                      position: "relative",
                      borderRadius: "0.5rem",
                      overflow: "hidden",
                    }}
                  >
                    <Image
                      alt={game.title}
                      src={game.thumbnailURL}
                      style={{
                        opacity: gameID === game.id ? 1 : 0.75,
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
                      icon={gameID !== game.id ? faPlayCircle : faStopCircle}
                    />
                    {gameID === game.id && (
                      <Box
                        style={{
                          border: "4px solid white",
                          position: "absolute",
                          top: 0,
                          width: "100%",
                          height: "100%",
                        }}
                      />
                    )}
                  </Box>
                  <Text px="md" pt="xs" pb="md" align="center">
                    {game.title}
                  </Text>
                </Box>
              </Box>
            ))}
          </SimpleGrid>
        </>
      </Section>
    </>
  );
};

export default Home;
