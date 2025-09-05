import {
  Button,
  Group,
  Image,
  Loader,
  Modal,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { type NextPage } from "next";
import { api } from "../utils/api";
import { useCallback, useEffect, useRef, useState } from "react";
import Head from "../components/Head";

interface Screenshot {
  dataURL: string;
  timestamp: number;
}

interface GameState {
  status: "loading" | "playing" | "results";
  screenshots: Screenshot[];
  actualDate: Date | null;
  guessedMonth: number | null;
  guessedDay: number | null;
  guessedYear: number | null;
  daysDifference: number | null;
}

const DEFAULT_IMAGE_COUNT = 4;

const GuesserPage: NextPage = () => {
  const today = new Date();
  const [gameState, setGameState] = useState<GameState>({
    status: "loading",
    screenshots: [],
    actualDate: null,
    guessedMonth: today.getMonth() + 1, // JavaScript months are 0-based
    guessedDay: today.getDate(),
    guessedYear: today.getFullYear(),
    daysDifference: null,
  });

  const [roundCount, setRoundCount] = useState(0);
  const [imagesPerVod, setImagesPerVod] = useState(DEFAULT_IMAGE_COUNT);
  const [daysOffHistory, setDaysOffHistory] = useState<number[]>([]);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsImageCount, setSettingsImageCount] =
    useState(DEFAULT_IMAGE_COUNT);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { data: randomVOD, refetch: getNewVOD } =
    api.vod.getRandomVODForGuesser.useQuery();

  const openSettingsModal = useCallback(() => {
    setSettingsImageCount(imagesPerVod);
    setShowSettingsModal(true);
  }, [imagesPerVod]);

  const getAverageDaysOff = (): number | null => {
    if (daysOffHistory.length === 0) {
      return null;
    }
    const sum = daysOffHistory.reduce((acc, days) => acc + days, 0);
    return Math.round((sum / daysOffHistory.length) * 10) / 10; // Round to 1 decimal place
  };

  const generateScreenshots = useCallback(async () => {
    if (typeof randomVOD === "undefined" || randomVOD === null) {
      return;
    }

    if (randomVOD.pieces.length === 0) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (
      typeof video === "undefined" ||
      video === null ||
      typeof canvas === "undefined" ||
      canvas === null
    ) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (typeof ctx === "undefined" || ctx === null) {
      return;
    }

    setGameState((prev) => ({ ...prev, status: "loading" }));

    return new Promise<void>((resolve) => {
      const videoUrl = randomVOD.pieces[0]?.mp4URL || "";

      if (!videoUrl) {
        resolve();
        return;
      }

      // Add error listener first
      const onError = () => {
        video.removeEventListener("error", onError);
        resolve();
      };
      video.addEventListener("error", onError);

      video.src = videoUrl;

      video.addEventListener("loadedmetadata", () => {
        video.removeEventListener("error", onError); // Clean up error listener
        const duration = video.duration;
        const screenshots: Screenshot[] = [];

        // Generate random timestamps with minimum distance between them
        const timestamps: number[] = [];
        const minDistance = duration * 0.1; // At least 10% of video duration apart

        for (let i = 0; i < imagesPerVod; i++) {
          let timestamp: number;
          let attempts = 0;
          do {
            timestamp = Math.random() * duration;
            attempts++;
          } while (
            timestamps.some((t) => Math.abs(t - timestamp) < minDistance) &&
            attempts < 20
          );
          timestamps.push(timestamp);
        }

        timestamps.sort((a, b) => a - b);

        // Process screenshots sequentially to avoid race conditions
        const processScreenshots = async () => {
          for (const timestamp of timestamps) {
            await new Promise<void>((screenshotResolve) => {
              const onSeeked = () => {
                video.removeEventListener("seeked", onSeeked);
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                ctx.drawImage(video, 0, 0);
                const dataURL = canvas.toDataURL("image/jpeg", 0.8);
                screenshots.push({ dataURL, timestamp });
                screenshotResolve();
              };
              video.addEventListener("seeked", onSeeked);
              video.currentTime = timestamp;
            });
          }

          setGameState((prev) => ({
            ...prev,
            status: "playing",
            screenshots: screenshots.sort(() => Math.random() - 0.5), // Shuffle screenshots
            actualDate: new Date(randomVOD.streamDate),
          }));
          resolve();
        };

        void processScreenshots();
      });
    });
  }, [randomVOD, imagesPerVod]);

  const confirmNewGame = useCallback(async () => {
    // Update state and fetch new VOD
    setRoundCount(0);
    setImagesPerVod(settingsImageCount);
    setDaysOffHistory([]);
    setShowSettingsModal(false);

    // Reset game state
    const today = new Date();
    setGameState({
      status: "loading",
      screenshots: [],
      actualDate: null,
      guessedMonth: today.getMonth() + 1,
      guessedDay: today.getDate(),
      guessedYear: today.getFullYear(),
      daysDifference: null,
    });

    // Fetch new VOD - this will trigger generateScreenshots via useEffect
    await getNewVOD();
  }, [settingsImageCount, getNewVOD]);

  const handleGuess = () => {
    if (
      gameState.actualDate === null ||
      gameState.guessedMonth === null ||
      gameState.guessedDay === null ||
      gameState.guessedYear === null
    ) {
      return;
    }

    const guessedDate = new Date(
      gameState.guessedYear,
      gameState.guessedMonth - 1, // JavaScript months are 0-based
      gameState.guessedDay
    );

    const timeDifference = Math.abs(
      gameState.actualDate.getTime() - guessedDate.getTime()
    );
    const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));

    setGameState((prev) => ({
      ...prev,
      status: "results",
      daysDifference,
    }));

    // Add to history and increment round count
    setDaysOffHistory((prev) => [...prev, daysDifference]);
    setRoundCount((prev) => prev + 1);
  };

  const playNext = useCallback(async () => {
    const today = new Date();
    setGameState({
      status: "loading",
      screenshots: [],
      actualDate: null,
      guessedMonth: today.getMonth() + 1,
      guessedDay: today.getDate(),
      guessedYear: today.getFullYear(),
      daysDifference: null,
    });

    await getNewVOD();
  }, [getNewVOD]);

  // Generate screenshots when VOD changes
  useEffect(() => {
    if (
      randomVOD !== undefined &&
      randomVOD !== null &&
      gameState.status === "loading"
    ) {
      void generateScreenshots();
    }
  }, [randomVOD, gameState.status, generateScreenshots]);

  const getDaysDifferenceColor = (days: number): string => {
    if (days === 0) return "green";
    if (days <= 7) return "blue";
    if (days <= 30) return "yellow";
    return "red";
  };

  if (typeof randomVOD === "undefined" || gameState.status === "loading") {
    return (
      <>
        <Head
          title="Livestream Guesser"
          description="Guess the date of EvanMMO livestream screenshots!"
        />
        <Title order={1}>Livestream Guesser</Title>
        <Stack align="center" justify="center" style={{ minHeight: "50vh" }}>
          <Loader size="xl" />
          <Text>Loading random broadcast...</Text>
        </Stack>
        {/* Hidden video and canvas for screenshot generation */}
        <video
          ref={videoRef}
          crossOrigin="anonymous"
          style={{ display: "none" }}
        />
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </>
    );
  }

  if (randomVOD === null) {
    return (
      <>
        <Head
          title="VOD Guesser"
          description="Guess the date of VOD screenshots!"
        />
        <Stack align="center" justify="center" style={{ minHeight: "50vh" }}>
          <Title order={2}>No VODs available</Title>
          <Text>There are no VODs in the database to play with.</Text>
        </Stack>
        {/* Hidden video and canvas for screenshot generation */}
        <video
          ref={videoRef}
          crossOrigin="anonymous"
          style={{ display: "none" }}
        />
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </>
    );
  }

  return (
    <>
      <Head
        title="VOD Guesser"
        description="Guess the date of VOD screenshots!"
      />
      <Title order={1}>Livestream Guesser</Title>
      <Stack>
        <Group>
          <Group>
            <Text>Round {roundCount + 1}</Text>
            {getAverageDaysOff() !== null && (
              <Text color="dimmed">Avg: {getAverageDaysOff()} days off</Text>
            )}
            <Button onClick={openSettingsModal} variant="outline">
              New Game
            </Button>
          </Group>
        </Group>

        {gameState.status === "playing" && (
          <>
            <Stack>
              <Text size="lg" weight={500}>
                What date is this livestream?
              </Text>

              <Group>
                <Select
                  label="Month"
                  placeholder="Month"
                  data={[
                    { value: "1", label: "January" },
                    { value: "2", label: "February" },
                    { value: "3", label: "March" },
                    { value: "4", label: "April" },
                    { value: "5", label: "May" },
                    { value: "6", label: "June" },
                    { value: "7", label: "July" },
                    { value: "8", label: "August" },
                    { value: "9", label: "September" },
                    { value: "10", label: "October" },
                    { value: "11", label: "November" },
                    { value: "12", label: "December" },
                  ]}
                  value={gameState.guessedMonth?.toString() ?? null}
                  onChange={(value: string | null) =>
                    setGameState((prev) => ({
                      ...prev,
                      guessedMonth: value ? parseInt(value) : null,
                    }))
                  }
                  style={{ width: 140 }}
                />
                <NumberInput
                  label="Day"
                  placeholder="Day"
                  min={1}
                  max={31}
                  value={gameState.guessedDay ?? ""}
                  onChange={(value) =>
                    setGameState((prev) => ({
                      ...prev,
                      guessedDay: typeof value === "number" ? value : null,
                    }))
                  }
                  style={{ width: 80 }}
                />
                <NumberInput
                  label="Year"
                  placeholder="Year"
                  min={0}
                  max={new Date().getFullYear()}
                  value={gameState.guessedYear ?? ""}
                  onChange={(value) =>
                    setGameState((prev) => ({
                      ...prev,
                      guessedYear: typeof value === "number" ? value : null,
                    }))
                  }
                  style={{ width: 100 }}
                />
              </Group>
            </Stack>

            <Group>
              <Button onClick={handleGuess}>Submit</Button>
            </Group>

            <SimpleGrid cols={imagesPerVod <= 2 ? imagesPerVod : 2}>
              {gameState.screenshots.map((screenshot, index) => (
                <Image
                  key={index}
                  src={screenshot.dataURL}
                  alt={`Screenshot ${index + 1}`}
                  style={{
                    width: "100%",
                    aspectRatio: "16/9",
                    objectFit: "cover",
                  }}
                />
              ))}
            </SimpleGrid>
          </>
        )}
      </Stack>

      {/* Results Modal */}
      <Modal
        opened={gameState.status === "results"}
        onClose={() => setGameState((prev) => ({ ...prev, status: "playing" }))}
        title="Results"
        centered
      >
        <Stack>
          <Text>
            <strong>Your Guess:</strong>{" "}
            {new Date(
              gameState.guessedYear || 0,
              (gameState.guessedMonth || 1) - 1,
              gameState.guessedDay || 1
            ).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </Text>
          <Text>
            <strong>Actual Date:</strong>{" "}
            {gameState.actualDate?.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </Text>
          <Text
            color={getDaysDifferenceColor(gameState.daysDifference || 0)}
            size="lg"
            weight={700}
          >
            {gameState.daysDifference} days off
          </Text>
          <Button
            onClick={() => {
              void playNext();
            }}
            fullWidth
          >
            Next
          </Button>
        </Stack>
      </Modal>

      {/* New Game Modal */}
      <Modal
        opened={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        title="New Game"
        centered
      >
        <Stack>
          <NumberInput
            label="Amount of screenshots"
            min={1}
            max={20}
            value={settingsImageCount}
            onChange={(value) =>
              setSettingsImageCount(
                typeof value === "number" ? value : DEFAULT_IMAGE_COUNT
              )
            }
          />
          <Group>
            <Button
              variant="outline"
              onClick={() => setShowSettingsModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                void confirmNewGame();
              }}
            >
              Start
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Hidden video and canvas for screenshot generation */}
      <video ref={videoRef} style={{ display: "none" }} />
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </>
  );
};

export default GuesserPage;
