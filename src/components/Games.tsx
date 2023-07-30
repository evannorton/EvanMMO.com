import { Box, Image, Loader, SimpleGrid, Text } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { api } from "../utils/api";
import { faPlayCircle, faStopCircle } from "@fortawesome/free-solid-svg-icons";
import { useContext, useRef } from "react";
import context from "../context";

interface Props {}

const Games: React.FC<Props> = () => {
  const { selectedGameID, setSelectedGameID } = useContext(context);
  const gameRef = useRef<HTMLIFrameElement>(null);
  const { data: games, isLoading: isLoadingGames } = api.game.getGames.useQuery();
  const game = games?.find((game) => game.id === selectedGameID);
  return (
    <>
      {isLoadingGames && <Loader />}
      {game && (
        <>
          <Box
            sx={{
              width: "100%",
              overflow: "auto",
            }}
            mb="md"
          >
            <iframe
              style={{
                border: "none",
                display: "block",
                width: `${game.width}px`,
                height: `${game.height}px`,
                margin: "0 auto",
              }}
              src={game.embedURL}
              allowFullScreen={false}
              ref={gameRef}
            />
          </Box>
          <Box mb="md">
            <Text>{game.description}</Text>
          </Box>
        </>
      )}
      <SimpleGrid
        cols={4}
        spacing="sm"
        breakpoints={[{ maxWidth: "sm", cols: 2 }]}
      >
        {games?.map((game) => (
          <Box key={game.id}>
            <Box
              sx={{ cursor: "pointer", position: "relative" }}
              onClick={() => {
                if (selectedGameID !== game.id) {
                  setSelectedGameID(game.id);
                } else {
                  setSelectedGameID(null);
                }
              }}
            >
              <Box
                pos="relative"
                sx={{
                  borderRadius: "0.5rem",
                  overflow: "hidden",
                }}
              >
                <Image
                  alt={game.title}
                  src={game.thumbnailURL}
                  sx={{
                    opacity: selectedGameID === game.id ? 1 : 0.75,
                  }}
                />
                <FontAwesomeIcon
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    right: 0,
                    margin: "auto",
                    width: "20%",
                    height: "auto",
                    boxShadow: "5px 5px 50px 5px #000000",
                    borderRadius: "50%",
                  }}
                  icon={
                    selectedGameID !== game.id ? faPlayCircle : faStopCircle
                  }
                />
                {selectedGameID === game.id && (
                  <Box
                    pos="absolute"
                    top={0}
                    sx={{
                      border: "4px solid white",
                      width: "100%",
                      height: "100%",
                    }}
                  />
                )}
              </Box>
              <Text px="md" pt="xs" pb="md" align="center">
                {game.title}
              </Text>
            </Box>
          </Box>
        ))}
      </SimpleGrid>
    </>
  );
};

export default Games;
