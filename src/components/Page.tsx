import Head from "next/head";
import { signIn, signOut, useSession } from "next-auth/react";
import Header from "./Header";

const Page: React.FC = () => {
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
      <Header />
      <main>
        <div>
          <div>
            <AuthShowcase />
          </div>
        </div>
      </main>
    </>
  );
};

const AuthShowcase: React.FC = () => {
  const { data: sessionData } = useSession();

  return (
    <div>
      <p>{sessionData && <span>Logged in as {sessionData.user?.name}</span>}</p>
      <button
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
};

export default Page;
