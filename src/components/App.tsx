import {
  Anchor,
  AppShell,
  Box,
  Button,
  Flex,
  Footer,
  Header,
  MediaQuery,
} from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
  const headerLinks = [
    {
      text: "Livestream",
      href: "/livestream",
    },
    {
      text: "Videos",
      href: "/videos",
    },
    {
      text: "Broadcasts",
      href: "/broadcasts",
    },
    {
      text: "Games",
      href: "/games",
    },
    {
      text: "Community",
      href: "/community",
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
    <Box sx={{ maxWidth: 1440, margin: "0 auto" }}>
      <AppShell
        sx={{ paddingTop: "3.75rem" }}
        fixed={false}
        header={
          <Header
            fixed
            sx={{ alignItems: "center", maxWidth: 1440, margin: "0 auto" }}
            height={60}
            p="md"
            display="flex"
          >
            <Flex sx={{ width: "100%" }} align="center">
              <Anchor
                sx={{
                  "&:hover": {
                    opacity: "0.75",
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
                smallerThan="md"
                styles={{
                  display: "none",
                }}
              >
                <Box>
                  {headerLinks.map((link) => (
                    <Anchor
                      sx={{
                        "&:hover": {
                          opacity: "0.75",
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
                <Flex align="center" ml="auto">
                  {sessionData?.user.role === "ADMIN" && (
                    <Anchor
                      sx={{
                        "&:hover": {
                          opacity: "0.75",
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
                </Flex>
              )}
            </Flex>
          </Header>
        }
        footer={
          <Footer
            fixed={false}
            sx={{ alignItems: "center", justifyContent: "center" }}
            height={60}
            p="md"
            display="flex"
          >
            {footerSocialMediaLinks.map((link, key) => (
              <Anchor
                display="block"
                sx={{
                  height: "100%",
                  "&:hover": {
                    opacity: "0.75",
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
