import { it, expect } from "@jest/globals";
import { act, render } from "@testing-library/react";
import createApp from "../create-app";
import { FakeApi, fakeLocalStorage } from "../fakes";
import { Product } from "../../src/common/types";
import { PAGES } from "../shared-config";
import { gotoCart, gotoProduct, waitForLoad } from "./config";

describe("Продукт", () => {
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

  it("На странице с подробной информацией отображаются: _ название товара, его описание, цена, цвет, материал и кнопка 'добавить в корзину'", async () => {
    const app = createApp({
      api: api,
      initialEntries: [PAGES["каталог"] + "/" + mockProducts[0].id],
    });
    const { container, getByText } = render(app);
    await waitForLoad(container);

    const title = container.querySelector(".ProductDetails-Name");
    const description = container.querySelector(".ProductDetails-Description");
    const price = container.querySelector(".ProductDetails-Price");
    const color = container.querySelector(".ProductDetails-Color");
    const material = container.querySelector(".ProductDetails-Material");
    const button = container.querySelector(".ProductDetails-AddToCart");

    expect(title.textContent).toBe(mockProducts[0].name);
    expect(description.textContent).toBe(mockProducts[0].description);
    expect(price.textContent).toBe("$" + mockProducts[0].price);
    expect(color.textContent).toBe(mockProducts[0].color);
    expect(material.textContent).toBe(mockProducts[0].material);
    expect(button).not.toBeNull();
  });

  it("При нажатии на кнопку 'добавить в корзину' товар добавляется в корзину", async () => {
    const app = createApp({
      api: api,
      initialEntries: [PAGES["каталог"] + "/" + mockProducts[0].id],
    });
    const { container, getByText } = render(app);
    await waitForLoad(container);

    const button = container.querySelector(".ProductDetails-AddToCart");
    act(() => {
      button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    const badge = container.querySelector(".CartBadge");
    expect(badge).not.toBe(null);
  });

  it('Если товар уже добавлен в корзину, повторное нажатие кнопки "добавить в корзину" должно увеличивать его количество', async () => {
    const app = createApp({
      api: api,
      initialEntries: ["/cart", PAGES["каталог"] + "/" + mockProducts[0].id],
    });
    const { container, getByTestId, getByText } = render(app);
    await waitForLoad(container);

    let prev_count = parseInt(
      container.querySelector(
        `[data-testid="${mockProducts[0].id}"] .Cart-Count`,
      )?.textContent ?? "",
    );
    prev_count = Number.isNaN(prev_count) ? 0 : prev_count;

    await gotoProduct(container, mockProducts[0].id);

    const button = container.querySelector(".ProductDetails-AddToCart");
    act(() => {
      button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    gotoCart(container);

    const row = getByTestId(mockProducts[0].id);
    const count = row.querySelector(".Cart-Count").textContent;

    expect(count).toBe(String(prev_count + 2));
  });
});
