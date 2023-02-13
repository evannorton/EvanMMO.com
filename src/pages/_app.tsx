import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { api } from "../utils/api";
import { MantineProvider } from "@mantine/core";
import App from "../components/App";
import streamIsLive from "../server/streamIsLive";

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
        <App streamIsLive={pageProps.streamIsLive}>
          <Component {...pageProps} />
        </App>
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
