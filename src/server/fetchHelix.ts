import { env } from "../env.mjs";
import getTwitchAppAccessToken from "./getTwitchAppAccessToken";

const fetchHelix = async (route: string): Promise<Response> => {
  const res = await fetch(`https://api.twitch.tv/helix/${route}`, {
    headers: {
      Authorization: `Bearer ${await getTwitchAppAccessToken(false)}`,
      "Client-Id": env.TWITCH_CLIENT_ID,
    },
  });
  if (res.status !== 401) {
    return res;
  }
  return await fetch(`https://api.twitch.tv/helix/${route}`, {
    headers: {
      Authorization: `Bearer ${await getTwitchAppAccessToken(true)}`,
      "Client-Id": env.TWITCH_CLIENT_ID,
    },
  });
};

export default fetchHelix;
