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
  Text,
} from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { UserRole } from "@prisma/client";
import {
  faDiscord,
  faInstagram,
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
      icon: faInstagram,
      href: "https://instagram.com/evan_mmo",
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
                    sessionData?.user.role === UserRole.MODERATOR ||
                    sessionData?.user.role === UserRole.CONTRIBUTOR) && (
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
          <Footer
            fixed={false}
            height="auto"
            p="md"
            display="flex"
            style={{ flexDirection: "column", alignItems: "center" }}
          >
            <Flex
              sx={{
                width: "100%",
                "@media (max-width: 1080px)": {
                  flexDirection: "column",
                  gap: "lg",
                },
              }}
            >
              {/* Misc Fun Section - 33.33% width */}
              <Box
                sx={{
                  flex: "1",
                  textAlign: "center",
                  "@media (max-width: 1080px)": {
                    width: "100%",
                  },
                }}
                mb="xs"
              >
                <Text
                  size="sm"
                  color="gray.5"
                  weight="bold"
                  mb="xs"
                  sx={{
                    textAlign: "center",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Misc Fun
                </Text>
                <Flex gap="sm" justify="center">
                  <Anchor href="/soundboard" style={{ textDecoration: "none" }}>
                    <Button
                      variant="outline"
                      size="sm"
                      sx={{
                        fontWeight: "bold",
                        fontSize: "14px",
                        height: "40px",
                      }}
                    >
                      🎵 Soundboard
                    </Button>
                  </Anchor>
                  <Anchor href="/guesser" style={{ textDecoration: "none" }}>
                    <Button
                      variant="outline"
                      size="sm"
                      sx={{
                        fontWeight: "bold",
                        fontSize: "14px",
                        height: "40px",
                      }}
                    >
                      🎯 Livestream Guesser
                    </Button>
                  </Anchor>
                </Flex>
              </Box>

              {/* Socials Section - 33.33% width */}
              <Box
                sx={{
                  flex: "1",
                  textAlign: "center",
                  "@media (max-width: 900px)": {
                    width: "100%",
                  },
                }}
                mb="xs"
              >
                <Text
                  size="sm"
                  color="gray.5"
                  weight="bold"
                  mb="xs"
                  sx={{
                    textAlign: "center",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Socials
                </Text>
                <Flex gap="lg" justify="center" align="center">
                  {footerSocialMediaLinks.map((link) => (
                    <Anchor
                      display="block"
                      sx={{
                        height: "32px",
                        "@media (min-width: 1081px)": {
                          marginTop: "4px",
                        },
                        "&:hover": {
                          opacity: "0.75",
                        },
                      }}
                      target="_blank"
                      color="gray.4"
                      href={link.href}
                      key={link.href}
                    >
                      <FontAwesomeIcon
                        style={{
                          height: "100%",
                          display: "block",
                        }}
                        icon={link.icon}
                      />
                    </Anchor>
                  ))}
                </Flex>
              </Box>

              {/* Donate Section - 33.33% width */}
              <Box
                sx={{
                  flex: "1",
                  textAlign: "center",
                  "@media (max-width: 1080px)": {
                    width: "100%",
                  },
                }}
                mb="xs"
              >
                <Text
                  size="sm"
                  color="gray.5"
                  weight="bold"
                  mb="xs"
                  sx={{
                    textAlign: "center",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Support
                </Text>
                <Flex gap="sm" justify="center" align="center" wrap="wrap">
                  <Link
                    href="https://www.paypal.com/donate/?hosted_button_id=4GETT9FKF4WWY"
                    target="_blank"
                    style={{
                      textDecoration: "none",
                    }}
                  >
                    <Image
                      sx={{
                        "&:hover": {
                          opacity: "0.75",
                        },
                      }}
                      src="/paypal.png"
                      alt="Donate via PayPal"
                      height={40}
                    />
                  </Link>
                  <Anchor
                    href="https://www.patreon.com/bePatron?u=41577481"
                    target="_blank"
                    style={{ textDecoration: "none" }}
                  >
                    <Button
                      size="sm"
                      sx={{
                        fontWeight: "bold",
                        fontSize: "14px",
                        height: "40px",
                        backgroundColor: "black",
                        color: "white",
                        border: "1px solid #A7A7A7",
                        "&:hover": {
                          backgroundColor: "black",
                          opacity: "0.75",
                        },
                      }}
                      leftIcon={
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="white"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M20.25 8.416c0-.943-.366-2.297-1.498-3.415C17.62 3.883 15.722 3 12.656 3c-3.733 0-5.96 1.19-7.253 2.91C4.11 7.627 3.75 9.875 3.75 11.991c0 3.113.42 5.365 1.141 6.84C5.612 20.304 6.634 21 7.836 21c1.4 0 2.205-.903 2.824-2.024.619-1.12 1.051-2.46 1.704-3.332.467-.623 1-1.023 1.602-1.312.602-.29 1.273-.469 2.012-.651 1.27-.313 2.338-.969 3.089-1.876.75-.908 1.183-2.067 1.183-3.389" />
                        </svg>
                      }
                    >
                      Become a Patron
                    </Button>
                  </Anchor>
                </Flex>
              </Box>
            </Flex>
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
