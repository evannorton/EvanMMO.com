import { Box, Title } from "@mantine/core";
import { type NextPage } from "next";
import { api } from "../utils/api";
import Broadcasts from "../components/Broadcasts";
import DiscordEmbed from "../components/DiscordEmbed";
import Games from "../components/Games";
import Head from "../components/Head";
import LivestreamEmbed from "../components/LivestreamEmbed";
import Section from "../components/Section";
import Videos from "../components/Videos";

const HomePage: NextPage = () => {
  const { data: streamIsLive } = api.twitch.isLive.useQuery();
  return (
    <>
      <Head description="A hub for EvanMMO's content creation and game development" />
      <Box mt="sm" />
      {streamIsLive && (
        <Section>
          <>
            <Title id="livestream" order={2} color="gray.0" mb="md">
              Livestream
            </Title>
            <LivestreamEmbed />
          </>
        </Section>
      )}
      <Section>
        <>
          <Title id="videos" order={2} color="gray.0" mb="md">
            Videos
          </Title>
          <Videos />
        </>
      </Section>
      <Section>
        <>
          <Title id="broadcasts" order={2} color="gray.0" mb="md">
            Broadcasts
          </Title>
          <Broadcasts />
        </>
      </Section>
      <Section>
        <>
          <Title id="games" order={2} color="gray.0" mb="md">
            Games
          </Title>
          <Games />
        </>
      </Section>
      <Section>
        <>
          <Title id="community" order={2} color="gray.0" mb="md">
            Community
          </Title>
          <DiscordEmbed />
        </>
      </Section>
    </>
  );
};

export default HomePage;
