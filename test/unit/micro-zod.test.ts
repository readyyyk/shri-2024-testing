import { describe, expect } from "@jest/globals";
import { r } from "../../utils/micro-zod";

const mockValidProduct = {
  id: 1,
  name: "prod 1",
  price: 10,
  color: "red",
  material: "material 1",
  description: "description 1",
};

describe("Micro-zod util works fine", () => {
  it("Валидация схемы проходит успешно", () => {
    const productValidSchema = r.object({
      id: r.num(),
      name: r.str(),
      description: r.str(),
      price: r.num(),
      color: r.str(),
      material: r.str(),
    });

    const result = productValidSchema(mockValidProduct);

    expect(result.success).toBe(true);
  });

  it("Валидация схемы возвращает результат с ошибкой при неправильных переданных данных в поле", () => {
    const productInvalidSchema = r.object({
      id: r.num(),
      name: r.str(),
      description: r.str(),
      price: r.num(),
      color: r.str(),
      material: r.num(),
    });

    const result = productInvalidSchema(mockValidProduct);

    /*
    if (result.success === false) {
      // dont know why {!result.success} is not working
      console.log(result.error);
    }
    */
    expect(result.success).toBe(false);
  });

  // Можно еще тестить очень и очень долго, но не сейчас
});
