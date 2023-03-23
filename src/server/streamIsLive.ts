import fetchHelix from "../server/fetchHelix";
import twitchUsername from "../constants/twitchUsername";
import type StreamsResponse from "../types/twitch/StreamsResponse";

const streamIsLive = async (): Promise<boolean> => {
  const streamsRes = await fetchHelix(`streams?user_login=${twitchUsername}`);
  const streams: StreamsResponse = (await streamsRes.json()) as StreamsResponse;
  if (streams.data) {
    return streams.data.length > 0;
  }
  return false;
};

export default streamIsLive;
