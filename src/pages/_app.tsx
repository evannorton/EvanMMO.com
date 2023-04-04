import "../style.css";
import { type AppType } from "next/app";
import { MantineProvider } from "@mantine/core";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { api } from "../utils/api";
import { useState } from "react";
import App from "../components/App";
import context from "../context";

interface Props {
  readonly session: Session | null;
}

const MyApp: AppType<Props> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const [vodID, setVODID] = useState<string | null>(null);
  const [videoID, setVideoID] = useState<string | null>(null);
  const [gameID, setGameID] = useState<string | null>(null);
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
        <context.Provider
          value={{ vodID, setVODID, videoID, setVideoID, gameID, setGameID }}
        >
          <App>
            <Component {...pageProps} />
          </App>
        </context.Provider>
      </MantineProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
