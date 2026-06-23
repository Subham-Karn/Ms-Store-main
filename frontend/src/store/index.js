import { configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage"; 
import { persistReducer, persistStore } from "redux-persist";

import userSlice from "./slices/userSlice";
import appSlice from "./slices/appSlice";
import ordersSlice from "./slices/orderSlice";
import cartSlice from "./slices/cartSlice";

const orderPersistConfig = {
  key: "order-storage",
  storage,
  whitelist: ["orders"]
};

const cartPersistConfig = {
  key: "cart-storage",
  storage,
  whitelist: ["cart", "address"],
};

const persistedOrderReducer = persistReducer(orderPersistConfig, ordersSlice);
const persistedCartReducer = persistReducer(cartPersistConfig, cartSlice);

const store = configureStore({
  reducer: {
    user: userSlice,
    app: appSlice,
    orders: persistedOrderReducer,
    cart: persistedCartReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
export default store;