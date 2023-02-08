import Head from "next/head";
import { AppShell, Button, Header } from "@mantine/core";
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
          <Header display="flex" height={60} p="xs">
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
