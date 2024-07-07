import {
  act,
  getByText,
  queryByText,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { Product } from "../../src/common/types";

export const BASE_URL = "http://localhost";
export const BASE_NAME = "/";

export const LOADING_TEXT = "LOADING";

export const gotoCatalog = async (container: HTMLElement) => {
  act(() => {
    const link = getByText(container, "Catalog", { selector: "a.nav-link" });
    link.click();
  });
  await waitForLoad(container);
};

export const gotoProduct = async (
  container: HTMLElement,
  id: Product["id"],
) => {
  await gotoCatalog(container);
  await waitForLoad(container);
  act(() => {
    try {
      const link = getByText(container, /.*/, {
        selector: `.ProductItem[data-testid="${id}"] a.ProductItem-DetailsLink`,
      });
      link.click();
    } catch (e) {
      throw new Error("Product with provided id not found!\n" + e.toString());
    }
  });
  await waitForLoad(container);
};

export const gotoCart = (container: HTMLElement) => {
  act(() => {
    getByText(container, /Cart( \(\d+\))?/i, {
      selector: "a.nav-link",
    }).click();
  });
};

export const waitForLoad = async (container: HTMLElement) => {
  const loading = queryByText(container, LOADING_TEXT);
  if (loading === null) {
    // console.log("!!! imm resolved");
    return Promise.resolve();
  }
  // console.log(loading.outerHTML, container.outerHTML);
  debugger;
  try {
    await waitForElementToBeRemoved(loading, { timeout: 100 });
  } catch (e) {
    // console.log("error: wait for load: ", container.outerHTML, e.toString());
    return Promise.resolve();
  }
};
