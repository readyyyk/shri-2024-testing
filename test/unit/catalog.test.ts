import { it, expect } from "@jest/globals";
import { act, render } from "@testing-library/react";
import createApp from "../create-app";
import { FakeApi, fakeLocalStorage } from "../fakes";
import { Product } from "../../src/common/types";
import { PAGES } from "../shared-config";
import { gotoCatalog, LOADING_TEXT, waitForLoad } from "./config";

describe("Каталог", () => {
  const api = new FakeApi("");
  const mockProducts: readonly Product[] = Object.freeze([
    {
      id: 1,
      price: 10,
      name: "prod 1",
      color: "red",
      material: "material 1",
      description: "description 1",
    },
    {
      id: 2,
      price: 20,
      name: "prod 2",
      color: "blue",
      material: "material 2",
      description: "description 2",
    },
  ]);

  Object.defineProperty(global, "localStorage", {
    value: fakeLocalStorage,
  });

  beforeEach(() => {
    api.setProducts(mockProducts);
    global.localStorage.clear();
  });

  it("Для каждого товара в каталоге отображаются _ валидные названия, цены и ссылки _ на страницы с подробной информацией о товаре", async () => {
    const app = createApp({ api, initialEntries: [PAGES["каталог"]] });
    const { container, getByTestId, getByText } = render(app);

    await waitForLoad(container);

    const cardCount = container.querySelectorAll(".ProductItem").length;
    const card1 = container.querySelector(
      ".ProductItem[data-testid='" + mockProducts[0].id + "']",
    );
    const card2 = container.querySelector(
      ".ProductItem[data-testid='" + mockProducts[1].id + "']",
    );

    const title1 = card1.querySelector(".ProductItem-Name").textContent;
    const title2 = card2.querySelector(".ProductItem-Name").textContent;
    const price1 = card1.querySelector(".ProductItem-Price").textContent;
    const price2 = card2.querySelector(".ProductItem-Price").textContent;
    const link1 = card1
      .querySelector(".ProductItem-DetailsLink")
      .getAttribute("href");
    const link2 = card2
      .querySelector(".ProductItem-DetailsLink")
      .getAttribute("href");

    expect(cardCount).toBe(mockProducts.length);
    // expect(title1).toBe(mockProducts[0].name + "invalid");
    expect(title1).toBe(mockProducts[0].name);
    expect(title2).toBe(mockProducts[1].name);
    expect(price1).toBe("$" + mockProducts[0].price);
    expect(price2).toBe("$" + mockProducts[1].price);
    expect(link1).toBe(PAGES["каталог"] + "/" + mockProducts[0].id);
    expect(link2).toBe(PAGES["каталог"] + "/" + mockProducts[1].id);
  });

  it("При добавлении товара в корзину появляется соответсвующий индикатор на странице каталога", async () => {
    const app = createApp({
      api,
      initialEntries: [PAGES["каталог"] + "/" + mockProducts[0].id],
    });
    const { container, getByText } = render(app);
    await waitForLoad(container);

    // add to cart
    const button = container.querySelector(".ProductDetails-AddToCart");
    act(() => {
      button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    await gotoCatalog(container);

    // get cards
    const card1 = container.querySelector(
      ".ProductItem[data-testid='" + mockProducts[0].id + "']",
    );
    const card2 = container.querySelector(
      ".ProductItem[data-testid='" + mockProducts[1].id + "']",
    );

    // check badge
    const badge1 = card1.querySelector(".CartBadge");
    const badge2 = card2.querySelector(".CartBadge");

    expect(badge1).not.toBe(null);
    expect(badge2).toBe(null);
    // expect(badge2).not.toBe(null);
  });
});
