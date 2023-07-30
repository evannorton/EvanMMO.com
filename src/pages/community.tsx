import { type NextPage } from "next";
import { Title } from "@mantine/core";
import DiscordEmbed from "../components/DiscordEmbed";
import Head from "../components/Head";

const CommunityPage: NextPage = () => (
  <>
    <Head title="Community" description="Join EvanMMO's Discord community" />
    <Title order={1} color="gray.0" mb="md">
      Community
    </Title>
    <DiscordEmbed />
  </>
);

export default CommunityPage;
