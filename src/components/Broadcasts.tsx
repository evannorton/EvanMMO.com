import {
  Box,
  Button,
  Card,
  Loader,
  Pagination,
  SimpleGrid,
  Text,
} from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { api } from "../utils/api";
import { faLink } from "@fortawesome/free-solid-svg-icons";
import { getDescriptionPreview } from "../utils/description";
import { getFormattedDateString } from "../utils/date";
import { notifications } from "@mantine/notifications";
import { useContext, useState } from "react";
import Broadcast from "./Broadcast";
import context from "../context";
import vodsPerPage from "../constants/vodsPerPage";

interface Props {}

const Broadcasts: React.FC<Props> = () => {
  const [vodsPage, setVODsPage] = useState(1);
  const { data: vods, isLoading: isLoadingVODs } = api.vod.getVODs.useQuery({
    page: vodsPage - 1,
  });
  const { data: vodsCount, isLoading: isLoadingVODsCount } =
    api.vod.getVODsCount.useQuery();
  const { selectedVODID, setSelectedVODID } = useContext(context);
  const handleVODsPagination = (page: number): void => {
    setVODsPage(page);
    setSelectedVODID(null);
  };
  return (
    <>
      {selectedVODID && <Broadcast vodID={selectedVODID} />}
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
                  <Box
                    sx={{
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                    display="flex"
                    mb="sm"
                  >
                    <Text size="lg" mr="sm">
                      {getFormattedDateString(vod.streamDate)}
                    </Text>
                    <Box
                      sx={{
                        cursor: "pointer",
                        "&:hover": {
                          opacity: "0.75",
                        },
                      }}
                      onClick={() => {
                        navigator.clipboard
                          .writeText(
                            `${window.location.origin}/broadcasts/${vod.id}`
                          )
                          .then(() => {
                            notifications.show({
                              message: "Copied broadcast link to clipboard",
                            });
                          })
                          .catch(() => {
                            notifications.show({
                              color: "red",
                              message:
                                "Failed to copy broadcast link to clipboard",
                            });
                          });
                      }}
                    >
                      <FontAwesomeIcon icon={faLink} />
                    </Box>
                  </Box>
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
                    sx={{
                      borderRadius: "0.5rem",
                      border: "4px solid white",
                      width: "100%",
                      height: "100%",
                      pointerEvents: "none",
                    }}
                    pos="absolute"
                    top={0}
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
