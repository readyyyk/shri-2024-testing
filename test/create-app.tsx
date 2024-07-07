import React from "react";

import { CartApi, ExampleApi } from "../src/client/api";
import { initStore } from "../src/client/store";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { Application } from "../src/client/Application";
import { BASE_NAME } from "./unit/utils";

type CreateAppOptions =
  | {
      api?: ExampleApi;
      cart?: CartApi;
      initialEntries?: string[];
      initialIndex?: number;
    }
  | {
      store: ReturnType<typeof initStore>;
      initialEntries?: string[];
      initialIndex?: number;
    };
function createApp(args?: CreateAppOptions) {
  let store: ReturnType<typeof initStore>;
  const { initialEntries, initialIndex } = args ?? {};

  if (typeof args !== "undefined" && "store" in args) {
    store = args.store;
  } else {
    const _api = args?.api ?? new ExampleApi(BASE_NAME);
    const _cart = args?.cart ?? new CartApi();
    store = initStore(_api, _cart);
  }

  const app = (
    <MemoryRouter
      basename={BASE_NAME}
      initialEntries={initialEntries ?? ["/"]}
      initialIndex={initialIndex ?? 0}
    >
      <Provider store={store}>
        <Application />
      </Provider>
    </MemoryRouter>
  );

  return app;
}

export default createApp;
