import { type NextPage } from "next";
import { Text } from "@mantine/core";
import { useRouter } from "next/router";
import Broadcast from "../../components/Broadcast";
import Head from "../../components/Head";

const BroadcastPage: NextPage = () => {
  const router = useRouter();
  return (
    <>
      <Head title="Broadcast" description="Watch EvanMMO's broadcast" />
      {typeof router.query.slug !== "string" && (
        <Text>Invalid broadcast link.</Text>
      )}
      {typeof router.query.slug === "string" && (
        <Broadcast vodID={router.query.slug} />
      )}
    </>
  );
};

export default BroadcastPage;
