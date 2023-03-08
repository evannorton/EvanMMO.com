import {
  AppShell,
  Anchor,
  Button,
  Header,
  MediaQuery,
  Box,
} from "@mantine/core";
import { signIn, signOut, useSession } from "next-auth/react";

interface Props {
  readonly children: JSX.Element;
  readonly streamIsLive: boolean;
}

const App: React.FC<Props> = ({ children, streamIsLive }) => {
  const { data: sessionData } = useSession();
  const links = [
    {
      text: "Livestream",
      href: "/#livestream",
      isShown: streamIsLive,
    },
    {
      text: "Videos",
      href: "/#videos",
      isShown: true,
    },
    {
      text: "Games",
      href: "/#games",
      isShown: true,
    },
  ];
  return (
    <AppShell
      fixed
      header={
        <Header
          style={{ alignItems: "center" }}
          height={60}
          p="md"
          display="flex"
        >
          <MediaQuery
            smallerThan="sm"
            styles={{
              display: "none",
            }}
          >
            <Box style={{ width: "100%", alignItems: "center" }} display="flex">
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
                mr="lg"
              >
                EvanMMO
              </Anchor>
              {links
                .filter((link) => link.isShown)
                .map((link) => (
                  <Anchor
                    sx={{
                      "&:hover": {
                        opacity: ".75",
                      },
                    }}
                    href={link.href}
                    color="gray.4"
                    size={20}
                    weight="bold"
                    mr="xs"
                    underline={false}
                    key={link.href}
                  >
                    {link.text}
                  </Anchor>
                ))}
              <Button
                color={sessionData ? "red" : "green"}
                style={{ marginLeft: "auto" }}
                onClick={
                  sessionData ? () => void signOut() : () => void signIn()
                }
              >
                {sessionData ? "Sign out" : "Sign in"}
              </Button>
            </Box>
          </MediaQuery>
          <MediaQuery
            largerThan="sm"
            styles={{
              display: "none",
            }}
          >
            <Box style={{ width: "100%", alignItems: "center" }} display="flex">
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
                mr="lg"
              >
                EvanMMO
              </Anchor>
              <Button
                color={sessionData ? "red" : "green"}
                style={{ marginLeft: "auto" }}
                onClick={
                  sessionData ? () => void signOut() : () => void signIn()
                }
              >
                {sessionData ? "Sign out" : "Sign in"}
              </Button>
            </Box>
          </MediaQuery>
        </Header>
      }
    >
      <Box px="md">{children}</Box>
    </AppShell>
  );
};

export default App;
