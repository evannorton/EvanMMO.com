import { Anchor, Button, Flex, Title } from "@mantine/core";
import { type NextPage } from "next";
import Broadcasts from "../../components/Broadcasts";
import Head from "../../components/Head";

const BroadcastsPage: NextPage = () => (
  <>
    <Head
      title="Broadcasts"
      description="Watch EvanMMO's past live broadcasts"
    />
    <Flex justify="space-between" align="center" mb="md">
      <Title order={1} color="gray.0">
        Broadcasts
      </Title>
      <Anchor href="/broadcasts/random" style={{ textDecoration: "none" }}>
        <Button
          variant="outline"
          size="md"
          sx={{
            fontWeight: "bold",
          }}
        >
          🎲 Random Broadcast
        </Button>
      </Anchor>
    </Flex>
    <Broadcasts />
  </>
);

export default BroadcastsPage;
