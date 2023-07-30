import { type NextPage } from "next";
import { Title } from "@mantine/core";
import Games from "../components/Games";
import Head from "../components/Head";

const GamesPage: NextPage = () => (
  <>
    <Head title="Games" description="Play EvanMMO's web games" />
    <Title order={1} color="gray.0" mb="md">
      Games
    </Title>
    <Games />
  </>
);

export default GamesPage;
