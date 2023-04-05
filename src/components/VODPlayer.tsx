import { Box, Button, Flex } from "@mantine/core";
import { useEffect, useState } from "react";
import VODChat from "./VODChat";

interface Props {
  readonly pieces: {
    readonly id: string;
    readonly mp4URL: string;
    readonly jsonURL: string | null;
  }[];
}

const VODPlayer: React.FC<Props> = ({ pieces }) => {
  const [pieceID, setPieceID] = useState<string | null>(pieces[0]?.id ?? null);
  const piece = pieces.find((piece) => piece.id === pieceID);
  const [currentTime, setCurrentTime] = useState<number>(0);
  useEffect(() => {
    setPieceID(pieces[0]?.id ?? null);
  }, [pieces]);
  if (piece) {
    return (
      <>
        <Flex pos="relative">
          <Box style={{ width: piece.jsonURL ? "75%" : "100%" }}>
            <video
              width="100%"
              src={piece.mp4URL}
              controls
              autoPlay
              onEnded={() => {
                const index = pieces.findIndex((piece) => piece.id === pieceID);
                const nextPiece = pieces[index + 1];
                if (nextPiece) {
                  setPieceID(nextPiece.id);
                }
              }}
              onTimeUpdate={({ target }) => {
                setCurrentTime((target as HTMLVideoElement).currentTime);
              }}
            />
          </Box>
          {piece.jsonURL && currentTime !== null && (
            <Box
              pos="absolute"
              right={0}
              style={{
                width: "25%",
                height: "100%",
              }}
              pl="md"
            >
              <VODChat jsonURL={piece.jsonURL} currentTime={currentTime} />
            </Box>
          )}
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
  }
  return null;
};

export default VODPlayer;
