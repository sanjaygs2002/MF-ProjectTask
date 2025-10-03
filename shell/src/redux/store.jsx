import { configureStore } from "@reduxjs/toolkit";
import productsReducer from "./slices/ProductsSlice";
import authReducer from "./slices/authSlice";
export {fetchProducts,fetchProductById} from "./slices/ProductsSlice";
export {registerUser,loginUser,logout,updateUser} from "./slices/authSlice";
export {addToCard,fetchCart,updateCartQuantity,removeFromCart,clearCart,placeOrder} from "./slices/cartSlice";
import cartReducer from"./slices/cartSlice";
export {fetchOrders,updateOrderStatus,cancelOrder,placeOrderDirect,placeOrderFromCart,cancelItemFromOrder} from "./slices/orderSlice";
import orderReducer from "./slices/orderSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    cart:cartReducer,
    orders:orderReducer,
  },
});


