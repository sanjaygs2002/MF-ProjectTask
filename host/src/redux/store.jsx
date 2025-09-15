import { configureStore } from "@reduxjs/toolkit";
import productsReducer from "./slices/ProductsSlice";
import authReducer from "./slices/authSlice";
export {fetchProducts,fetchProductById} from "./slices/ProductsSlice";
export {registerUser,loginUser,logout} from "./slices/authSlice";


export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
  },
});


