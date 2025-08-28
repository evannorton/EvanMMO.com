import { Box, Button, Flex, MediaQuery, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import VODChat from "./VODChat";
import type { SyntheticEvent } from "react";

interface Props {
  readonly vodID: string;
  readonly pieces: {
    readonly id: string;
    readonly mp4URL: string;
    readonly jsonURL: string | null;
  }[];
  readonly onTimeUpdate?: (currentTime: number) => void;
  readonly initialTimestamp?: number;
}

const VODPlayer: React.FC<Props> = ({
  pieces,
  vodID,
  onTimeUpdate,
  initialTimestamp = 0,
}) => {
  const [pieceID, setPieceID] = useState<string | null>(pieces[0]?.id ?? null);
  const piece = pieces.find((piece) => piece.id === pieceID);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(
    null
  );

  useEffect(() => {
    setPieceID(pieces[0]?.id ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vodID]);

  useEffect(() => {
    if (videoElement && initialTimestamp > 0) {
      videoElement.currentTime = initialTimestamp;
      setCurrentTime(initialTimestamp);
    }
  }, [videoElement, initialTimestamp]);

  const handleTimeUpdate = (
    event: SyntheticEvent<HTMLVideoElement, Event>
  ): void => {
    const videoElement = event.target as HTMLVideoElement;
    const newCurrentTime = videoElement.currentTime;
    setCurrentTime(newCurrentTime);
    if (typeof onTimeUpdate === "function") {
      onTimeUpdate(newCurrentTime);
    }
  };

  return (
    <>
      <Flex pos="relative" wrap="wrap">
        <MediaQuery
          smallerThan="sm"
          styles={{
            width: "100%",
          }}
        >
          <Box
            sx={{
              width: "75%",
            }}
          >
            <video
              ref={setVideoElement}
              style={{ display: "block", aspectRatio: 16 / 9, width: "100%" }}
              width="100%"
              src={piece?.mp4URL}
              controls
              autoPlay
              onEnded={() => {
                const index = pieces.findIndex((piece) => piece.id === pieceID);
                const nextPiece = pieces[index + 1];
                if (nextPiece) {
                  setPieceID(nextPiece.id);
                }
              }}
              onTimeUpdate={handleTimeUpdate}
            />
          </Box>
        </MediaQuery>
        <MediaQuery
          smallerThan="sm"
          styles={{
            width: "100%",
            position: "relative",
            height: "25rem",
            marginTop: "1rem",
          }}
        >
          <Box
            pos="absolute"
            right={0}
            sx={{
              width: "25%",
              height: "100%",
            }}
          >
            {piece && piece.jsonURL && currentTime !== null && (
              <VODChat jsonURL={piece.jsonURL} currentTime={currentTime} />
            )}
            {piece && !piece.jsonURL && (
              <Text
                sx={{
                  alignItems: "center",
                }}
                display="flex"
                align="center"
                pos="absolute"
                top={0}
                bottom={0}
                px="sm"
              >
                No chat logs are available for this part of this broadcast.
              </Text>
            )}
          </Box>
        </MediaQuery>
      </Flex>
      {pieces.length > 1 && (
        <>
          {pieces.map((piece, index) => (
            <Button
              disabled={piece.id === pieceID}
              key={piece.id}
              mt="sm"
              mr="sm"
              onClick={() => {
                setPieceID(piece.id);
              }}
            >
              Part {index + 1}
            </Button>
          ))}
        </>
      )}
    </>
  );
};

export default VODPlayer;
