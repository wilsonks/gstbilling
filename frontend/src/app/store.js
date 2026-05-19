import { configureStore } from "@reduxjs/toolkit";
import { createLogger } from "redux-logger";

import authReducer from "../features/auth/authSlice";
import companyReducer from "../features/company/companySlice";

const isDev = process.env.NODE_ENV === "development";

const logger = createLogger({
  collapsed: true,
  duration: true,
  diff: true,
  stateTransformer: (state) => ({
    ...state,
    auth: {
      ...state.auth,
      accessToken: state.auth?.accessToken ? "***" : null,
      refreshToken: state.auth?.refreshToken ? "***" : null,
    },
  }),
});

export const store = configureStore({
  reducer: {
    auth: authReducer,
    company: companyReducer,
  },

  middleware: (getDefaultMiddleware) =>
    isDev
      ? getDefaultMiddleware({
          serializableCheck: false,
        }).concat(logger)
      : getDefaultMiddleware({
          serializableCheck: false,
        }),

  devTools: isDev,
});