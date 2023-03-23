import { createContext } from "react";
import type { Dispatch, SetStateAction } from "react";

const context = createContext<{
  videoID: string | null;
  setVideoID: Dispatch<SetStateAction<string | null>>;
  gameID: string | null;
  setGameID: Dispatch<SetStateAction<string | null>>;
}>({
  videoID: null,
  setVideoID: () => {},
  gameID: null,
  setGameID: () => {},
});

export default context;
