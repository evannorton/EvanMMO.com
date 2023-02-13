import twitchUsername from "../constants/twitchUsername";
import fetchHelix from "../server/fetchHelix";
import type StreamsResponse from "../types/twitch/StreamsResponse";

const streamIsLive = async (): Promise<boolean> => {
  const streamsRes = await fetchHelix(`streams?user_login=${twitchUsername}`);
  const streams: StreamsResponse = (await streamsRes.json()) as StreamsResponse;
  return streams.data.length > 0;
};

export default streamIsLive;
