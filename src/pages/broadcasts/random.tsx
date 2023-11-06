import { type NextPage } from "next";
import { Title } from "@mantine/core";
import { api } from "../../utils/api";
import { getFormattedDateString } from "../../utils/date";
import Broadcast from "../../components/Broadcast";
import Head from "../../components/Head";

const RandomBroadcastPage: NextPage = () => {
  const { data: vod } = api.vod.getRandomVOD.useQuery(undefined, {
    refetchInterval: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
  return (
    <>
      <Head
        title="Random Broadcast"
        description="Watch a random EvanMMO broadcast"
      />
      <Title order={1} color="gray.0" mb="md">
        {vod && `Random Broadcast (${getFormattedDateString(vod.streamDate)})`}
        {!vod && "Random Broadcast"}
      </Title>
      {vod && <Broadcast vodID={vod.id} />}
    </>
  );
};

export default RandomBroadcastPage;
