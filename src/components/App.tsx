import {
  faDiscord,
  faTwitch,
  faTwitter,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Anchor,
  AppShell,
  Box,
  Button,
  Footer,
  Header,
  MediaQuery,
} from "@mantine/core";
import { signIn, signOut, useSession } from "next-auth/react";

interface Props {
  readonly children: JSX.Element;
  readonly streamIsLive: boolean;
}

const App: React.FC<Props> = ({ children, streamIsLive }) => {
  const { data: sessionData } = useSession();
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
    <AppShell
      style={{ paddingTop: "3.75rem" }}
      fixed={false}
      header={
        <Header
          fixed
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
  );
};

export default App;
