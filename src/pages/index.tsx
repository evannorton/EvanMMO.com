import { type NextPage } from "next";
import Page from "../components/Page";
import { Title } from "@mantine/core";
import { TwitchEmbed } from "react-twitch-embed";
import fetchHelix from "../server/fetchHelix";
import twitchUsername from "../constants/twitchUsername";
import type StreamsResponse from "../types/twitch/StreamsResponse";

interface ServerSideProps {
  readonly streamIsLive: boolean;
}

const Home: NextPage<ServerSideProps> = ({ streamIsLive }) => {
  return (
    <Page>
      {streamIsLive && (
        <>
          <Title mb="md">Livestream</Title>
          <TwitchEmbed channel={twitchUsername} width="100%" height="75vh" />
        </>
      )}
    </Page>
  );
};

export const getServerSideProps = async (): Promise<{
  readonly props: ServerSideProps;
}> => {
  const streamsRes = await fetchHelix(`streams?user_login=${twitchUsername}`);
  const streams: StreamsResponse = (await streamsRes.json()) as StreamsResponse;
  return { props: { streamIsLive: streams.data.length > 0 } };
};

export default Home;
