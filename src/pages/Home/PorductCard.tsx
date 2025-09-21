// components/ProductCard.tsx
import { useMediaQuery } from "@mantine/hooks";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SizeSelectorDrawer from "../../components/SizeSelectorDrawer";
import { showNotification } from "@mantine/notifications";
import { IconCheck, IconX, IconInfoCircle } from "@tabler/icons-react";
import { API_CART, API_GET_UPDATE } from "../../api/api";
import axiosInstance from "../../api/axiosInstance";

// Colour tokens
const DARK_GREEN = "#133215";
const LIGHT_GREEN = "#92B775";

interface PromoInfo {
  threshold: number;
  discountPercent: number;
  applied?: boolean;
}

interface ProductCardProps {
  id: string | number;
  imageUrl: string;
  productName: string;
  price: number;
  category?: string | number;
  originalPrice: number;
  rating: number;
  isNew?: boolean;
  isOnSale?: boolean;
  sizeOptions?: Parameters<typeof SizeSelectorDrawer>[0]["options"];
  selectedColor?: string;
  promo?: PromoInfo | null;
}

const PANTY_SIZES = [
  { label: "XS", hip: "75–82 cm" },
  { label: "S", hip: "83–89 cm" },
  { label: "M", hip: "90–97 cm" },
  { label: "L", hip: "98–104 cm" },
  { label: "XL", hip: "105–112 cm" },
  { label: "2XL", hip: "113–119 cm" },
  { label: "3XL", hip: "120–127 cm" },
  { label: "4XL", hip: "128–134 cm" },
  { label: "5XL", hip: "135–142 cm" },
  { label: "6XL", hip: "143–149 cm" },
];

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  imageUrl,
  productName,
  price,
  originalPrice,
  rating,
  category,
  isNew = false,
  isOnSale = false,
  sizeOptions,
  selectedColor,
  promo = null,
}) => {
  const isMobile = useMediaQuery("(max-width: 600px)");
  const navigate = useNavigate();

  // aggregated product-level quantity (local best-effort)
  const [qty, setQty] = useState<number>(0);
  const [openSizeDrawer, setOpenSizeDrawer] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lastSize, setLastSize] = useState<string | undefined>(undefined);

  const handleNavigation = () => navigate(`/product/?id=${id}`);

  // derive qty from response payload if possible
  const deriveQtyFromResponse = (respData: any) => {
    try {
      const payload = respData?.data ?? respData ?? {};
      const thisId = String(id);

      // if response returns items array
      if (Array.isArray(payload.items)) {
        const totalForThis =
          payload.items
            .filter((it: any) => String(it.product ?? it.productId ?? it.product) === thisId)
            .reduce((s: number, it: any) => s + Number(it.quantity ?? it.qty ?? it.itemqty ?? 0), 0) || 0;
        setQty(totalForThis);
        return true;
      }

      // some APIs return single item update info
      if ((typeof payload.itemqty !== "undefined" || typeof payload.quantity !== "undefined") && payload.product) {
        if (String(payload.product) === thisId) {
          setQty(Number(payload.itemqty ?? payload.quantity ?? 0));
          return true;
        }
      }

      // nested shapes
      if (payload.data && Array.isArray(payload.data.items)) {
        const totalForThis =
          payload.data.items
            .filter((it: any) => String(it.product ?? it.productId) === thisId)
            .reduce((s: number, it: any) => s + Number(it.quantity ?? it.qty ?? it.itemqty ?? 0), 0) || 0;
        setQty(totalForThis);
        return true;
      }

      if (payload.data && typeof payload.data.itemqty !== "undefined" && payload.data.product) {
        if (String(payload.data.product) === thisId) {
          setQty(Number(payload.data.itemqty || 0));
          return true;
        }
      }

      return false;
    } catch (e) {
      console.warn("deriveQtyFromResponse failure", e);
      return false;
    }
  };

  // central POST helper
  const postCartQuantity = async (newQuantity: number, selectedSize?: string) => {
    const body = {
      productId: String(id),
      quantity: newQuantity,
      selectedColor: selectedColor ?? undefined,
      selectedSize: selectedSize ?? lastSize,
    };
    const resp = await axiosInstance.post(API_CART, body, {
      headers: { "Content-Type": "application/json" },
    });
    return resp;
  };

  // handle confirm from drawer (initial add)
  const handleConfirmSize = async (sel: { band: number; cup: string; label: string }) => {
    const chosen = sel.label;
    try {
      setSubmitting(true);
      const response = await postCartQuantity(1, chosen);

      if (response?.status === 200) {
        setLastSize(chosen);

        // best-effort update qty from API response
        const derived = deriveQtyFromResponse(response.data);
        if (!derived) {
          // fallback: increment local qty by 1
          setQty((q) => q + 1);
        }

        // notify header to re-fetch authoritative count
        window.dispatchEvent(new Event("cart:updated"));

        showNotification({
          title: "Added to cart",
          message: response.data?.message ?? "Item added to cart successfully",
          color: "green",
          icon: <IconCheck size={18} />,
          autoClose: 2500,
        });
      } else {
        showNotification({
          title: "Add failed",
          message: "Unable to add item. Try again.",
          color: "red",
          icon: <IconX size={18} />,
        });
      }
    } catch (err: any) {
      const apiMessage = err?.response?.data?.message ?? err?.message ?? "Unable to add item.";
      showNotification({
        title: "Add failed",
        message: apiMessage,
        color: "red",
        icon: <IconX size={18} />,
        autoClose: 4000,
      });
      console.error("Add to cart error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // + handler
  const handleAddMore = async () => {
    if (!lastSize) {
      setOpenSizeDrawer(true);
      return;
    }

    try {
      setSubmitting(true);
      const nextQty = qty + 1;
      const response = await postCartQuantity(nextQty, lastSize);

      if (response?.status === 200) {
        const derived = deriveQtyFromResponse(response.data);
        if (!derived) {
          setQty(nextQty);
        }
        window.dispatchEvent(new Event("cart:updated"));
        showNotification({
          title: "Cart updated",
          message: response.data?.message ?? `Quantity updated to ${nextQty}`,
          color: "green",
          icon: <IconCheck size={18} />,
        });
      } else {
        showNotification({
          title: "Update failed",
          message: "Unable to update quantity.",
          color: "red",
          icon: <IconX size={18} />,
        });
      }
    } catch (err: any) {
      const apiMessage = err?.response?.data?.message ?? err?.message ?? "Unable to update cart.";
      showNotification({
        title: "Update failed",
        message: apiMessage,
        color: "red",
        icon: <IconX size={18} />,
      });
      console.error("Increment error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // - handler
  const handleDecrement = async () => {
    if (qty <= 0) return;
    if (!lastSize) {
      showNotification({
        title: "No variant selected",
        message: "Cannot decrement — no size selected.",
        color: "blue",
        icon: <IconInfoCircle size={18} />,
      });
      return;
    }

    try {
      setSubmitting(true);
      const nextQty = Math.max(0, qty - 1);
      const response = await postCartQuantity(nextQty, lastSize);

      if (response?.status === 200) {
        const derived = deriveQtyFromResponse(response.data);
        if (!derived) {
          setQty(nextQty);
        }
        window.dispatchEvent(new Event("cart:updated"));
        showNotification({
          title: "Cart updated",
          message: response.data?.message ?? `Quantity updated to ${nextQty}`,
          color: "green",
          icon: <IconCheck size={18} />,
        });
      } else {
        showNotification({
          title: "Update failed",
          message: "Unable to update quantity.",
          color: "red",
          icon: <IconX size={18} />,
        });
      }
    } catch (err: any) {
      const apiMessage = err?.response?.data?.message ?? err?.message ?? "Unable to update cart.";
      showNotification({
        title: "Update failed",
        message: apiMessage,
        color: "red",
        icon: <IconX size={18} />,
      });
      console.error("Decrement error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const addCtaDisabled = submitting;
  const showImagePromo = !!promo && !promo.applied;

  return (
    <div className="rounded-xl shadow p-2 bg-white flex flex-col w-full">
      <div
        className="relative w-full aspect-[4/4] overflow-hidden rounded-lg"
        onClick={handleNavigation}
      >
        <img src={imageUrl} alt={productName} className={`${isMobile ? "w-[250px]" : "w-full"} h-full object-cover`} />
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {isOnSale && <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">Sale!</span>}
          {isNew && <span className="bg-cyan-500 text-white text-xs px-2 py-0.5 rounded-full">New</span>}
        </div>

        {showImagePromo && (
          <div
            className="absolute right-2 bottom-2 z-20"
            style={{
              backgroundColor: "#f3fbf4",
              border: `1px solid ${LIGHT_GREEN}`,
              padding: "6px 8px",
              borderRadius: 8,
              boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
              maxWidth: "90%",
            }}
          >
            <div style={{ whiteSpace: "nowrap", display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ color: DARK_GREEN, fontWeight: 700, fontSize: 10 }}>
                Buy above ₹{promo?.threshold ?? 1499}
              </span>
              <span style={{ color: DARK_GREEN, fontWeight: 700, fontSize: 10 }}>
                get {promo?.discountPercent ?? 30}% off
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-1 px-1 flex flex-col justify-between flex-grow gap-1">
        <div>
          <p className="text-sm md:text-base line-clamp-2 font-medium">
            {productName}
            {lastSize && <span className="text-xs ml-2 text-gray-600">({lastSize})</span>}
          </p>
          <div className="flex mt-1 mb-1">
            <div className="flex items-center gap-1">
              <span className="text-black font-bold text-sm md:text-base">₹{price}</span>
              <span className="line-through text-gray-400 font-bold text-sm md:text-base">₹{originalPrice}</span>
              <span className="text-[#96BD75] font-bold !text-[12px]">
                (SAVE {Math.round(((originalPrice - price) / originalPrice) * 100)}%)
              </span>
            </div>
          </div>
        </div>

        <div>
          <button
            onClick={() => setOpenSizeDrawer(true)}
            disabled={addCtaDisabled}
            className={`w-full ${addCtaDisabled ? "opacity-60 cursor-not-allowed" : ""} bg-[#96BD75] text-white py-2 font-bold rounded-full flex justify-center items-center gap-2 shadow-sm mb-2`}
          >
            {submitting ? "Adding..." : "Add to cart"}
          </button>

          {/* Qty controls if qty > 0 */}
          {/* {qty > 0 && (
            <div className="flex items-center justify-between mt-2 gap-2">
              <button className="px-3 py-1 border rounded" onClick={handleDecrement} disabled={submitting}>-</button>
              <div>{qty} in cart</div>
              <button className="px-3 py-1 border rounded" onClick={handleAddMore} disabled={submitting}>+</button>
            </div>
          )} */}
        </div>
      </div>

      <SizeSelectorDrawer
        opened={openSizeDrawer}
        onClose={() => setOpenSizeDrawer(false)}
        onConfirm={handleConfirmSize}
        productTitle={productName}
        price={price}
        imageUrl={imageUrl}
        category={category}
        options={sizeOptions}
      />
    </div>
  );
};

export default ProductCard;