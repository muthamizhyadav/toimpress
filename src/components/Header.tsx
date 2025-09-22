// components/Header.tsx
import { Burger } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState, useCallback } from "react";
import { MobileMenuDrawer, UseMobileMenuDrawer } from "./MobileMenuDrawer";
import { MobileCartDrawer } from "./MobileCartDrawer";
import { useAuth } from "../assets/hooks/useAuth";
import { IconCheck, IconUserFilled, IconX } from "@tabler/icons-react";
import { useDispatch } from "react-redux";
import { openCart } from "../redux/features/cartSlice";
import axiosInstance from "../api/axiosInstance"; // adjust path if needed
import { API_GET_CATEGORIES, API_GET_UPDATE } from "../api/api";
import { showNotification } from "@mantine/notifications";

export default function Header() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedId = searchParams.get("id");
  const { isAuthenticated } = useAuth();
  const isMobile = useMediaQuery("(max-width: 640px)");
  const menu = UseMobileMenuDrawer();

  const dispatch = useDispatch();
  const [cartCount, setCartCount] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState("");

  // NEW: categories state
  const [categories, setCategories] = useState<
    Array<{ _id: string; categoryTitle: string; imageUrl?: string; active?: boolean }>
  >([]);

  console.log(categories, "categories")

  // isSelected now works with category _id strings
  const isSelected = (id: string | null) =>
    selectedId === id ? "font-bold underline text-[#122F15]" : "text-[#252C32]";

  const handleNavigation = (str?: string) => {
    navigate(`/${str ?? ""}`);
    menu.close();
  };

  const getCategories = async () => {
    try {
      const resp = await axiosInstance.get(API_GET_CATEGORIES);
      // response shape might be resp.data or resp
      const payload = resp?.data ?? resp;

      // if API returns an array directly:
      if (Array.isArray(payload)) {
        setCategories(payload);
      } else if (payload && Array.isArray(payload.data)) {
        setCategories(payload.data);
      } else {
        // fallback: try to find array inside response
        const foundArray = Object.values(payload).find((v) => Array.isArray(v)) as any;
        if (foundArray) setCategories(foundArray);
      }

      return payload;
    } catch (error: any) {
      showNotification({
        title: "Error",
        message: error?.response?.data?.message || "Failed to fetch categories.",
        color: "red",
        icon: <IconX size={16} />,
      });
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  const computeCountFromItems = (items: any[] = []) =>
    items.reduce((sum, it) => sum + (it.qty ?? it.quantity ?? 0), 0);

  const fetchCartCount = useCallback(async (signal?: AbortSignal) => {
    try {
      const resp = await axiosInstance.get(API_GET_UPDATE, { signal });
      const payload = resp.data ?? resp;
      let items: any[] = [];

      if (Array.isArray(payload)) {
        items = payload;
      } else if (payload && Array.isArray(payload.items)) {
        items = payload.items;
      } else if (payload && Array.isArray(payload.data)) {
        items = payload.data;
      } else if (payload && payload.data && Array.isArray(payload.data.items)) {
        items = payload.data.items;
      }

      // best-effort to compute count
      const count = computeCountFromItems(items) || (Array.isArray(payload?.data) ? payload.data.length : 0);
      setCartCount(count);
    } catch (err: any) {
      if (err?.name === "CanceledError" || err?.name === "AbortError") return;
      console.warn("Failed to fetch cart count:", err);
      setCartCount(0);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchCartCount(controller.signal);

    // Re-fetch when window gains focus
    const onFocus = () => fetchCartCount();

    // Listen for product-level cart updates (ProductCard dispatches this)
    const onCartUpdated = () => fetchCartCount();

    window.addEventListener("focus", onFocus);
    window.addEventListener("cart:updated", onCartUpdated);

    return () => {
      controller.abort();
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("cart:updated", onCartUpdated);
    };
  }, [isAuthenticated, fetchCartCount]);

  return (
    <>
      <header className="bg-sandle w-full h-[80px] md:h-[112px] flex items-center px-10 sm:px-12 md:px-14 lg:px-14 relative z-50">
        <img
          src="/logo.png"
          alt="Logo"
          className="md:w-[106px] md:h-[65px] w-[80px] h-[50px] cursor-pointer"
          onClick={() => handleNavigation("")}
        />

        {isMobile && (
          <div className="ml-auto flex items-center">
            {/* Cart Icon with Badge */}
            <div
              className="relative mr-4 cursor-pointer"
              onClick={() => {
                // Optionally refresh before opening
                fetchCartCount();
                dispatch(openCart());
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 3C4.73478 3 4.48043 3.10536 4.29289 3.29289C4.10536 3.48043 4 3.73478 4 4C4 4.26522 4.10536 4.51957 4.29289 4.70711C4.48043 4.89464 4.73478 5 5 5H6.22L6.525 6.222L7.893 11.694L7 12.586C5.74 13.846 6.632 16 8.414 16H17C17.2652 16 17.5196 15.8946 17.7071 15.7071C17.8946 15.5196 18 15.2652 18 15C18 14.7348 17.8946 14.4804 17.7071 14.2929C17.5196 14.1054 17.2652 14 17 14H8.414L9.414 13H16C16.1857 13 16.3676 12.9481 16.5255 12.8504C16.6834 12.7528 16.811 12.6131 16.894 12.447L19.894 6.447C19.9702 6.29458 20.0061 6.12522 19.9985 5.95501C19.9908 5.78479 19.9398 5.61935 19.8502 5.47439C19.7606 5.32944 19.6355 5.20977 19.4867 5.12674C19.3379 5.04372 19.1704 5.00009 19 5H8.28L7.97 3.757C7.91583 3.54075 7.79095 3.34881 7.61521 3.21166C7.43946 3.0745 7.22293 3.00001 7 3H5ZM18 18.5C18 18.8978 17.842 19.2794 17.5607 19.5607C17.2794 19.842 16.8978 20 16.5 20C16.1022 20 15.7206 19.842 15.4393 19.5607C15.158 19.2794 15 18.8978 15 18.5C15 18.1022 15.158 17.7206 15.4393 17.4393C15.7206 17.158 16.1022 17 16.5 17C16.8978 17 17.2794 17.158 17.5607 17.4393C17.842 17.7206 18 18.1022 18 18.5ZM8.5 20C8.89782 20 9.27936 19.842 9.56066 19.5607C9.84196 19.2794 10 18.8978 10 18.5C10 18.1022 9.84196 17.7206 9.56066 17.4393C9.27936 17.158 8.89782 17 8.5 17C8.10218 17 7.72064 17.158 7.43934 17.4393C7.15804 17.7206 7 18.1022 7 18.5C7 18.8978 7.15804 19.2794 7.43934 19.5607C7.72064 19.842 8.10218 20 8.5 20Z"
                  fill="#122F15"
                />
              </svg>

              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#8BB06E] text-white text-[10px] px-1.5 py-[2px] rounded-full">
                  {cartCount}
                </span>
              )}
            </div>

            <Burger opened={menu.opened} onClick={menu.open} aria-label="Open menu" />
          </div>
        )}

        <MobileMenuDrawer opened={menu.opened} onClose={menu.close} />
        <MobileCartDrawer />

        <div className="hidden lg:flex ml-5 flex-col gap-5 w-full md:flex md:flex-col md:gap-5 md:w-full">
          <div className="hidden lg:w-full lg:flex md:flex md:w-full ">
            <div className="hidden md:flex md:w-full lg:w-full lg:flex">
              <input
                type="search"
                placeholder="Search products here "
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="lg:w-[100%] h-[40px] rounded-full bg-white pl-3"
              />
              <button className="bg-lightgreen h-[40px] ml-[-30px] cursor-pointer rounded-3xl px-5 z-50">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M10 6.00077C8.93913 6.00077 7.92172 6.42219 7.17157 7.17234C6.42143 7.92248 6 8.9399 6 10.0008C6 11.0616 6.42143 12.079 7.17157 12.8292C7.92172 13.5793 8.93913 14.0008 10 14.0008C11.0609 14.0008 12.0783 13.5793 12.8284 12.8292C13.5786 12.079 14 11.0616 14 10.0008C14 8.9399 13.5786 7.92248 12.8284 7.17234C12.0783 6.42219 11.0609 6.00077 10 6.00077ZM4 10.0008C3.99988 9.05647 4.22264 8.12548 4.65017 7.28351C5.0777 6.44154 5.69792 5.71236 6.4604 5.15529C7.22287 4.59822 8.10606 4.22898 9.03815 4.0776C9.97023 3.92622 10.9249 3.99698 11.8245 4.28412C12.724 4.57126 13.5432 5.06667 14.2152 5.73006C14.8872 6.39346 15.3931 7.2061 15.6919 8.1019C15.9906 8.9977 16.0737 9.95136 15.9343 10.8853C15.795 11.8193 15.4372 12.7072 14.89 13.4768L19.707 18.2938C19.8892 18.4824 19.99 18.735 19.9877 18.9972C19.9854 19.2594 19.8802 19.5102 19.6948 19.6956C19.5094 19.881 19.2586 19.9862 18.9964 19.9884C18.7342 19.9907 18.4816 19.8899 18.293 19.7078L13.477 14.8918C12.5794 15.53 11.5233 15.9089 10.4247 15.9869C9.326 16.0648 8.22707 15.8389 7.2483 15.3337C6.26953 14.8286 5.44869 14.0638 4.87572 13.1231C4.30276 12.1824 3.99979 11.1022 4 10.0008Z"
                    fill="white"
                  />
                </svg>
              </button>
            </div>

            <div className="hidden md:flex md:w-full lg:w-full lg:flex ">
              <div className="hidden lg:w-[100%] lg:flex lg:justify-around lg:items-center ">
                <div className="flex cursor-pointer" onClick={() => handleNavigation("orders")}>
                  <span className="ml-2 text-[#252C32]"> Orders </span>
                </div>
                <div className="flex cursor-pointer" onClick={() => handleNavigation("category?name=Brassiere")}>
                  <span className="ml-2 text-[#252C32] "> Favorites </span>
                </div>
                <div className="relative flex cursor-pointer" onClick={() => { fetchCartCount(); dispatch(openCart()); }}>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#8BB06E] text-white text-[10px] px-1.5 py-[2px] rounded-full">
                      {cartCount}
                    </span>
                  )}
                  <span className="ml-2 text-[#252C32]">Cart</span>
                </div>

                {isAuthenticated ? (
                  <div onClick={() => handleNavigation("account")}>
                    <IconUserFilled />
                  </div>
                ) : (
                  <button
                    className="bg-lightgreen h-[40px] cursor-pointer text-[#fff] ml-[-30px] rounded-3xl px-5 z-50"
                    onClick={() => handleNavigation("account")}
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="hidden md:flex gap-5 w-full">
            <ul className="flex justify-center gap-10">
              {/* Render dynamic categories here */}
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <li
                    key={cat._id}
                    className={`text-sm cursor-pointer ${isSelected(cat._id)}`}
                    onClick={() => handleNavigation(`category?name=${cat.categoryTitle}`)}
                  >
                    {cat.categoryTitle}
                  </li>
                ))
              ) : (
                // fallback while loading or if no categories
                <>
                  loading
                </>
              )}
            </ul>
          </div>
        </div>
      </header>

      {searchTerm && (
        <div className="absolute top-[80px] md:top-[112px] left-0 w-screen h-[200px] bg-white shadow-lg z-40 p-4 overflow-y-auto">
          <p className="font-semibold mb-2">Search results for "{searchTerm}"</p>
          <ul className="space-y-2">
            <li className="cursor-pointer hover:text-green-600">Result 1</li>
            <li className="cursor-pointer hover:text-green-600">Result 2</li>
            <li className="cursor-pointer hover:text-green-600">Result 3</li>
          </ul>
        </div>
      )}
    </>
  );
}