import { Loader, Text, Title } from "@mantine/core";
import { type NextPage } from "next";
import { api } from "../utils/api";
import DiscordEmbed from "../components/DiscordEmbed";
import Head from "../components/Head";
import LivestreamEmbed from "../components/LivestreamEmbed";

const LivestreamPage: NextPage = () => {
  const { data: streamIsLive } = api.twitch.isLive.useQuery();
  return (
    <>
      <Head title="Livestream" description="Watch EvanMMO's live broadcast" />
      <Title order={1} color="gray.0" mb="md">
        Livestream
      </Title>
      {typeof streamIsLive === "undefined" && <Loader />}
      {streamIsLive === true && <LivestreamEmbed />}
      {streamIsLive === false && (
        <>
          <Text mb="md">
            EvanMMO is not currently live. Join the offline community in Discord
            in the meantime:
          </Text>
          <DiscordEmbed />
        </>
      )}
    </>
  );
};

export default LivestreamPage;
