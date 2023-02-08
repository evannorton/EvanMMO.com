import Head from "next/head";
import { AppShell, Anchor, Button, Header } from "@mantine/core";
import { signIn, signOut, useSession } from "next-auth/react";

const Page: React.FC = () => {
  const { data: sessionData } = useSession();
  return (
    <>
      <Head>
        <title>EvanMMO</title>
        <meta
          name="description"
          content="A hub for EvanMMO's content creation and game development"
        />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <AppShell
        fixed
        padding="md"
        header={
          <Header
            style={{ alignItems: "center" }}
            display="flex"
            height={60}
            p="xs"
          >
            <Anchor
              sx={{
                "&:hover": {
                  opacity: ".75",
                },
              }}
              href="/"
              color="gray.0"
              size={32}
              weight="bold"
              underline={false}
            >
              EvanMMO
            </Anchor>
            <Button
              color={sessionData ? "red" : "green"}
              style={{ marginLeft: "auto" }}
              onClick={sessionData ? () => void signOut() : () => void signIn()}
            >
              {sessionData ? "Sign out" : "Sign in"}
            </Button>
          </Header>
        }
      >
        <main></main>
      </AppShell>
    </>
  );
};

export default Page;
