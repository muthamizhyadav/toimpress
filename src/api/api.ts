export const API_URL = import.meta.env.VITE_API_TOIMPRESS_URL;

export const GET_PRODUCTS = API_URL + "products/products/by/categories/";
export const GET_HOME_BANNER = API_URL + "user/home/banner";
export const GET_PRODUCTS_DETAILS = API_URL + "products/product/detail/";

export const PLACE_ORDER = API_URL + "/order/placeorder"

export const GET_ORDERS = API_URL + ""

export const GET_OTP = API_URL+ "users/login/request-otp";
export const VERIFY_OTP = API_URL + "Users/login/verify-otp";

export const UPDATE_PROFILE = API_URL + "users";
export const GET_PROFILE = API_URL + "users";
export const API_CART = API_URL + "cart";
export const API_CART_UPDATE = API_URL + "cart";

export const API_GET_UPDATE = API_URL + "cart";
export const API_DELETE_CART_PRODUCTS = "cart/"

export const API_GET_CATEGORIES = "category"
export const API_GET_CATEGORIES_PRODUCTS = "products/products/category/";

export const API_GET_CATEGORIES_PRODUCTS_BYSIZE = "products/size/products/";


export const API_GET_CART_DATA = API_URL + "products/"
export const API_SEARCH_PRODUCTS = API_URL + "products/global/search?searchkey="

export const LOGIN = API_URL + "auth/login";