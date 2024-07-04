import { ExampleApi } from "../src/client/api";
import { AxiosHeaders, type AxiosResponse } from "axios";
import {
  CartState,
  CheckoutFormData,
  CheckoutResponse,
  Product,
  ProductShortInfo,
} from "../src/common/types";

function axiosResponse<T>(data: T, status?: number): AxiosResponse<T> {
  return {
    config: {
      headers: new AxiosHeaders({}),
    },
    data: data,
    status: status ?? 200,
    headers: {},
    statusText: "",
  };
}

function productTOshort(product: Product): ProductShortInfo {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
  };
}

class FakeApi extends ExampleApi {
  products: Record<Product["id"], Product> = {};

  setProducts(products: Product[]) {
    this.products = products.reduce(
      (acc, product) => {
        acc[product.id] = product;
        return acc;
      },
      {} as Record<Product["id"], Product>,
    );
  }

  async getProducts(): Promise<AxiosResponse<ProductShortInfo[]>> {
    return Promise.resolve(
      axiosResponse(Object.values(this.products).map(productTOshort)),
    );
  }

  async getProductById(id: number): Promise<AxiosResponse<Product>> {
    return Promise.resolve(axiosResponse(this.products[id]));
  }

  async checkout(
    form: CheckoutFormData,
    cart: CartState,
  ): Promise<AxiosResponse<CheckoutResponse>> {
    return Promise.resolve(
      axiosResponse({
        id: 1,
      }),
    );
  }
}
