import "server-only";

import type { TextStore } from "../source";
import { store } from "./store";

export const mockTextStore: TextStore = {
  async listEdits() {
    return [...store().textEdits];
  },
};
