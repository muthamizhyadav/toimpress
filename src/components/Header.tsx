import { Burger } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { MobileMenuDrawer, UseMobileMenuDrawer } from "./MobileMenuDrawer";
import { MobileCartDrawer, UseMobileCartDrawer } from "./MobileCartDrawer";

export default function Header() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedId = searchParams.get("id");

  const isSelected = (id: string) =>
    selectedId === id ? "font-bold underline text-[#122F15]" : "text-[#252C32]";

  const handleNavigation = (str?: string) => {
    navigate(`/${str}`);
    close(); // close drawer after navigation
  };

  const isMobile = useMediaQuery("(max-width: 640px)");

  const menu = UseMobileMenuDrawer();
  const cart = UseMobileCartDrawer();

  const [cartCount, setCartCount] = useState(0);

  const updateCartCount = () => {
    const cartData = JSON.parse(localStorage.getItem("cart") || "[]");
    const total = cartData.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
    setCartCount(total);
  };

  useEffect(() => {
    updateCartCount();
    window.addEventListener("storage", updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
    };
  }, []);

  useEffect(() => {
    if (!cart.opened) {
      updateCartCount();
    }
  }, [cart.opened]);

  return (
    <header className="bg-sandle w-full h-[80px] md:h-[112px] flex items-center px-10 sm:px-12 md:px-14 lg:px-14">
      <img
        src="/logo.png"
        alt="Logo"
        className="md:w-[106px] md:h-[65px] w-[80px] h-[50px] cursor-pointer"
        onClick={() => handleNavigation("")}
      />

      {isMobile && (
        <div className="ml-auto flex items-center">
          {/* Cart Icon with Badge */}
          <div className="relative mr-4 cursor-pointer" onClick={cart.open}>
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

          {/* Burger */}
          <Burger opened={menu.opened} onClick={menu.open} aria-label="Open menu" />
        </div>
      )}

      {/* Mobile Drawers */}
      <MobileMenuDrawer opened={menu.opened} onClose={menu.close} />
      <MobileCartDrawer opened={cart.opened} onClose={cart.close} />

      <div className="hidden lg:flex ml-5 flex-col gap-5 w-full md:flex md:flex-col md:gap-5 md:w-full">
        <div className="hidden lg:w-full lg:flex md:flex md:w-full ">
          <div className="hidden  md:flex md:w-full lg:w-full lg:flex  ">
            <input
              type="search"
              placeholder="Search"
              className="lg:w-[100%]  h-[40px] rounded-full bg-white pl-3"
            />
            <button className="bg-lightgreen h-[40px]  ml-[-30px] cursor-pointer rounded-3xl px-5 z-50">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M10 6.00077C8.93913 6.00077 7.92172 6.42219 7.17157 7.17234C6.42143 7.92248 6 8.9399 6 10.0008C6 11.0616 6.42143 12.079 7.17157 12.8292C7.92172 13.5793 8.93913 14.0008 10 14.0008C11.0609 14.0008 12.0783 13.5793 12.8284 12.8292C13.5786 12.079 14 11.0616 14 10.0008C14 8.9399 13.5786 7.92248 12.8284 7.17234C12.0783 6.42219 11.0609 6.00077 10 6.00077ZM4 10.0008C3.99988 9.05647 4.22264 8.12548 4.65017 7.28351C5.0777 6.44154 5.69792 5.71236 6.4604 5.15529C7.22287 4.59822 8.10606 4.22898 9.03815 4.0776C9.97023 3.92622 10.9249 3.99698 11.8245 4.28412C12.724 4.57126 13.5432 5.06667 14.2152 5.73006C14.8872 6.39346 15.3931 7.2061 15.6919 8.1019C15.9906 8.9977 16.0737 9.95136 15.9343 10.8853C15.795 11.8193 15.4372 12.7072 14.89 13.4768L19.707 18.2938C19.8892 18.4824 19.99 18.735 19.9877 18.9972C19.9854 19.2594 19.8802 19.5102 19.6948 19.6956C19.5094 19.881 19.2586 19.9862 18.9964 19.9884C18.7342 19.9907 18.4816 19.8899 18.293 19.7078L13.477 14.8918C12.5794 15.53 11.5233 15.9089 10.4247 15.9869C9.326 16.0648 8.22707 15.8389 7.2483 15.3337C6.26953 14.8286 5.44869 14.0638 4.87572 13.1231C4.30276 12.1824 3.99979 11.1022 4 10.0008Z"
                  fill="white"
                />
              </svg>
            </button>
          </div>
          <div className="hidden  md:flex md:w-full lg:w-full lg:flex ">
            <div className=" hidden lg:w-[100%] lg:flex lg:justify-around lg:items-center ">
              <div
                className="flex cursor-pointer "
                onClick={() => handleNavigation("orders")}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13 19C13.0001 19.1704 13.0437 19.3379 13.1267 19.4867C13.2098 19.6355 13.3294 19.7607 13.4744 19.8502C13.6194 19.9398 13.7848 19.9908 13.955 19.9985C14.1252 20.0061 14.2946 19.9702 14.447 19.894L18.447 17.894C18.6131 17.811 18.7528 17.6834 18.8504 17.5255C18.9481 17.3676 18.9999 17.1857 19 17V11.236C18.9999 11.0656 18.9563 10.8981 18.8733 10.7493C18.7902 10.6005 18.6706 10.4754 18.5256 10.3858C18.3806 10.2963 18.2152 10.2452 18.045 10.2376C17.8748 10.2299 17.7054 10.2659 17.553 10.342L13.553 12.342C13.3869 12.425 13.2472 12.5526 13.1496 12.7105C13.0519 12.8684 13.0001 13.0504 13 13.236V19ZM17.211 8.27602C17.3769 8.19288 17.5164 8.06523 17.6138 7.90734C17.7113 7.74946 17.7629 7.56756 17.7629 7.38202C17.7629 7.19647 17.7113 7.01457 17.6138 6.85669C17.5164 6.69881 17.3769 6.57115 17.211 6.48802L12.447 4.10602C12.3082 4.03666 12.1552 4.00055 12 4.00055C11.8448 4.00055 11.6918 4.03666 11.553 4.10602L6.789 6.48802C6.62312 6.57115 6.48364 6.69881 6.38617 6.85669C6.28869 7.01457 6.23707 7.19647 6.23707 7.38202C6.23707 7.56756 6.28869 7.74946 6.38617 7.90734C6.48364 8.06523 6.62312 8.19288 6.789 8.27602L11.553 10.658C11.6918 10.7274 11.8448 10.7635 12 10.7635C12.1552 10.7635 12.3082 10.7274 12.447 10.658L17.211 8.27602ZM6.447 10.342C6.29458 10.2659 6.12522 10.2299 5.95501 10.2376C5.78479 10.2452 5.61935 10.2963 5.47439 10.3858C5.32944 10.4754 5.20977 10.6005 5.12674 10.7493C5.04372 10.8981 5.00009 11.0656 5 11.236V17C5.0001 17.1857 5.05188 17.3676 5.14955 17.5255C5.24722 17.6834 5.38692 17.811 5.553 17.894L9.553 19.894C9.70542 19.9702 9.87477 20.0061 10.045 19.9985C10.2152 19.9908 10.3806 19.9398 10.5256 19.8502C10.6706 19.7607 10.7902 19.6355 10.8733 19.4867C10.9563 19.3379 10.9999 19.1704 11 19V13.236C10.9999 13.0504 10.9481 12.8684 10.8504 12.7105C10.7528 12.5526 10.6131 12.425 10.447 12.342L6.447 10.342Z"
                    fill="#122F15"
                  />
                </svg>
                <span className="ml-2 text-[#252C32]"> Orders </span>
              </div>
              <div className="flex cursor-pointer" onClick={() => handleNavigation("category?id=1")} >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M5.17115 6.22115C5.92126 5.47127 6.93849 5.05001 7.99915 5.05001C9.0598 5.05001 10.077 5.47127 10.8271 6.22115L11.9991 7.39215L13.1711 6.22115C13.5401 5.83911 13.9815 5.53438 14.4695 5.32475C14.9575 5.11511 15.4824 5.00477 16.0135 5.00015C16.5447 4.99554 17.0714 5.09674 17.563 5.29787C18.0545 5.49899 18.5012 5.796 18.8767 6.17157C19.2523 6.54714 19.5493 6.99375 19.7504 7.48534C19.9516 7.97692 20.0528 8.50364 20.0481 9.03476C20.0435 9.56588 19.9332 10.0908 19.7236 10.5788C19.5139 11.0668 19.2092 11.5082 18.8271 11.8772L11.9991 18.7062L5.17115 11.8772C4.42126 11.127 4 10.1098 4 9.04915C4 7.9885 4.42126 6.97126 5.17115 6.22115Z"
                    fill="#122F15"
                  />
                </svg>

                <span className="ml-2 text-[#252C32] "> Favorites </span>
              </div>
              <div className="relative flex cursor-pointer" onClick={cart.open}>

                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 3C4.73478 3 4.48043 3.10536 4.29289 3.29289C4.10536 3.48043 4 3.73478 4 4C4 4.26522 4.10536 4.51957 4.29289 4.70711C4.48043 4.89464 4.73478 5 5 5H6.22L6.525 6.222C6.52803 6.23607 6.53136 6.25007 6.535 6.264L7.893 11.694L7 12.586C5.74 13.846 6.632 16 8.414 16H17C17.2652 16 17.5196 15.8946 17.7071 15.7071C17.8946 15.5196 18 15.2652 18 15C18 14.7348 17.8946 14.4804 17.7071 14.2929C17.5196 14.1054 17.2652 14 17 14H8.414L9.414 13H16C16.1857 12.9999 16.3676 12.9481 16.5255 12.8504C16.6834 12.7528 16.811 12.6131 16.894 12.447L19.894 6.447C19.9702 6.29458 20.0061 6.12522 19.9985 5.95501C19.9908 5.78479 19.9398 5.61935 19.8502 5.47439C19.7606 5.32944 19.6355 5.20977 19.4867 5.12674C19.3379 5.04372 19.1704 5.00009 19 5H8.28L7.97 3.757C7.91583 3.54075 7.79095 3.34881 7.61521 3.21166C7.43946 3.0745 7.22293 3.00001 7 3H5ZM18 18.5C18 18.8978 17.842 19.2794 17.5607 19.5607C17.2794 19.842 16.8978 20 16.5 20C16.1022 20 15.7206 19.842 15.4393 19.5607C15.158 19.2794 15 18.8978 15 18.5C15 18.1022 15.158 17.7206 15.4393 17.4393C15.7206 17.158 16.1022 17 16.5 17C16.8978 17 17.2794 17.158 17.5607 17.4393C17.842 17.7206 18 18.1022 18 18.5ZM8.5 20C8.89782 20 9.27936 19.842 9.56066 19.5607C9.84196 19.2794 10 18.8978 10 18.5C10 18.1022 9.84196 17.7206 9.56066 17.4393C9.27936 17.158 8.89782 17 8.5 17C8.10218 17 7.72064 17.158 7.43934 17.4393C7.15804 17.7206 7 18.1022 7 18.5C7 18.8978 7.15804 19.2794 7.43934 19.5607C7.72064 19.842 8.10218 20 8.5 20Z"
                    fill="#122F15"
                  />
                              </svg>
                            {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#8BB06E] text-white text-[10px] px-1.5 py-[2px] rounded-full">
                    {cartCount}
                  </span>
                )}
                <span className="ml-2 text-[#252C32]">Cart</span>
              </div>
              <button className="bg-lightgreen h-[40px] cursor-pointer text-[#fff]  ml-[-30px] rounded-3xl px-5 z-50"  onClick={() => handleNavigation("account")}  >
                Sign In
              </button>
            </div>
          </div>
        </div>

        <div className="hidden md:flex gap-5 w-full">
          <ul className="flex justify-center w-[50%] gap-10">
            <li
              className={`text-sm cursor-pointer ${isSelected("1")}`}
              onClick={() => handleNavigation("category?id=1")}
            >
              Brassiere
            </li>
            <li
              className={`text-sm cursor-pointer ${isSelected("2")}`}
              onClick={() => handleNavigation("category?id=2")}
            >
              Panties
            </li>
            <li
              className={`text-sm cursor-pointer ${isSelected("3")}`}
              onClick={() => handleNavigation("category?id=3")}
            >
              Shimmer Leggings
            </li>
            <li
              className={`text-sm cursor-pointer ${isSelected("4")}`}
              onClick={() => handleNavigation("category?id=4")}
            >
              New Arrivals
            </li>
            <li
              className={`text-sm cursor-pointer ${isSelected("5")}`}
              onClick={() => handleNavigation("category?id=5")}
            >
              Offers Zone
            </li>
            <li
              className={`text-sm cursor-pointer ${isSelected("6")}`}
              onClick={() => handleNavigation("category?id=6")}
            >
              Combo Offer
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
