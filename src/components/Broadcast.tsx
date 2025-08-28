import {
  ActionIcon,
  Box,
  Button,
  Group,
  Loader,
  Modal,
  Switch,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { api } from "../utils/api";
import { faCheck, faCopy, faShare } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import VODPlayer from "./VODPlayer";

interface Props {
  vodID: string;
  initialTimestamp?: number;
}

const Broadcast: React.FC<Props> = ({ vodID, initialTimestamp = 0 }) => {
  const { data: vod, isLoading: isLoadingVOD } = api.vod.getVOD.useQuery({
    id: vodID,
  });
  const [shareModalOpened, setShareModalOpened] = useState<boolean>(false);
  const [includeTimestamp, setIncludeTimestamp] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(initialTimestamp);
  const [copied, setCopied] = useState<boolean>(false);

  const generateShareLink = (): string => {
    const baseUrl = `${window.location.origin}/broadcasts/${vodID}`;
    if (includeTimestamp && currentTime > 0) {
      const minutes = Math.floor(currentTime / 60);
      const seconds = Math.floor(currentTime % 60);
      return `${baseUrl}?t=${minutes}m${seconds}s`;
    }
    return baseUrl;
  };

  const copyToClipboard = (): void => {
    const shareLink = generateShareLink();
    navigator.clipboard
      .writeText(shareLink)
      .then(() => {
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      })
      .catch((error) => {
        console.error("Failed to copy to clipboard:", error);
      });
  };

  const handleShareButtonClick = (): void => {
    setShareModalOpened(true);
  };

  return (
    <>
      {isLoadingVOD && <Loader />}
      {vod && (
        <>
          <Box sx={{ width: "100%" }} mb="md">
            <VODPlayer
              vodID={vod.id}
              pieces={vod.pieces.map((piece) => ({
                id: piece.id,
                mp4URL: piece.mp4URL,
                jsonURL: piece.jsonURL,
              }))}
              onTimeUpdate={setCurrentTime}
              initialTimestamp={initialTimestamp}
            />
          </Box>
          <Box mb="md">
            <Text>{vod.description}</Text>
          </Box>
          <Box mb="md">
            <Button
              leftIcon={<FontAwesomeIcon icon={faShare} />}
              onClick={handleShareButtonClick}
            >
              Share
            </Button>
          </Box>
        </>
      )}

      <Modal
        opened={shareModalOpened}
        onClose={() => setShareModalOpened(false)}
        title="Share Broadcast"
        size="md"
      >
        <Box>
          <Switch
            label="Include current timestamp"
            checked={includeTimestamp}
            onChange={(event) =>
              setIncludeTimestamp(event.currentTarget.checked)
            }
            mb="md"
          />
          <TextInput
            value={generateShareLink()}
            readOnly
            placeholder="Share link will appear here"
            mb="md"
          />
          <Group position="right">
            <Tooltip label={copied ? "Copied!" : "Copy link"}>
              <ActionIcon
                size="lg"
                variant="filled"
                color={copied ? "green" : "blue"}
                onClick={copyToClipboard}
              >
                <FontAwesomeIcon icon={copied ? faCheck : faCopy} size="sm" />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Box>
      </Modal>
    </>
  );
};

export default Broadcast;
