import { env } from "../env.mjs";
import { google } from "googleapis";

const youtubeAPI = google.youtube({
  auth: env.GOOGLE_API_KEY,
  version: "v3",
});

export default youtubeAPI;
