import { Button, Card, Loader, SimpleGrid, Text, Title, Popover } from "@mantine/core";
import { type Socket, io } from "socket.io-client";
import { UserRole } from "@prisma/client";
import { api } from "../utils/api";
import { env } from "../env.mjs";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Head from "../components/Head";
import type { NextPage } from "next";
import EmojiPicker from "emoji-picker-react";
import type { EmojiClickData } from "emoji-picker-react";

interface SoundLogEntry {
  soundId: string;
  soundName: string;
  playedBy: string;
  playedById: string;
  timestamp: string;
}

const SoundboardPage: NextPage = () => {
  const { data: session } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [audioCache, setAudioCache] = useState<Map<string, HTMLAudioElement>>(
    new Map()
  );
  const [soundLog, setSoundLog] = useState<SoundLogEntry[]>([]);
  const {
    data: soundboardSounds,
    isLoading: isLoadingSoundboardSounds,
    refetch: refetchSoundboardSounds,
  } = session?.user
    ? api.soundboard.getSoundboardSoundsWithUserPins.useQuery()
    : api.soundboard.getSoundboardSounds.useQuery();

  const isPrivilegedUser =
    session?.user?.role === UserRole.ADMIN ||
    session?.user?.role === UserRole.MODERATOR ||
    session?.user?.role === UserRole.CONTRIBUTOR;

  const toggleSoundPinMutation =
    api.soundboard.toggleSoundPinForUser.useMutation();
  const updateSoundEmojiMutation = 
    api.soundboard.updateSoundboardSoundEmoji.useMutation();
  const [emojiPickerOpen, setEmojiPickerOpen] = useState<string | null>(null);

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
    if (session?.user && session?.sessionToken && isPrivilegedUser) {
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

          // Play the sound using cached audio
          const audio = getCachedAudio(data.soundUrl);
          audio.currentTime = 0; // Reset to beginning
          audio.play().catch((e) => {
            console.error("Error playing sound from server event:", e);
          });
        }
      );

      setSocket(socketInstance);

      return () => {
        socketInstance.close();
      };
    }
  }, [session, isPrivilegedUser, getCachedAudio]);

  return (
    <>
      <Head title="Soundboard" description="EvanMMO's soundboard" />
      <Title order={1} color="gray.0" mb="md">
        Soundboard
      </Title>

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
                      if (sound) {
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
      {isLoadingSoundboardSounds && <Loader />}
      {soundboardSounds && (
        <SimpleGrid
          cols={4}
          spacing="sm"
          breakpoints={[{ maxWidth: "sm", cols: 2 }]}
        >
          {soundboardSounds.map((sound) => {
            // Check if this sound has isPinned property (authenticated user)
            const soundWithPin = sound as typeof sound & { isPinned?: boolean; emoji?: string | null };
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
                <div style={{ display: "flex", gap: "8px" }}>
                  <Button
                    style={{ flex: 1 }}
                    onClick={() => {
                      if (isPrivilegedUser && socket && session?.sessionToken) {
                        // Privileged users: Send websocket event
                        socket.emit("play_sound", sound.id);
                      } else if (isPrivilegedUser && !socket) {
                        console.warn(
                          "Socket not connected for privileged user"
                        );
                      } else {
                        // Regular users: Play sound locally using cached audio
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
                  {session?.user && (
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
                          onClick={() => setEmojiPickerOpen(emojiPickerOpen === sound.id ? null : sound.id)}
                        >
                          {emoji || "😀"}
                        </Button>
                      </Popover.Target>
                      <Popover.Dropdown style={{ height: "400px", overflow: "hidden" }}>
                        <EmojiPicker 
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
              </Card>
            );
          })}
        </SimpleGrid>
      )}
      {soundboardSounds?.length === 0 && (
        <Text color="gray.5">No sounds available yet.</Text>
      )}
    </>
  );
};

export default SoundboardPage;
