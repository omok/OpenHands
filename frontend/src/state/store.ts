import { configureStore } from "@reduxjs/toolkit";
import { selectedFilesSlice } from "./initial-query-slice";

export const store = configureStore({
  reducer: {
    initialQuery: selectedFilesSlice.reducer,
  },
});
