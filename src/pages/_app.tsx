import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { api } from "../utils/api";
import { MantineProvider } from "@mantine/core";
import App from "../components/App";
import streamIsLive from "../server/streamIsLive";
import context from "../context";
import { useState } from "react";

interface ServerSideProps {
  readonly streamIsLive: boolean;
}

interface Props extends ServerSideProps {
  readonly session: Session | null;
}

const MyApp: AppType<Props> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const [videoID, setVideoID] = useState<string | null>(null);
  return (
    <SessionProvider session={session}>
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          /** Put your mantine theme override here */
          colorScheme: "dark",
        }}
      >
        <context.Provider value={{ videoID, setVideoID }}>
          <App streamIsLive={pageProps.streamIsLive}>
            <Component {...pageProps} />
          </App>
        </context.Provider>
      </MantineProvider>
    </SessionProvider>
  );
};

export const getServerSideProps = async (): Promise<{
  readonly props: ServerSideProps;
}> => {
  return { props: { streamIsLive: await streamIsLive() } };
};

export default api.withTRPC(MyApp);
