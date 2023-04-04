import {
  Anchor,
  AppShell,
  Box,
  Button,
  Footer,
  Header,
  MediaQuery,
} from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { api } from "../utils/api";
import {
  faDiscord,
  faTwitch,
  faTwitter,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import { signIn, signOut, useSession } from "next-auth/react";

interface Props {
  readonly children: JSX.Element;
}

const App: React.FC<Props> = ({ children }) => {
  const { data: sessionData } = useSession();
  const { data: streamIsLive } = api.twitch.isLive.useQuery();
  const headerLinks = [
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
      text: "Broadcasts",
      href: "/#broadcasts",
      isShown: true,
    },
    {
      text: "Games",
      href: "/#games",
      isShown: true,
    },
  ];
  const footerSocialMediaLinks = [
    {
      icon: faTwitch,
      href: "https://twitch.tv/evanmmo",
    },
    {
      icon: faYoutube,
      href: "https://youtube.com/@evanmmo",
    },
    {
      icon: faTwitter,
      href: "https://twitter.com/evan_mmo",
    },
    {
      icon: faDiscord,
      href: "https://discord.gg/evanmmo",
    },
  ];
  return (
    <Box style={{ maxWidth: 1440, margin: "0 auto" }}>
      <AppShell
        style={{ paddingTop: "3.75rem" }}
        fixed={false}
        header={
          <Header
            fixed
            style={{ alignItems: "center", maxWidth: 1440, margin: "0 auto" }}
            height={60}
            p="md"
            display="flex"
          >
            <Box style={{ width: "100%", alignItems: "center" }} display="flex">
              <Anchor
                sx={{
                  "&:hover": {
                    opacity: ".75",
                    textDecoration: "none",
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
              <MediaQuery
                smallerThan="sm"
                styles={{
                  display: "none",
                }}
              >
                <Box>
                  {headerLinks
                    .filter((link) => link.isShown)
                    .map((link) => (
                      <Anchor
                        sx={{
                          "&:hover": {
                            opacity: ".75",
                            textDecoration: "none",
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
                </Box>
              </MediaQuery>
              {typeof sessionData !== "undefined" && (
                <Box
                  display="flex"
                  style={{ alignItems: "center", marginLeft: "auto" }}
                >
                  {sessionData?.user.role === "ADMIN" && (
                    <Anchor
                      sx={{
                        "&:hover": {
                          opacity: ".75",
                          textDecoration: "none",
                        },
                      }}
                      href="/dashboard"
                      color="gray.4"
                      size={20}
                      weight="bold"
                      mr="xs"
                      underline={false}
                    >
                      Dashboard
                    </Anchor>
                  )}
                  <Button
                    color={sessionData ? "red" : "green"}
                    onClick={
                      sessionData ? () => void signOut() : () => void signIn()
                    }
                  >
                    {sessionData ? "Sign out" : "Sign in"}
                  </Button>
                </Box>
              )}
            </Box>
          </Header>
        }
        footer={
          <Footer
            fixed={false}
            style={{ alignItems: "center", justifyContent: "center" }}
            height={60}
            p="md"
            display="flex"
          >
            {footerSocialMediaLinks.map((link, key) => (
              <Anchor
                display="block"
                style={{ display: "block", height: "100%" }}
                sx={{
                  "&:hover": {
                    opacity: ".75",
                  },
                }}
                target="_blank"
                color="gray.4"
                ml={key > 0 ? "lg" : undefined}
                href={link.href}
                key={link.href}
              >
                <FontAwesomeIcon
                  style={{ display: "block", height: "100%" }}
                  icon={link.icon}
                />
              </Anchor>
            ))}
          </Footer>
        }
      >
        {children}
      </AppShell>
    </Box>
  );
};

export default App;
