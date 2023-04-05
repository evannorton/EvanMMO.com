import { Box, Text } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import type VODJSON from "../types/VODJSON";

interface Props {
  readonly currentTime: number;
  readonly jsonURL: string;
}

const VODChat: React.FC<Props> = ({ jsonURL, currentTime }) => {
  const [vodJSON, setVODJSON] = useState<VODJSON | null>(null);
  const [renderedComments, setRenderedComments] = useState<VODJSON["comments"]>(
    []
  );
  const boxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    fetch(jsonURL)
      .then((res) => res.json())
      .then((json) => {
        setVODJSON(json as VODJSON);
      })
      .catch((e) => {
        throw e;
      });
  }, [jsonURL]);
  useEffect(() => {
    const filteredComments = vodJSON
      ? vodJSON.comments.filter(
          (comment) => comment.content_offset_seconds <= currentTime
        )
      : [];
    const newRenderedComments =
      filteredComments.length <= 100
        ? filteredComments
        : filteredComments.slice(
            filteredComments.length - 100,
            filteredComments.length
          );
    if (
      renderedComments[renderedComments.length - 1] !==
      newRenderedComments[newRenderedComments.length - 1]
    ) {
      setRenderedComments(newRenderedComments);
    }
  }, [vodJSON, renderedComments, currentTime]);
  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.scrollTop = boxRef.current.scrollHeight;
    }
  }, [boxRef, renderedComments]);
  if (vodJSON) {
    return (
      <Box style={{ overflowY: "scroll", height: "100%" }} ref={boxRef}>
        {renderedComments.map((comment) => (
          <Text key={comment._id}>
            <b style={{ color: comment.message.user_color ?? undefined }}>
              {comment.commenter.display_name}:
            </b>{" "}
            {comment.message.body}
          </Text>
        ))}
      </Box>
    );
  }
  return null;
};

export default VODChat;
