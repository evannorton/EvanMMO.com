import { env } from "../env.mjs";

interface AccessTokenResponse {
  readonly access_token: string;
  readonly expires_in: number;
  readonly token_type: "bearer";
}

let accessToken: string | null = null;

const getTwitchAppAccessToken = async (
  forceRefresh: boolean
): Promise<string> => {
  if (forceRefresh || accessToken === null) {
    const body = new URLSearchParams();
    body.append("client_id", env.TWITCH_CLIENT_ID);
    body.append("client_secret", env.TWITCH_CLIENT_SECRET);
    body.append("grant_type", "client_credentials");
    const res = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
    const json: AccessTokenResponse = (await res.json()) as AccessTokenResponse;
    accessToken = json.access_token;
  }
  return accessToken;
};

export default getTwitchAppAccessToken;
