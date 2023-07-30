import { type NextPage } from "next";
import { Title } from "@mantine/core";
import Head from "../components/Head";
import Videos from "../components/Videos";

const VideosPage: NextPage = () => (
  <>
    <Head title="Videos" description="Watch EvanMMO's YouTube videos" />
    <Title order={1} color="gray.0" mb="md">
      Videos
    </Title>
    <Videos />
  </>
);

export default VideosPage;
