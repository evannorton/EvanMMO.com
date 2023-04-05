import { createContext } from "react";
import type { Dispatch, SetStateAction } from "react";

const context = createContext<{
  selectedVODID: string | null;
  setSelectedVODID: Dispatch<SetStateAction<string | null>>;
  selectedVideoID: string | null;
  setSelectedVideoID: Dispatch<SetStateAction<string | null>>;
  selectedGameID: string | null;
  setSelectedGameID: Dispatch<SetStateAction<string | null>>;
}>({
  selectedVODID: null,
  setSelectedVODID: () => {},
  selectedVideoID: null,
  setSelectedVideoID: () => {},
  selectedGameID: null,
  setSelectedGameID: () => {},
});

export default context;
