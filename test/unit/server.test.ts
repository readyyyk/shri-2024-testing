import { describe } from "@jest/globals";
import { ExampleStore } from "../../src/server/data";
import { r } from "../../utils/micro-zod";
import { Product } from "../../src/common/types";

const bugId = parseInt(process.env.BUG_ID);
const productSchema = r.object({
  id: r.num(),
  name: r.str(),
  description: r.str(),
  price: r.num(),
  color: r.str(),
  material: r.str(),
});
const shortProductSchema = r.object({
  id: r.num(),
  name: r.str(),
  price: r.num(),
});

describe("Сервер", () => {
  describe("Стор", () => {
    it("Вызов метода getAllProducts стора должен возвращать валидные данные", async () => {
      const store = new ExampleStore();
      const products = store.getAllProducts(bugId);
      for (const product of products) {
        const result = shortProductSchema(product);
        if (result.success === false) {
          console.error(result.error);
        }
        expect(result.success).toBe(true);
      }
    });

    it("Вызов метода getProductById стора должен возвращать валидные данные", async () => {
      const fallbackMockProduct: Product = {
        id: 1,
        name: "1n",
        price: 1,
        description: "1d",
        material: "1m",
        color: "1c",
      };

      const store = new ExampleStore();
      const allProducts = store.getAllProducts(bugId);
      if (allProducts.length === 0) {
        console.warn(
          "UNSAFE: products array is empty, so assigning a fallback product",
        );
        Object.defineProperty(store, "products", {
          value: [fallbackMockProduct],
        });
      }

      const toFind = allProducts[0].id;
      const product = store.getProductById(toFind);

      const shortProduct = (({ name, price, id }: Product) => ({
        name,
        price,
        id,
      }))(product);

      expect(shortProduct).toEqual(allProducts[0]);
    });
  });

  describe("Роутер", () => {
    it("GET /products возвращает список продуктов", async () => {
      // const response = await supertest(router.stack).get("/api/orders");
    });
  });
});
