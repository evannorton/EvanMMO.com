import { Box } from "@mantine/core";
import { TwitchEmbed } from "react-twitch-embed";
import twitchUsername from "../constants/twitchUsername";

interface Props {}

const LivestreamEmbed: React.FC<Props> = () => {
  return (
    <Box
      className="livestream-embed"
      sx={{
        width: "100%",
      }}
    >
      <TwitchEmbed channel={twitchUsername} width="100%" height="100%" />
    </Box>
  );
};

export default LivestreamEmbed;
