import type { Dispatch, SetStateAction } from "react";
import { createContext } from "react";

const context = createContext<{
  videoID: string | null;
  setVideoID: Dispatch<SetStateAction<string | null>>;
}>({
  videoID: null,
  setVideoID: () => {},
});

export default context;
