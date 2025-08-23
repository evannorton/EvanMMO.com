import {
  Button,
  Card,
  Loader,
  Modal,
  Popover,
  SimpleGrid,
  Switch,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { Image } from "@mantine/core";
import { type Socket, io } from "socket.io-client";
import { UserRole } from "@prisma/client";
import { api } from "../utils/api";
import { env } from "../env.mjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import Head from "../components/Head";
import type { EmojiClickData } from "emoji-picker-react";
import type { NextPage } from "next";

interface SoundLogEntry {
  soundId: string;
  soundName: string;
  playedBy: string;
  playedById: string;
  timestamp: string;
}

interface ConnectedUser {
  id: string;
  name: string;
  role: string;
  image: string | null;
  muted: boolean;
}

interface ConnectedUsersData {
  users: ConnectedUser[];
  count: number;
  timestamp: string;
}

const SoundboardPage: NextPage = () => {
  const { data: session } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [audioCache, setAudioCache] = useState<Map<string, HTMLAudioElement>>(
    new Map()
  );
  const [soundLog, setSoundLog] = useState<SoundLogEntry[]>([]);
  const [connectedUsers, setConnectedUsers] =
    useState<ConnectedUsersData | null>(null);
  const [showUsersList, setShowUsersList] = useState(false);
  const {
    data: soundboardSounds,
    isLoading: isLoadingSoundboardSounds,
    refetch: refetchSoundboardSounds,
  } = session?.user
    ? api.soundboard.getSoundboardSoundsWithUserPins.useQuery()
    : api.soundboard.getSoundboardSounds.useQuery();

  const isPrivilegedUser =
    session?.user?.role === UserRole.ADMIN ||
    session?.user?.role === UserRole.MODERATOR;

  const toggleSoundPinMutation =
    api.soundboard.toggleSoundPinForUser.useMutation();
  const updateSoundEmojiMutation =
    api.soundboard.updateSoundboardSoundEmoji.useMutation();
  const renameSoundMutation =
    api.soundboard.renameSoundboardSound.useMutation();
  const [emojiPickerOpen, setEmojiPickerOpen] = useState<string | null>(null);
  const [renamingSoundId, setRenamingSoundId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [compactMode, setCompactMode] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);

  // Use ref to track current mute state for socket handlers
  const isMutedRef = useRef(false);

  // Force compact mode for non-privileged users
  const effectiveCompactMode = isPrivilegedUser ? compactMode : true;

  const handleRenameSubmit = useCallback(() => {
    if (renamingSoundId && renameValue.trim()) {
      renameSoundMutation
        .mutateAsync({
          id: renamingSoundId,
          name: renameValue.trim(),
        })
        .then(() => {
          refetchSoundboardSounds().catch((e) => {
            throw e;
          });
          setRenamingSoundId(null);
          setRenameValue("");
        })
        .catch((e) => {
          throw e;
        });
    }
  }, [
    renamingSoundId,
    renameValue,
    renameSoundMutation,
    refetchSoundboardSounds,
  ]);

  // Helper function to get or create cached audio
  const getCachedAudio = useCallback(
    (soundUrl: string): HTMLAudioElement => {
      let audio = audioCache.get(soundUrl);
      if (!audio) {
        audio = new Audio(soundUrl);
        audio.preload = "auto";
        const newAudio = audio;
        setAudioCache((prev) => new Map(prev.set(soundUrl, newAudio)));
        return newAudio;
      }
      return audio;
    },
    [audioCache]
  );

  useEffect(() => {
    if (session?.user && session?.sessionToken && isPrivilegedUser && !socket) {
      const socketUrl: string | undefined =
        env.NEXT_PUBLIC_SOCKET_URL ?? undefined;
      const socketInstance = io(socketUrl, {
        auth: {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          token: session.sessionToken,
        },
      });

      // Handle incoming sound_played events
      socketInstance.on(
        "sound_played",
        (data: {
          soundId: string;
          soundName: string;
          soundUrl: string;
          playedBy: string;
          playedById: string;
          timestamp: string;
        }) => {
          // Add to sound log (keep only last 50 entries)
          setSoundLog((prev) => [
            {
              soundId: data.soundId,
              soundName: data.soundName,
              playedBy: data.playedBy,
              playedById: data.playedById,
              timestamp: data.timestamp,
            },
            ...prev.slice(0, 49),
          ]);

          // Play the sound using cached audio (unless muted)
          if (!isMutedRef.current) {
            const audio = getCachedAudio(data.soundUrl);
            audio.currentTime = 0; // Reset to beginning
            audio.play().catch((e) => {
              console.error("Error playing sound from server event:", e);
            });
          }
        }
      );

      // Handle incoming connected_users events
      socketInstance.on("connected_users", (data: ConnectedUsersData) => {
        setConnectedUsers(data);
      });

      // Handle socket disconnection
      socketInstance.on("disconnect", () => {
        setShowDisconnectModal(true);
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.close();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  return (
    <>
      <Head title="Soundboard" description="EvanMMO's soundboard" />
      <Title order={1} color="gray.0" mb="md">
        Soundboard
      </Title>

      {/* Connected Users Counter - Only show for privileged users with socket connection */}
      {isPrivilegedUser && socket && (
        <Card mb="md" sx={{ borderRadius: "0.5rem" }}>
          {connectedUsers ? (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                }}
                onClick={() => setShowUsersList(!showUsersList)}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Text size="lg" color="gray.0">
                    🟢 {connectedUsers.count} user
                    {connectedUsers.count !== 1 ? "s" : ""} online
                  </Text>
                  <Text size="sm" color="gray.5">
                    (click to {showUsersList ? "hide" : "show"})
                  </Text>
                </div>
                <Text size="lg" color="gray.5">
                  {showUsersList ? "▲" : "▼"}
                </Text>
              </div>
              {showUsersList && (
                <div
                  style={{
                    marginTop: "12px",
                    paddingTop: "12px",
                    borderTop: "1px solid #444",
                  }}
                >
                  {connectedUsers.users
                    .slice()
                    .sort((a, b) => {
                      // Define role hierarchy (lower number = higher priority)
                      const roleOrder = {
                        admin: 1,
                        moderator: 2,
                        contributor: 3,
                        user: 4,
                      };

                      const aRoleOrder =
                        roleOrder[
                          a.role.toLowerCase() as keyof typeof roleOrder
                        ] || 5;
                      const bRoleOrder =
                        roleOrder[
                          b.role.toLowerCase() as keyof typeof roleOrder
                        ] || 5;

                      // Primary sort: by role
                      if (aRoleOrder !== bRoleOrder) {
                        return aRoleOrder - bRoleOrder;
                      }

                      // Secondary sort: alphabetically by name
                      return a.name.localeCompare(b.name);
                    })
                    .map((user) => (
                      <div
                        key={user.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "4px 0",
                        }}
                      >
                        {user.image && (
                          <Image
                            src={user.image}
                            alt={user.name}
                            style={{
                              width: "24px",
                              height: "24px",
                              borderRadius: "50%",
                            }}
                          />
                        )}
                        <Text color="gray.0" size="sm">
                          {user.name}
                        </Text>

                        {user.muted && (
                          <Text
                            color="red.4"
                            size="sm"
                            title="User is muted"
                            style={{ marginLeft: "4px" }}
                          >
                            🔇
                          </Text>
                        )}

                        {(user.role === UserRole.ADMIN ||
                          user.role === UserRole.MODERATOR) && (
                          <Text color="gray.5" size="xs">
                            (
                            {
                              (
                                {
                                  [UserRole.ADMIN]: "administrator",
                                  [UserRole.MODERATOR]: "moderator",
                                } as const
                              )[user.role]
                            }
                            )
                          </Text>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Loader size="sm" />
              <Text size="lg" color="gray.5">
                Loading connected users...
              </Text>
            </div>
          )}
        </Card>
      )}

      {/* Recent Sounds Log - Always show for privileged users */}
      {isPrivilegedUser && (
        <Card mb="xl" sx={{ borderRadius: "0.5rem" }}>
          <Title order={3} color="gray.0" mb="sm">
            Recent Sounds
          </Title>
          <div style={{ height: "200px", overflowY: "auto" }}>
            {soundLog.length > 0 ? (
              soundLog.map((entry, index) => (
                <div
                  key={`${entry.soundId}-${entry.timestamp}`}
                  style={{
                    padding: "8px 0",
                    borderBottom:
                      index < soundLog.length - 1 ? "1px solid #444" : "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <button
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "18px",
                      padding: "4px",
                      borderRadius: "4px",
                      opacity: 0.7,
                      transition: "opacity 0.2s",
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.opacity = "0.7")
                    }
                    onClick={() => {
                      // Find the sound in soundboardSounds to get the URL
                      const sound = soundboardSounds?.find(
                        (s) => s.id === entry.soundId
                      );
                      if (sound && !isMutedRef.current) {
                        const audio = getCachedAudio(sound.url);
                        audio.currentTime = 0;
                        audio.play().catch((e) => {
                          console.error("Error replaying sound:", e);
                        });
                      }
                    }}
                    title="Replay sound"
                  >
                    🔄
                  </button>
                  <div>
                    <Text size="sm" color="gray.0">
                      <strong>{entry.soundName}</strong> played by{" "}
                      <strong>{entry.playedBy}</strong>
                    </Text>
                    <Text size="xs" color="gray.5">
                      {new Date(entry.timestamp).toLocaleString()}
                    </Text>
                  </div>
                </div>
              ))
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                }}
              >
                <Text size="sm" color="gray.5" style={{ fontStyle: "italic" }}>
                  No sounds played yet
                </Text>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Compact Mode and Mute Toggles - Only show for privileged users */}
      {isPrivilegedUser && (
        <div style={{ marginBottom: "1rem", display: "flex", gap: "2rem" }}>
          <Switch
            label="Compact mode"
            checked={compactMode}
            onChange={(event) => setCompactMode(event.currentTarget.checked)}
            size="sm"
            color="blue"
          />
          <Switch
            label="Mute sounds"
            checked={isMuted}
            onChange={(event) => {
              const newMuteState = event.currentTarget.checked;
              setIsMuted(newMuteState);
              isMutedRef.current = newMuteState;
              // Emit mute/unmute event through socket
              if (socket && session?.sessionToken) {
                socket.emit(newMuteState ? "mute" : "unmute");
              }
            }}
            size="sm"
            color="red"
          />
        </div>
      )}

      {isLoadingSoundboardSounds && <Loader />}
      {soundboardSounds && (
        <SimpleGrid
          cols={5}
          spacing="sm"
          breakpoints={[
            { maxWidth: "lg", cols: 4 },
            { maxWidth: "md", cols: 3 },
            { maxWidth: "sm", cols: 2 },
            { maxWidth: "xs", cols: 1 },
          ]}
        >
          {soundboardSounds.map((sound) => {
            // Check if this sound has isPinned property (authenticated user)
            const soundWithPin = sound as typeof sound & {
              isPinned?: boolean;
              emoji?: string | null;
            };
            const isPinned = soundWithPin.isPinned || false;
            const emoji = soundWithPin.emoji;

            return (
              <Card
                style={{ overflow: "visible" }}
                sx={{ flexDirection: "column", borderRadius: "0.5rem" }}
                display="flex"
                key={sound.id}
              >
                <Text size="lg" mb="sm">
                  {isPinned && "📌 "}
                  {emoji && `${emoji} `}
                  {sound.name}
                </Text>
                {/* Row 1: Play button (+ Pin in compact mode) */}
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                  }}
                >
                  <Button
                    style={{ flex: 1 }}
                    size="md"
                    onClick={() => {
                      if (isPrivilegedUser && socket && session?.sessionToken) {
                        // Privileged users: Send websocket event
                        socket.emit("play_sound", sound.id);
                      } else if (isPrivilegedUser && !socket) {
                        console.warn(
                          "Socket not connected for privileged user"
                        );
                      } else if (!isMutedRef.current) {
                        // Regular users: Play sound locally using cached audio (unless muted)
                        const audio = getCachedAudio(sound.url);
                        audio.currentTime = 0; // Reset to beginning
                        audio.play().catch((e) => {
                          console.error("Error playing sound:", e);
                        });
                      }
                    }}
                  >
                    Play
                  </Button>

                  {/* Pin button in compact mode for all authenticated users */}
                  {session?.user && effectiveCompactMode && (
                    <Button
                      style={{ flex: 1 }}
                      variant={isPinned ? "filled" : "outline"}
                      size="md"
                      onClick={() => {
                        toggleSoundPinMutation
                          .mutateAsync({
                            soundId: sound.id,
                            isPinned: isPinned,
                          })
                          .then(() => {
                            refetchSoundboardSounds().catch((e) => {
                              throw e;
                            });
                          })
                          .catch((e) => {
                            throw e;
                          });
                      }}
                    >
                      {isPinned ? "Unpin" : "Pin"}
                    </Button>
                  )}
                </div>

                {/* Row 2: Pin, Emoji and Rename buttons */}
                {session?.user && !effectiveCompactMode && (
                  <div
                    style={{ display: "flex", gap: "8px", marginTop: "8px" }}
                  >
                    <Button
                      style={{ flex: 1 }}
                      variant={isPinned ? "filled" : "outline"}
                      onClick={() => {
                        toggleSoundPinMutation
                          .mutateAsync({
                            soundId: sound.id,
                            isPinned: isPinned,
                          })
                          .then(() => {
                            refetchSoundboardSounds().catch((e) => {
                              throw e;
                            });
                          })
                          .catch((e) => {
                            throw e;
                          });
                      }}
                    >
                      {isPinned ? "Unpin" : "Pin"}
                    </Button>
                    {isPrivilegedUser && (
                      <Button
                        style={{ flex: 1 }}
                        variant="outline"
                        onClick={() => {
                          setRenamingSoundId(sound.id);
                          setRenameValue(sound.name);
                        }}
                      >
                        Name
                      </Button>
                    )}
                    {isPrivilegedUser && (
                      <Popover
                        opened={emojiPickerOpen === sound.id}
                        onClose={() => setEmojiPickerOpen(null)}
                        position="bottom"
                        withArrow
                        width={350}
                      >
                        <Popover.Target>
                          <Button
                            style={{ flex: 1 }}
                            variant="outline"
                            onClick={() =>
                              setEmojiPickerOpen(
                                emojiPickerOpen === sound.id ? null : sound.id
                              )
                            }
                          >
                            {emoji || "😀"}
                          </Button>
                        </Popover.Target>
                        <Popover.Dropdown
                          style={{ height: "400px", overflow: "hidden" }}
                        >
                          <EmojiPicker
                            theme={Theme.DARK}
                            onEmojiClick={(emojiData: EmojiClickData) => {
                              updateSoundEmojiMutation
                                .mutateAsync({
                                  id: sound.id,
                                  emoji: emojiData.emoji,
                                })
                                .then(() => {
                                  refetchSoundboardSounds().catch((e) => {
                                    throw e;
                                  });
                                  setEmojiPickerOpen(null);
                                })
                                .catch((e) => {
                                  throw e;
                                });
                            }}
                            width={320}
                            height={380}
                          />
                        </Popover.Dropdown>
                      </Popover>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </SimpleGrid>
      )}
      {soundboardSounds?.length === 0 && (
        <Text color="gray.5">No sounds available yet.</Text>
      )}

      <Modal
        opened={renamingSoundId !== null}
        onClose={() => {
          setRenamingSoundId(null);
          setRenameValue("");
        }}
        title="Rename Sound"
      >
        <TextInput
          label="Sound Name"
          value={renameValue}
          onChange={(event) => setRenameValue(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleRenameSubmit();
            }
          }}
          data-autofocus
        />
        <Button
          fullWidth
          mt="md"
          onClick={handleRenameSubmit}
          disabled={!renameValue.trim()}
        >
          Save
        </Button>
      </Modal>

      {/* Disconnect Modal */}
      <Modal
        opened={showDisconnectModal}
        onClose={() => {
          setShowDisconnectModal(false);
          window.location.reload();
        }}
        title="Connection Lost"
        closeOnClickOutside={false}
        closeOnEscape={false}
      >
        <Text mb="md">
          You have been disconnected from the server. The page will reload to
          restore your connection.
        </Text>
        <Button
          fullWidth
          color="blue"
          onClick={() => {
            setShowDisconnectModal(false);
            window.location.reload();
          }}
        >
          Reload Page
        </Button>
      </Modal>
    </>
  );
};

export default SoundboardPage;
