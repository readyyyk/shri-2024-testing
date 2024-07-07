import { basename, baseUrl } from "./config";
import { PAGES } from "../shared-config";
import { waitFor } from "@testing-library/react";

describe("header", function () {
  it("Полный флоу пользователя", async ({ browser }) => {
    // перешел в каталог
    await browser.url(baseUrl + basename + PAGES["каталог"]);
    let item = await browser.$$(".ProductItem")?.[1];
    item.waitForDisplayed({ timeout: 3000 }); // дождался появления товара
    const name = await item.$(".ProductItem-Name").getText();
    const price = await item.$(".ProductItem-Price").getText();

    // перешел на страницу товара
    await item.$(".ProductItem-DetailsLink").click();
    await browser
      .$(".ProductDetails-AddToCart")
      .waitForDisplayed({ timeout: 3000 }); // дождался появления кнопки "добавить в корзину"

    expect(await browser.$(".ProductDetails-Name").getText()).toEqual(name);
    expect(await browser.$(".ProductDetails-Price").getText()).toEqual(price);

    await browser.$(".ProductDetails-AddToCart").click(); // добавил товар в корзину
    await browser.$(".ProductDetails-AddToCart").click(); // еще раз

    // перешел в корзину
    expect(
      await browser.$('.nav-link[href="/hw/store/cart"]').getText(),
    ).toEqual("Cart (1)");
    await browser.$('.nav-link[href="/hw/store/cart"]').click();

    // очистил корзину
    await browser.$(".Cart-Clear").waitForDisplayed({ timeout: 3000 });
    await browser.$(".Cart-Clear").click();
    expect(
      await browser.$('.nav-link[href="/hw/store/cart"]').getText(),
    ).toEqual("Cart");

    // перешел в каталог
    await browser.$('a[href="' + basename + PAGES["каталог"] + '"]').click();

    // перешел на страницу товара и добавил 2 штуки в корзину
    item = await browser.$$(".ProductItem")?.[1];
    await item.waitForDisplayed({ timeout: 3000 });
    await item.$(".ProductItem-DetailsLink").click();
    await browser
      .$(".ProductDetails-AddToCart")
      .waitForDisplayed({ timeout: 3000 });
    // проверил, что попал на тот же товар
    expect(await browser.$(".ProductDetails-Name").getText()).toEqual(name);
    expect(await browser.$(".ProductDetails-Price").getText()).toEqual(price);

    await browser.$(".ProductDetails-AddToCart").click();
    await browser.$(".ProductDetails-AddToCart").click();

    // перешел в корзину
    await browser.$('.nav-link[href="/hw/store/cart"]').click();

    // перезагрузил страницу и корзина сохранилась
    await browser.refresh();
    expect(
      await browser.$('.nav-link[href="/hw/store/cart"]').getText(),
    ).toEqual("Cart (1)");

    // Ввел данные
    await browser.$(".Form-Field_type_name").addValue("John Doe");
    await browser.$(".Form-Field_type_phone").addValue("+79999999999");
    await browser.$(".Form-Field_type_address").addValue("Moscow, Red Square");

    await browser.$(".Form-Submit").click();

    await browser.$(".Cart-SuccessMessage").waitForDisplayed({ timeout: 3000 });
  });
});
