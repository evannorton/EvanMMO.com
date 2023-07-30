import { Box, Loader, Text } from "@mantine/core";
import { api } from "../utils/api";
import VODPlayer from "./VODPlayer";

interface Props {
  vodID: string;
}

const Broadcast: React.FC<Props> = ({ vodID }) => {
  const { data: vod, isLoading: isLoadingVOD } = api.vod.getVOD.useQuery({
    id: vodID,
  });
  return (
    <>
      {isLoadingVOD && <Loader />}
      {vod && (
        <>
          <Box sx={{ width: "100%" }} mb="md">
            <VODPlayer
              pieces={vod.pieces.map((piece) => ({
                id: piece.id,
                mp4URL: piece.mp4URL,
                jsonURL: piece.jsonURL,
              }))}
            />
          </Box>
          <Box mb="md">
            <Text>{vod.description}</Text>
          </Box>
        </>
      )}
    </>
  );
};

export default Broadcast;
