import { type NextPage } from "next";
import { Text, Title } from "@mantine/core";
import { api } from "../../utils/api";
import { getFormattedDateString } from "../../utils/date";
import { useRouter } from "next/router";
import Broadcast from "../../components/Broadcast";
import Head from "../../components/Head";

const BroadcastPage: NextPage = () => {
  const router = useRouter();
  if (typeof router.query.slug !== "string") {
    return null;
  }
  const { data: vod } = api.vod.getVOD.useQuery({
    id: router.query.slug,
  });

  const parseTimestamp = (timeParam: string): number => {
    const match = timeParam.match(/(\d+)m(\d+)s/);
    if (match) {
      const minutes = parseInt(match[1] ?? "0", 10);
      const seconds = parseInt(match[2] ?? "0", 10);
      return minutes * 60 + seconds;
    }
    return 0;
  };

  const initialTimestamp =
    typeof router.query.t === "string" ? parseTimestamp(router.query.t) : 0;

  return (
    <>
      <Head title="Broadcast" description="Watch EvanMMO's broadcast" />
      <Title order={1} color="gray.0" mb="md">
        {vod && `Broadcast ${getFormattedDateString(vod.streamDate)}`}
        {!vod && "Broadcast"}
      </Title>
      {typeof router.query.slug !== "string" && (
        <Text>Invalid broadcast link.</Text>
      )}
      {typeof router.query.slug === "string" && (
        <Broadcast
          vodID={router.query.slug}
          initialTimestamp={initialTimestamp}
        />
      )}
    </>
  );
};

export default BroadcastPage;
