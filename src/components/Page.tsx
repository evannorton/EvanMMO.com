import Head from "next/head";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@mantine/core";

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
      <header>
        <Button
          onClick={sessionData ? () => void signOut() : () => void signIn()}
        >
          {sessionData ? "Sign out" : "Sign in"}
        </Button>
      </header>
      <main></main>
    </>
  );
};

export default Page;
