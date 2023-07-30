import {
  Box,
  Button,
  Card,
  Loader,
  Pagination,
  SimpleGrid,
  Text,
} from "@mantine/core";
import { api } from "../utils/api";
import { getDescriptionPreview } from "../utils/description";
import { getFormattedDateString } from "../utils/date";
import { useContext, useState } from "react";
import VODPlayer from "./VODPlayer";
import context from "../context";
import vodsPerPage from "../constants/vodsPerPage";

interface Props {}

const Broadcasts: React.FC<Props> = () => {
  const [vodsPage, setVODsPage] = useState(1);
  const { data: vods, isLoading: isLoadingVODs } = api.vod.getAll.useQuery({
    page: vodsPage - 1,
  });
  const { data: vodsCount, isLoading: isLoadingVODsCount } =
    api.vod.getCount.useQuery();
  const { selectedVODID, setSelectedVODID } = useContext(context);
  const selectedVOD = vods?.find((vod) => vod.id === selectedVODID);
  const handleVODsPagination = (page: number): void => {
    setVODsPage(page);
    setSelectedVODID(null);
  };
  return (
    <>
      {selectedVOD && (
        <>
          <Box sx={{ width: "100%" }} mb="md">
            <VODPlayer
              pieces={selectedVOD.pieces.map((piece) => ({
                id: piece.id,
                mp4URL: piece.mp4URL,
                jsonURL: piece.jsonURL,
              }))}
            />
          </Box>
          <Box mb="md">
            <Text>{selectedVOD.description}</Text>
          </Box>
        </>
      )}
      {typeof vodsCount !== "undefined" && (
        <Pagination
          value={vodsPage}
          onChange={handleVODsPagination}
          mb="md"
          total={Math.ceil(vodsCount / vodsPerPage)}
          withEdges
        />
      )}
      {(isLoadingVODs || isLoadingVODsCount) && <Loader />}
      {vods && typeof vodsCount !== "undefined" && (
        <SimpleGrid
          cols={4}
          spacing="sm"
          breakpoints={[{ maxWidth: "sm", cols: 2 }]}
        >
          {vods.map((vod) => {
            return (
              <Box pos="relative" key={vod.id}>
                <Card
                  sx={{
                    flexDirection: "column",
                    borderRadius: "0.5rem",
                    height: "100%",
                  }}
                  display="flex"
                >
                  <Text size="lg" mb="sm">
                    {getFormattedDateString(vod.streamDate)}
                  </Text>
                  {getDescriptionPreview(vod.description)
                    .split("\n")
                    .map((line, key) => (
                      <Text key={key}>{line}</Text>
                    ))}
                  <Box mt="auto">
                    {selectedVODID !== vod.id && (
                      <Button
                        color="green"
                        mt="sm"
                        onClick={() => {
                          setSelectedVODID(vod.id);
                        }}
                      >
                        Play
                      </Button>
                    )}
                    {selectedVODID === vod.id && (
                      <Button
                        color="red"
                        mt="sm"
                        onClick={() => {
                          setSelectedVODID(null);
                        }}
                      >
                        Stop
                      </Button>
                    )}
                  </Box>
                </Card>
                {vod.id === selectedVODID && (
                  <Box
                    pos="absolute"
                    top={0}
                    sx={{
                      borderRadius: "0.5rem",
                      border: "4px solid white",
                      width: "100%",
                      height: "100%",
                      pointerEvents: "none",
                    }}
                  />
                )}
              </Box>
            );
          })}
        </SimpleGrid>
      )}
      {typeof vodsCount !== "undefined" && (
        <Pagination
          value={vodsPage}
          onChange={handleVODsPagination}
          total={Math.ceil(vodsCount / vodsPerPage)}
          withEdges
          mt="sm"
        />
      )}
    </>
  );
};

export default Broadcasts;
