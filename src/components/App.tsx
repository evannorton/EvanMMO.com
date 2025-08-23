import {
  Anchor,
  AppShell,
  Box,
  Button,
  Flex,
  Footer,
  Header,
  Image,
  MediaQuery,
} from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { UserRole } from "@prisma/client";
import {
  faDiscord,
  faTwitch,
  faTwitter,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import { includeContent } from "../config";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

interface Props {
  readonly children: JSX.Element;
}

const App: React.FC<Props> = ({ children }) => {
  const { data: sessionData } = useSession();
  const headerLinks = [];
  if (includeContent) {
    headerLinks.push(
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
      }
    );
  }
  headerLinks.push(
    {
      text: "Games",
      href: "/games",
    },
    {
      text: "Community",
      href: "/community",
    }
  );
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
            style={{ maxHeight: "4.75em", height: "4.75em" }}
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
                <Image
                  style={{ width: "5em" }}
                  src="/evanmmo-logo.png"
                  alt="EvanMMO"
                />
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
                  {(sessionData?.user.role === UserRole.ADMIN ||
                    sessionData?.user.role === UserRole.MODERATOR) && (
                    <Anchor
                      sx={{
                        "&:hover": {
                          opacity: "0.75",
                          textDecoration: "none",
                        },
                      }}
                      href="/soundboard"
                      color="gray.4"
                      size={20}
                      weight="bold"
                      mr="xs"
                      underline={false}
                    >
                      Soundboard
                    </Anchor>
                  )}
                  {sessionData?.user.role === UserRole.ADMIN && (
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
          <Footer fixed={false} height="auto" p="md">
            <Box
              sx={{ alignItems: "center", justifyContent: "center" }}
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
                    style={{ display: "block", height: "2em" }}
                    icon={link.icon}
                  />
                </Anchor>
              ))}
            </Box>
            <Link
              href="https://www.paypal.com/donate/?hosted_button_id=4GETT9FKF4WWY"
              target="_blank"
              style={{
                width: "10em",
                display: "block",
                margin: "0 auto",
                marginTop: ".75em",
              }}
            >
              <Image
                sx={{
                  "&:hover": {
                    opacity: "0.75",
                  },
                }}
                src="/paypal.png"
                alt="Donate"
              />
            </Link>
          </Footer>
        }
      >
        <Box mt="sm" />
        {children}
      </AppShell>
    </Box>
  );
};

export default App;
