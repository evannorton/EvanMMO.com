import { AppShell, Anchor, Button, Header } from "@mantine/core";
import { signIn, signOut, useSession } from "next-auth/react";

interface AppProps {
  readonly children: JSX.Element;
  readonly streamIsLive: boolean;
}

const App: React.FC<AppProps> = ({ children, streamIsLive }) => {
  const { data: sessionData } = useSession();
  return (
    <AppShell
      fixed
      padding="md"
      header={
        <Header
          style={{ alignItems: "center" }}
          display="flex"
          height={60}
          p="md"
        >
          <Anchor
            sx={{
              "&:hover": {
                opacity: ".75",
              },
            }}
            href="/"
            color="gray.0"
            size={24}
            weight="bold"
            underline={false}
          >
            EvanMMO
          </Anchor>
          {streamIsLive && (
            <Anchor
              sx={{
                "&:hover": {
                  opacity: ".75",
                },
              }}
              href="/#livestream"
              color="gray.4"
              size={20}
              weight="bold"
              ml="sm"
              underline={false}
            >
              Livestream
            </Anchor>
          )}
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
      {children}
    </AppShell>
  );
};

export default App;
