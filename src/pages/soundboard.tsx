import { Button, Card, Loader, SimpleGrid, Text, Title } from "@mantine/core";
import { type Socket, io } from "socket.io-client";
import { UserRole } from "@prisma/client";
import { api } from "../utils/api";
import { env } from "../env.mjs";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Head from "../components/Head";
import type { NextPage } from "next";

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
  const { data: soundboardSounds, isLoading: isLoadingSoundboardSounds } =
    api.soundboard.getSoundboardSounds.useQuery();

  const isPrivilegedUser =
    session?.user?.role === UserRole.ADMIN ||
    session?.user?.role === UserRole.MODERATOR;

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
          console.log("Sound played by server:", {
            sound: data.soundName,
            playedBy: data.playedBy,
            timestamp: data.timestamp,
          });

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
                  }}
                >
                  <Text size="sm" color="gray.0">
                    <strong>{entry.soundName}</strong> played by{" "}
                    <strong>{entry.playedBy}</strong>
                  </Text>
                  <Text size="xs" color="gray.5">
                    {new Date(entry.timestamp).toLocaleString()}
                  </Text>
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
            return (
              <Card
                sx={{ flexDirection: "column", borderRadius: "0.5rem" }}
                display="flex"
                key={sound.id}
              >
                <Text size="lg" mb="sm">
                  {sound.name}
                </Text>
                <Button
                  onClick={() => {
                    if (isPrivilegedUser && socket && session?.sessionToken) {
                      // Privileged users: Send websocket event
                      socket.emit("play_sound", sound.id);
                      console.log(
                        "Sent play_sound request for:",
                        sound.name,
                        sound.id
                      );
                    } else if (isPrivilegedUser && !socket) {
                      console.warn("Socket not connected for privileged user");
                    } else {
                      // Regular users: Play sound locally using cached audio
                      const audio = getCachedAudio(sound.url);
                      audio.currentTime = 0; // Reset to beginning
                      audio.play().catch((e) => {
                        console.error("Error playing sound:", e);
                      });
                      console.log("Playing sound locally:", sound.name);
                    }
                  }}
                >
                  Play
                </Button>
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
