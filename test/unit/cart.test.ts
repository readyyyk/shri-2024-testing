import { it, expect } from "@jest/globals";
import { act, render, fireEvent } from "@testing-library/react";
import createApp from "../create-app";
import { FakeApi, fakeLocalStorage, productTOshort } from "../fakes";
import { CartState, Product } from "../../src/common/types";
import { PAGES } from "../shared-config";
import { gotoCart, gotoProduct } from "./utils";
import {
  initStore,
  addToCart as addToCartAction,
  productsLoad,
  productsLoaded,
} from "../../src/client/store";
import { CartApi } from "../../src/client/api";

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

  /** Goes to catalog via navbar, then goes to product, then goes clicks button "add to cart" and stays in product page  */
  const addToCart = async (container: HTMLElement, id: Product["id"]) => {
    await gotoProduct(container, id);
    const button = container.querySelector(".ProductDetails-AddToCart");
    act(() => {
      button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
  };

  it("Если корзина пустая, должна отображаться ссылка на каталог товаров", () => {
    const { container } = render(createApp({ initialEntries: ["/cart"] }));

    const link = container.querySelector(
      ":not(nav) > .container a[href='" + PAGES["каталог"] + "']",
    );

    expect(link).not.toBeNull();
  });

  it("В шапке рядом со ссылкой на корзину должно отображаться количество не повторяющихся товаров в ней", () => {
    const cart = new CartApi();
    cart.setState({
      [mockProducts[0].id]: { ...productTOshort(mockProducts[0]), count: 1 },
      [mockProducts[1].id]: { ...productTOshort(mockProducts[1]), count: 2 },
    } satisfies CartState);

    const { container } = render(
      createApp({
        api,
        cart,
        initialEntries: [PAGES["главная"]],
      }),
    );

    const cartLink = container.querySelector("nav a[href='/cart']");
    let nav_number = parseInt(
      cartLink.textContent.split(" ")[1]?.replace("(", "").replace(")", "") ??
        "",
    );
    const real_number = Object.keys(cart.getState()).length;
    expect(nav_number).toBe(real_number);

    /*
    let prev_number = parseInt(
      cartLink.textContent
        .split(" ")[1]
        ?.replace("(", "")
        .replace(")", "") ?? "",
    );

    prev_number = Number.isNaN(prev_number) ? 0 : prev_number;

    await addToCart(container, mockProducts[0].id);
    await addToCart(container, mockProducts[1].id);
    */
  }, 300);

  it("В корзине должна отображаться таблица с добавленными в нее товарами", async () => {
    const cart = new CartApi();
    cart.setState({
      [mockProducts[0].id]: { ...productTOshort(mockProducts[0]), count: 2 },
      [mockProducts[1].id]: { ...productTOshort(mockProducts[1]), count: 1 },
    } satisfies CartState);

    const { container } = render(
      createApp({
        api,
        initialEntries: ["/cart"],
      }),
    );

    const row1 = container.querySelector(
      "tr[data-testid='" + mockProducts[0].id + "']",
    );
    const row2 = container.querySelector(
      "tr[data-testid='" + mockProducts[1].id + "']",
    );

    expect(row1).not.toBeNull();
    expect(row2).not.toBeNull();

    const count1 = row1.querySelector(".Cart-Count").textContent;
    const count2 = row2.querySelector(".Cart-Count").textContent;

    const price1 = row1.querySelector(".Cart-Price").textContent;
    const price2 = row2.querySelector(".Cart-Price").textContent;

    const total1 = row1.querySelector(".Cart-Total").textContent;
    const total2 = row2.querySelector(".Cart-Total").textContent;

    const name1 = row1.querySelector(".Cart-Name").textContent;
    const name2 = row2.querySelector(".Cart-Name").textContent;

    const total = container.querySelector(".Cart-OrderPrice").textContent;

    expect(count1).toBe("2");
    expect(count2).toBe("1");

    expect(price1).toBe("$" + mockProducts[0].price);
    expect(price2).toBe("$" + mockProducts[1].price);

    expect(total1).toBe("$" + mockProducts[0].price * 2);
    expect(total2).toBe("$" + mockProducts[1].price);

    expect(name1).toBe(mockProducts[0].name);
    expect(name2).toBe(mockProducts[1].name);

    const sum = mockProducts[0].price * 2 + mockProducts[1].price;
    expect(total).toBe("$" + sum);
  });

  it("В корзине должны валидироваться данные введенные в инпуты", async () => {
    const cart = new CartApi();
    cart.setState({
      [mockProducts[0].id]: { ...productTOshort(mockProducts[0]), count: 1 },
    } satisfies CartState);
    const { container } = render(
      createApp({
        api,
        cart,
        initialEntries: ["/cart"],
      }),
    );

    const inputName = container.querySelector(
      "input.Form-Field_type_name",
    ) as HTMLInputElement;
    const inputPhone = container.querySelector(
      "input.Form-Field_type_phone",
    ) as HTMLInputElement;
    const inputAddress = container.querySelector(
      "textarea.Form-Field_type_address",
    ) as HTMLTextAreaElement;
    const submitButton = container.querySelector(
      "button.Form-Submit",
    ) as HTMLButtonElement;

    // first check: valid, invalid, invalid
    act(() => {
      fireEvent.change(inputName, { target: { value: "vasya" } });
      fireEvent.change(inputPhone, { target: { value: "123" } });
      fireEvent.change(inputAddress, { target: { value: "   " } });
      submitButton.click();
    });

    expect(inputName.classList.contains("is-invalid")).not.toBeTruthy();
    expect(inputPhone.classList.contains("is-invalid")).toBeTruthy();
    expect(inputAddress.classList.contains("is-invalid")).toBeTruthy();

    // second check: invalid, valid, valid
    act(() => {
      fireEvent.change(inputName, { target: { value: "  " } });
      fireEvent.change(inputPhone, { target: { value: "79155590507" } });
      fireEvent.change(inputAddress, { target: { value: "countryside:)" } });
      submitButton.click();
    });

    expect(inputName.classList.contains("is-invalid")).toBeTruthy();
    expect(inputPhone.classList.contains("is-invalid")).not.toBeTruthy();
    expect(inputAddress.classList.contains("is-invalid")).not.toBeTruthy();
  });
});
