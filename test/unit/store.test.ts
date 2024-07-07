/*

# Оправдания насчет первого теста
Флоу обработки следующий:
1. dispatch(CHECKOUT)           <- такая запись в компоненте
2. fn checkout_epic()           <- rxjs epic функция: она вызывает dispatch внутри
3. dispatch(CHECKOUT_COMPLETE)  <- здесь мы получаем информацию о результате чекаута
4. fn shoppingCartEpic()        <- а в этом эпике обновляется CartApi

т.к. CartApi обновляется после диспатча - то в коллбэке с подпиской CartApi еще не обновлено

поэтому я решил поиграть с EventLoop'ом и сделал следующее:
1. я расставил логи, чтобы узнать как именно вызываются функции, с какой разницей
2. добавил к логам performance.now чтобы узнать примерное поведение каждой функции
3. предположил что при выставлении задержки (таймаута) функция отработает и результат будет успешный
4. Подтвердил свою теорию с задержкой в 100ms
5. Проанализировав результаты performance.now предположил что будет достаточно положить проверку в конец CallStack'а
6. Выставил нулевой таймаут и убедился в том, что решение работает проверив с багом номер 6

*/

import { describe, it } from "@jest/globals";
import {
  addToCart,
  checkout, clearCart,
  initStore,
  productsLoaded,
} from '../../src/client/store';
import { FakeApi, fakeLocalStorage } from "../fakes";
import { CartApi } from "../../src/client/api";
import { Product } from "../../src/common/types";
import { FAKE_STATIC_RANDOM } from '../shared-config';

describe("Redux store", () => {
  const api = new FakeApi("");
  const cart = new CartApi();
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
      id: 3,
      price: 30,
      name: "prod 3",
      color: "blue",
      material: "material 3",
      description: "description 3",
    },
  ]);

  Object.defineProperty(global, "localStorage", {
    value: fakeLocalStorage,
  });

  beforeEach(() => {
    api.setProducts(mockProducts);
    global.localStorage.clear();
    cart.setState(undefined);
  });

  it("Состояние корзины должно быть очищено после завершения рассчета (checkout_complete) и синхронизировано с CartApi", (done) => {
    const store = initStore(api, cart);
    store.dispatch(productsLoaded([...mockProducts]));
    store.dispatch(addToCart(mockProducts[0]));

    const mockUserData = { name: "", address: "", phone: "" };
    const currentCart = store.getState().cart;
    store.dispatch(checkout(mockUserData, currentCart));

    const un = store.subscribe(() => {
      const storeCart = store.getState().cart

      expect(store.getState().cart).toEqual({});
      expect(store.getState().latestOrderId).toBe(FAKE_STATIC_RANDOM); // returned from fake api
      setTimeout(()=>{
        const clientState = cart.getState();
        expect(storeCart).toEqual(clientState);
        // console.log(storeCart, clientState)
        // console.log(performance.now()+" !!!!! comparisons")
        un();
        done();
      }, 0);
    });
  }, 3000);


    it("Состояние корзины должно быть очищено на событие вызова (CLEAR_CART) и синхронизировано с CartApi", (done) => {
      const store = initStore(api, cart);
      store.dispatch(productsLoaded([...mockProducts]));
      store.dispatch(addToCart(mockProducts[0]));

      store.dispatch(clearCart());

      expect(store.getState().cart).toEqual({});

      const clientState = cart.getState();
      expect(store.getState().cart).toEqual(clientState);

      done();
      // const un = store.subscribe(() => {
      //   expect(store.getState().cart).toEqual({});
      //   un();
      //   done();
      // });
    }, 3000);

    it("Товар должен быть добавлен в корзину на событие вызова (ADD_TO_CART) и синхронизирован с CartApi", (done) => {
      const store = initStore(api, cart);
      store.dispatch(productsLoaded([...mockProducts]));

      store.dispatch(addToCart(mockProducts[1]));
      store.dispatch(addToCart(mockProducts[0]));
      store.dispatch(addToCart(mockProducts[1]));

      const currentCart = store.getState().cart;

      expect(currentCart[mockProducts[0].id]).toEqual({
        count: 1,
        name: mockProducts[0].name,
        price: mockProducts[0].price
      });
      expect(currentCart[mockProducts[1].id]).toEqual({
        count: 2,
        name: mockProducts[1].name,
        price: mockProducts[1].price
      });

      const clientState = cart.getState();
      expect(store.getState().cart).toEqual(clientState);

      done();
      // const un = store.subscribe(() => {
      //   expect(store.getState().cart).toEqual({});
      //   un();
      //   done();
      // });
    }, 3000);

});
