import { CartApi, ExampleApi } from "../src/client/api";
import { AxiosHeaders, type AxiosResponse } from "axios";
import {
  CartItem,
  CartState,
  CheckoutFormData,
  CheckoutResponse,
  Product,
  ProductShortInfo,
} from "../src/common/types";

export function axiosResponse<T>(data: T, status?: number): AxiosResponse<T> {
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

export function productTOshort(product: Product): ProductShortInfo {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
  };
}

export class FakeApi extends ExampleApi {
  products: Record<Product["id"], Product> = {};

  setProducts(products: readonly Product[]) {
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

/*
class FakeCart extends CartApi {
  state: CartState;

  addItem(item: Product) {
    this.state[item.id] = {
      name: item.name,
      price: item.price,
      count: this.state[item.id]?.count + 1 ?? 0,
    };
  }
  setState(cart: CartState) {
    this.state = cart;
  }
  getState(): CartState {
    return this.state;
  }
}
*/

export const fakeLocalStorage: Storage = {
  store: {},

  get length() {
    return Object.keys(this.store).length;
  },

  get key() {
    return (n: number) => Object.keys(this.store)[n];
  },

  clear() {
    this.store = {};
  },

  getItem(key: string) {
    return this.store[key] || null;
  },

  setItem(key: string, value: unknown) {
    this.store[key] = String(value);
  },

  removeItem(key: string) {
    delete this.store[key];
  },
};
