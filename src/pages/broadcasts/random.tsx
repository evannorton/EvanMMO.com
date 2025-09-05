import { Anchor, Button, Flex, Title } from "@mantine/core";
import { type NextPage } from "next";
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
      <Flex justify="space-between" align="center" mb="md">
        <Title order={1} color="gray.0">
          {vod &&
            `Random Broadcast (${getFormattedDateString(vod.streamDate)})`}
          {!vod && "Random Broadcast"}
        </Title>
        <Anchor href="/broadcasts/random" style={{ textDecoration: "none" }}>
          <Button
            variant="outline"
            size="md"
            sx={{
              fontWeight: "bold",
              "&:hover": {
                transform: "translateY(-1px)",
              },
              transition: "transform 0.1s ease",
            }}
          >
            🎲 Random Broadcast
          </Button>
        </Anchor>
      </Flex>
      {vod && <Broadcast vodID={vod.id} />}
    </>
  );
};

export default RandomBroadcastPage;
