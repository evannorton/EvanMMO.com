import { type NextPage } from "next";
import { Title } from "@mantine/core";
import Broadcasts from "../../components/Broadcasts";
import Head from "../../components/Head";

const BroadcastsPage: NextPage = () => (
  <>
    <Head
      title="Broadcasts"
      description="Watch EvanMMO's past live broadcasts"
    />
    <Title order={1} color="gray.0" mb="md">
      Broadcasts
    </Title>
    <Broadcasts />
  </>
);

export default BroadcastsPage;
