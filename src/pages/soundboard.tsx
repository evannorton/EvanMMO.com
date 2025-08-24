import {
  Button,
  Card,
  Loader,
  Modal,
  Popover,
  SimpleGrid,
  Slider,
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
  const isCollaborativeUser =
    session?.user?.role === UserRole.ADMIN ||
    session?.user?.role === UserRole.MODERATOR ||
    session?.user?.role === UserRole.CONTRIBUTOR;

  const toggleSoundPinMutation =
    api.soundboard.toggleSoundPinForUser.useMutation();
  const updateSoundEmojiMutation =
    api.soundboard.updateSoundboardSoundEmoji.useMutation();
  const updateSoundVolumeMutation =
    api.soundboard.updateSoundboardSoundVolume.useMutation();
  const renameSoundMutation =
    api.soundboard.renameSoundboardSound.useMutation();
  const [emojiPickerOpen, setEmojiPickerOpen] = useState<string | null>(null);
  const [volumePopoverOpen, setVolumePopoverOpen] = useState<string | null>(
    null
  );
  const [tempSoundVolumes, setTempSoundVolumes] = useState<
    Record<string, number>
  >({});
  const [renamingSoundId, setRenamingSoundId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [compactMode, setCompactMode] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  // Admin/Mod/Contributor default to broadcast mode (false)
  // Regular users are forced to local-only mode (true)
  const [playLocalOnly, setPlayLocalOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [volume, setVolume] = useState(100); // Volume from 0-100
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);

  // Use ref to track current mute state for socket handlers
  const isMutedRef = useRef(false);

  // Use ref to track current volume for socket handlers
  const volumeRef = useRef(volume);

  // Use ref to track current soundboard sounds for socket handlers
  const soundboardSoundsRef = useRef(soundboardSounds);

  // Use ref to track if we've set the initial playLocalOnly value
  const hasSetInitialPlayLocalOnly = useRef(false);

  // Set proper default for playLocalOnly once session is available
  useEffect(() => {
    if (session !== undefined && !hasSetInitialPlayLocalOnly.current) {
      // Admin/Mod/Contributor: false (broadcast mode)
      // Regular users: true (local-only mode)
      setPlayLocalOnly(!isCollaborativeUser);
      hasSetInitialPlayLocalOnly.current = true;
    }
  }, [session, isCollaborativeUser]);

  // Keep volume ref in sync with volume state
  useEffect(() => {
    volumeRef.current = volume;
    // Update all cached audio volumes when global volume changes
    audioCache.forEach((audio, soundUrl) => {
      // We need to find the sound's volume for this URL
      const sound = soundboardSounds?.find((s) => s.url === soundUrl);
      const soundVolume = sound?.soundVolume ?? 100;
      audio.volume = (volume / 100) * (soundVolume / 100);
    });
  }, [volume, audioCache, soundboardSounds]);

  // Keep soundboard sounds ref in sync with soundboard sounds state
  useEffect(() => {
    soundboardSoundsRef.current = soundboardSounds;
  }, [soundboardSounds]);

  // Update cached audio volumes when soundboard data changes (per-sound volume updates)
  useEffect(() => {
    if (soundboardSounds) {
      audioCache.forEach((audio, soundUrl) => {
        const sound = soundboardSounds.find((s) => s.url === soundUrl);
        const soundVolume = sound?.soundVolume ?? 100;
        audio.volume = (volumeRef.current / 100) * (soundVolume / 100);
      });
    }
  }, [soundboardSounds, audioCache]);

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
    (soundUrl: string, soundVolume: number): HTMLAudioElement => {
      let audio = audioCache.get(soundUrl);
      if (!audio) {
        audio = new Audio(soundUrl);
        audio.preload = "auto";
        // Apply both global volume and per-sound volume
        audio.volume = (volumeRef.current / 100) * (soundVolume / 100);
        const newAudio = audio;
        setAudioCache((prev) => new Map(prev.set(soundUrl, newAudio)));
        return newAudio;
      }
      // Update volume for existing cached audio
      audio.volume = (volumeRef.current / 100) * (soundVolume / 100);
      return audio;
    },
    [audioCache] // Include audioCache dependency for React Hook rules
  );

  useEffect(() => {
    if (
      session?.user &&
      session?.sessionToken &&
      isCollaborativeUser &&
      !socket
    ) {
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
          // Add to sound log (keep only last 50 entries, sorted by timestamp)
          setSoundLog((prev) =>
            [
              {
                soundId: data.soundId,
                soundName: data.soundName,
                playedBy: data.playedBy,
                playedById: data.playedById,
                timestamp: data.timestamp,
              },
              ...prev,
            ]
              .sort(
                (a, b) =>
                  new Date(b.timestamp).getTime() -
                  new Date(a.timestamp).getTime()
              )
              .slice(0, 50)
          );

          // Play the sound using cached audio (unless muted)
          if (!isMutedRef.current) {
            // Look up the sound volume from our existing data
            const sound = soundboardSoundsRef.current?.find(
              (s) => s.id === data.soundId
            );
            const audio = getCachedAudio(
              data.soundUrl,
              sound?.soundVolume ?? 100
            );
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
      {isCollaborativeUser && socket && (
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
      {isCollaborativeUser && (
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
                        const soundWithVolume = sound as typeof sound & {
                          soundVolume?: number;
                        };
                        const audio = getCachedAudio(
                          sound.url,
                          soundWithVolume.soundVolume ?? 100
                        );
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

      {/* Compact Mode, Local Play, and Mute Toggles */}

      <div
        style={{
          display: "flex",
          gap: "2rem",
          marginBottom: "1rem",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {isPrivilegedUser && (
          <Switch
            label="Compact mode"
            checked={compactMode}
            onChange={(event) => setCompactMode(event.currentTarget.checked)}
            size="sm"
            color="blue"
          />
        )}

        {isCollaborativeUser && session && (
          <Switch
            label="Play locally only"
            checked={playLocalOnly}
            onChange={(event) => setPlayLocalOnly(event.currentTarget.checked)}
            size="sm"
            color="orange"
          />
        )}

        {isCollaborativeUser && session && (
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
        )}

        {/* Volume Slider */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Text size="sm" color="gray.0">
            Volume
          </Text>
          <Slider
            value={volume}
            onChange={(newVolume) => {
              setVolume(newVolume);
              volumeRef.current = newVolume;
            }}
            min={0}
            max={100}
            step={1}
            style={{ width: "100px" }}
            size="sm"
            color="green"
          />
          <Text size="xs" color="gray.5" style={{ minWidth: "30px" }}>
            {volume}%
          </Text>
        </div>
      </div>

      {/* Search Bar */}
      <TextInput
        placeholder="Search sounds..."
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.currentTarget.value)}
        size="md"
        mb="md"
        style={{ maxWidth: "400px" }}
      />

      {isLoadingSoundboardSounds && <Loader />}
      {soundboardSounds && (
        <>
          {(() => {
            // Filter sounds based on search term
            const filteredSounds = soundboardSounds.filter((sound) =>
              sound.name.toLowerCase().includes(searchTerm.toLowerCase())
            );

            return (
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
                {filteredSounds.map((sound) => {
                  // Check if this sound has isPinned, emoji, and soundVolume properties
                  const soundWithExtras = sound as typeof sound & {
                    isPinned?: boolean;
                    emoji?: string | null;
                    soundVolume?: number;
                  };
                  const isPinned = soundWithExtras.isPinned || false;
                  const emoji = soundWithExtras.emoji;
                  const soundVolume = soundWithExtras.soundVolume ?? 100;
                  const currentDisplayVolume =
                    tempSoundVolumes[sound.id] ?? soundVolume;

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
                            if (
                              isCollaborativeUser &&
                              socket &&
                              session?.sessionToken &&
                              !playLocalOnly
                            ) {
                              // Collaborative users with local-only disabled: Send websocket event
                              socket.emit("play_sound", sound.id);
                            } else if (
                              isCollaborativeUser &&
                              !socket &&
                              !playLocalOnly
                            ) {
                              console.warn(
                                "Socket not connected for collaborative user"
                              );
                            } else if (!isMutedRef.current) {
                              // Local playback: Play sound locally using cached audio (unless muted)
                              const audio = getCachedAudio(
                                sound.url,
                                soundVolume
                              );
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

                      {/* Row 2: Pin and Rename buttons */}
                      {session?.user && !effectiveCompactMode && (
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            marginTop: "8px",
                          }}
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
                        </div>
                      )}

                      {/* Row 3: Volume and Emoji buttons */}
                      {session?.user &&
                        !effectiveCompactMode &&
                        isPrivilegedUser && (
                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              marginTop: "8px",
                            }}
                          >
                            <Popover
                              opened={volumePopoverOpen === sound.id}
                              onClose={() => setVolumePopoverOpen(null)}
                              position="bottom"
                              withArrow
                              width={200}
                            >
                              <Popover.Target>
                                <Button
                                  style={{ flex: 1 }}
                                  variant="outline"
                                  onClick={() =>
                                    setVolumePopoverOpen(
                                      volumePopoverOpen === sound.id
                                        ? null
                                        : sound.id
                                    )
                                  }
                                >
                                  Volume
                                </Button>
                              </Popover.Target>
                              <Popover.Dropdown>
                                <div style={{ padding: "8px" }}>
                                  <Text size="sm" mb="xs" color="gray.0">
                                    Sound Volume: {currentDisplayVolume}%
                                  </Text>
                                  <Slider
                                    value={currentDisplayVolume}
                                    onChange={(newVolume) => {
                                      setTempSoundVolumes((prev) => ({
                                        ...prev,
                                        [sound.id]: newVolume,
                                      }));
                                    }}
                                    onChangeEnd={(newVolume) => {
                                      updateSoundVolumeMutation
                                        .mutateAsync({
                                          id: sound.id,
                                          soundVolume: newVolume,
                                        })
                                        .then(() => {
                                          return refetchSoundboardSounds();
                                        })
                                        .then(() => {
                                          setTempSoundVolumes((prev) => {
                                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                            const { [sound.id]: _, ...rest } =
                                              prev;

                                            return rest;
                                          });
                                        })
                                        .catch((e: unknown) => {
                                          throw e;
                                        });
                                    }}
                                    min={0}
                                    max={100}
                                    step={1}
                                    style={{ width: "100%" }}
                                    size="sm"
                                    color="blue"
                                  />
                                </div>
                              </Popover.Dropdown>
                            </Popover>
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
                                      emojiPickerOpen === sound.id
                                        ? null
                                        : sound.id
                                    )
                                  }
                                >
                                  Emoji
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
                          </div>
                        )}
                    </Card>
                  );
                })}
              </SimpleGrid>
            );
          })()}

          {/* Show message when no sounds match search */}
          {soundboardSounds.filter((sound) =>
            sound.name.toLowerCase().includes(searchTerm.toLowerCase())
          ).length === 0 &&
            searchTerm && (
              <Text
                color="gray.5"
                style={{ textAlign: "center", marginTop: "2rem" }}
              >
                {`No sounds found matching "${searchTerm}"`}
              </Text>
            )}
        </>
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
