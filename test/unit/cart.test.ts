import { it, expect } from "@jest/globals";
import { act, render } from "@testing-library/react";
import createApp from "../create-app";
import { FakeApi, fakeLocalStorage } from "../fakes";
import { Product } from "../../src/common/types";
import { PAGES } from "../shared-config";
import { gotoProduct } from "./config";

describe("Корзина", () => {
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

  it("Если корзина пустая, должна отображаться ссылка на каталог товаров", () => {
    const { container } = render(createApp({ initialEntries: ["/cart"] }));

    const link = container.querySelector(
      ":not(nav) > .container a[href='" + PAGES["каталог"] + "']",
      // ":not(nav) > .container a[href='" + PAGES["главная"] + "']",
    );

    expect(link).not.toBeNull();
  });

  it("В шапке рядом со ссылкой на корзину должно отображаться количество не повторяющихся товаров в ней", async () => {
    const { container } = render(createApp({ api, initialEntries: ["/cart"] }));

    const cartLink = container.querySelector("nav a[href='/cart']");

    let prev_number = parseInt(
      cartLink.textContent.split(" ")[1]?.replace("(", "").replace(")", "") ??
        "",
    );

    prev_number = Number.isNaN(prev_number) ? 0 : prev_number;

    // add to cart product1
    {
      await gotoProduct(container, mockProducts[0].id);
      const button = container.querySelector(".ProductDetails-AddToCart");
      act(() => {
        button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });
    }

    // add to cart product2
    {
      await gotoProduct(container, mockProducts[1].id);
      const button = container.querySelector(".ProductDetails-AddToCart");
      act(() => {
        button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });
    }

    let new_number = parseInt(
      cartLink.textContent.split(" ")[1]?.replace("(", "").replace(")", "") ??
        "",
    );

    expect(new_number).toBe(prev_number + 2);
  });
});
