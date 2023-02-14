import { google } from "googleapis";
import { env } from "../env.mjs";

const youtubeAPI = google.youtube({
  auth: env.GOOGLE_API_KEY,
  version: "v3",
});

export default youtubeAPI;
