import { Box, Button } from "@mantine/core";
import { useState } from "react";

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
  if (piece) {
    return (
      <>
        <Box>
          <video width="100%" src={piece.mp4URL} controls autoPlay />
        </Box>
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
