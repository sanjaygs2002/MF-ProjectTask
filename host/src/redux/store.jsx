import { configureStore } from "@reduxjs/toolkit";
import productsReducer from "./slices/ProductsSlice";
import authReducer from "./slices/authSlice";
export {fetchProducts,fetchProductById} from "./slices/ProductsSlice";
export {registerUser,loginUser,logout} from "./slices/authSlice";
export {addToCard,fetchCart} from "./slices/cartSlice";
import cartReducer from"./slices/cartSlice";


export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    cart:cartReducer,
  },
});


