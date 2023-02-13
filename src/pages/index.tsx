import { type NextPage } from "next";
import { Title } from "@mantine/core";
import { TwitchEmbed } from "react-twitch-embed";
import twitchUsername from "../constants/twitchUsername";
import Head from "../components/Head";
import streamIsLive from "../server/streamIsLive";

interface ServerSideProps {
  readonly streamIsLive: boolean;
}

const Home: NextPage<ServerSideProps> = ({ streamIsLive }) => {
  return (
    <>
      <Head description="A hub for EvanMMO's content creation and game development" />
      {streamIsLive && (
        <>
          <Title id="livestream" color="gray.0" mb="md">
            Livestream
          </Title>
          <TwitchEmbed channel={twitchUsername} width="100%" height="75vh" />
        </>
      )}
    </>
  );
};

export const getServerSideProps = async (): Promise<{
  readonly props: ServerSideProps;
}> => {
  return { props: { streamIsLive: await streamIsLive() } };
};

export default Home;
