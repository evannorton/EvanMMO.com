import { Anchor, Button, Card, SimpleGrid, Title } from "@mantine/core";
import { type NextPage } from "next";
import Head from "../components/Head";

const FunPage: NextPage = () => {
  return (
    <>
      <Head
        title="Fun Stuff"
        description="Miscellaneous interactive content from EvanMMO"
      />
      <Title order={1} color="gray.0" mb="xl">
        Fun Stuff
      </Title>

      <SimpleGrid
        cols={2}
        spacing="lg"
        breakpoints={[{ maxWidth: "md", cols: 1 }]}
      >
        <Card
          sx={{
            borderRadius: "0.5rem",
            textAlign: "center",
            padding: "2rem",
            transition: "transform 0.2s ease",
            "&:hover": {
              transform: "translateY(-4px)",
            },
          }}
        >
          <Title order={2} color="gray.0" mb="md">
            🎵 Soundboard
          </Title>
          <Anchor href="/soundboard" style={{ textDecoration: "none" }}>
            <Button
              size="lg"
              fullWidth
              sx={{
                fontSize: "1.1rem",
                fontWeight: "bold",
              }}
            >
              Open Soundboard
            </Button>
          </Anchor>
        </Card>

        <Card
          sx={{
            borderRadius: "0.5rem",
            textAlign: "center",
            padding: "2rem",
            transition: "transform 0.2s ease",
            "&:hover": {
              transform: "translateY(-4px)",
            },
          }}
        >
          <Title order={2} color="gray.0" mb="md">
            🎯 Livestream Guesser
          </Title>
          <Anchor href="/guesser" style={{ textDecoration: "none" }}>
            <Button
              size="lg"
              fullWidth
              sx={{
                fontSize: "1.1rem",
                fontWeight: "bold",
              }}
            >
              Play Livestream Guesser
            </Button>
          </Anchor>
        </Card>
      </SimpleGrid>
    </>
  );
};

export default FunPage;
