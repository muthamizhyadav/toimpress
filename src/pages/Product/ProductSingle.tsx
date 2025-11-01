// pages/Product/ProductPage.tsx
import {
  Container,
  Grid,
  Image,
  Text,
  Title,
  Button,
  Group,
  Badge,
  Tabs,
  SimpleGrid,
  Box,
  ThemeIcon,
  Stack,
  ActionIcon,
  Paper,
  Card,
  Divider,
  Drawer,
  ScrollArea,
  CloseButton,
} from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import {
  IconTruck,
  IconPackage,
  IconMinus,
  IconPlus,
  IconX,
  IconCheck,
} from "@tabler/icons-react";
import { useMediaQuery } from "@mantine/hooks";
import { useSearchParams, useNavigate } from "react-router-dom";
import { GET_PRODUCTS_DETAILS, API_CART } from "../../api/api";
import axiosInstance from "../../api/axiosInstance";
import { useDispatch, useSelector } from "react-redux";
import {
  addToCart,
  increaseQty,
  decreaseQty,
  removeFromCart,
} from "../../redux/features/cartSlice";
import type { RootState } from "../../redux/store";

import SizeSelectorDrawer, {
  type SizeOption,
} from "../../components/SizeSelectorDrawer";

import BraDescp1 from "../../assets/svg/bradescription/descp1.svg";
import BraDescp2 from "../../assets/svg/bradescription/descp2.svg";
import BraDescp3 from "../../assets/svg/bradescription/descp3.svg";
import BraDescp4 from "../../assets/svg/bradescription/descp4.svg";
import BraDescp5 from "../../assets/svg/bradescription/descp5.svg";
import BraDescp6 from "../../assets/svg/bradescription/descp6.svg";
import BraDescp7 from "../../assets/svg/bradescription/descp7.svg";
import BraDescp8 from "../../assets/svg/bradescription/descp8.svg";

import { showNotification } from "@mantine/notifications";

/* small data used in the description area */
const tags = [
  "Everyday",
  "Plus Size",
  "Non-Padded",
  "Wirefree",
  "Full Coverage",
  "Seamless",
  "Full Cup",
  "Detachable",
];
const description = [
  BraDescp1,
  BraDescp2,
  BraDescp3,
  BraDescp4,
  BraDescp5,
  BraDescp6,
  BraDescp7,
  BraDescp8,
];
const items = tags.map((tag, i) => ({ tag, image: description[i] }));

const DARK_GREEN = "#133215";
const LIGHT_GREEN = "#92B775";

export default function ProductPage() {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: cartItems } = useSelector((s: RootState) => s.cart);

  const productId = searchParams.get("id");

  const [mainImage, setMainImage] = useState<string>("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [productDetails, setProductDetails] = useState<any | null>(null);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [openSizeDrawer, setOpenSizeDrawer] = useState(false);
  const [dataWithColor, setDataWithColor] = useState<any[]>([null]);
  const [drawerProduct, setDrawerProduct] = useState<any | null>(null);
  const [coupon, setCoupon] = useState<any | null>(null);

  const [addingMap, setAddingMap] = useState<Record<string, boolean>>({});

  const [openReturnPolicy, setOpenReturnPolicy] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resp = await axiosInstance.get(
          `${GET_PRODUCTS_DETAILS}${productId}`
        );
        const detail = resp?.data?.product;
        const sims = resp?.data?.similerProducts || resp?.data?.similarProducts;
        const couponData = resp?.data?.coupon;
        setCoupon(couponData || null);

        setProductDetails(detail);
        setSimilarProducts(sims || []);

        let initialColor = detail?.selectedColors?.[0] ?? "";
        console.log("colorData:", detail?.colorData);
        setDataWithColor(detail?.colorData);
        if (
          !initialColor &&
          detail?.colorData &&
          typeof detail.colorData === "object"
        ) {
          const keys = Object.keys(detail.colorData);
          if (keys.length) initialColor = keys[0];
        }

        const initialSize = detail?.selectedSizes?.[0] ?? "";
        const fallbackImages: string[] = Array.isArray(detail?.images)
          ? detail.images
          : [];

        let initialImgs: string[] = [];
        if (
          initialColor &&
          detail?.colorData &&
          detail.colorData[initialColor]
        ) {
          const cd = detail.colorData[initialColor];
          if (Array.isArray(cd.images) && cd.images.length) {
            initialImgs = cd.images;
          } else if (typeof cd.image === "string") {
            initialImgs = [cd.image];
          }
        }

        const imgsArr = initialImgs.length ? initialImgs : fallbackImages;

        console.log("Initial color:", initialColor, "Images:", imgsArr);

        setGalleryImages(imgsArr);
        setMainImage(imgsArr[0] || "");
        setSelectedColor(initialColor);
        setSelectedSize(initialSize);
      } catch (err) {
        console.error("Error fetching product:", err);
      }
    };
    if (productId) fetchData();
  }, [productId]);

  const isProductEligibleForCoupon = useMemo(() => {
    if (!coupon?.isActive || !productId) return false;

    return (
      coupon.products?.includes(productId) ||
      coupon.category === productDetails?.category
    );
  }, [coupon, productId, productDetails?.category]);

  const getAllColorImages = useMemo(() => {
    if (!productDetails?.colorData) return [];

    const allImages: string[] = [];
    const colorData = productDetails.colorData;

    Object.keys(colorData).forEach((color) => {
      const colorInfo = colorData[color];
      if (Array.isArray(colorInfo.images)) {
        colorInfo.images.forEach((img: string) => {
          if (!allImages.includes(img)) {
            allImages.push(img);
          }
        });
      } else if (
        typeof colorInfo.image === "string" &&
        !allImages.includes(colorInfo.image)
      ) {
        allImages.push(colorInfo.image);
      }
    });

    return allImages;
  }, [productDetails?.colorData]);

  const getImagesForSelectedColor = useMemo(() => {
    if (!selectedColor || !productDetails?.colorData) {
      return galleryImages.length
        ? galleryImages
        : productDetails?.images || [];
    }

    const colorInfo = productDetails.colorData[selectedColor];
    if (!colorInfo) return productDetails?.images || [];
    console.log("Color info for", selectedColor, ":", colorInfo);

    if (Array.isArray(colorInfo.images) && colorInfo.images.length) {
      return colorInfo.images;
    } else if (typeof colorInfo.image === "string") {
      return [colorInfo.image];
    }

    return productDetails?.images || [];
  }, [selectedColor, productDetails, galleryImages]);

  useEffect(() => {
    const newImages = getImagesForSelectedColor;
    setGalleryImages(newImages);
    if (newImages.length > 0 && !newImages.includes(mainImage)) {
      setMainImage(newImages[0]);
    }
  }, [getImagesForSelectedColor]);

  const colorDataMap: Record<string, any> | undefined =
    productDetails?.colorData;
  const colorsInput: string[] = colorDataMap
    ? Object.keys(colorDataMap)
    : productDetails?.selectedColors ?? [];
  const sizesInput: string[] = productDetails?.selectedSizes ?? [];
  const imagesInput: string[] = productDetails?.images ?? [];
  const priceInput: number | undefined = productDetails?.price;
  const salePriceInput: number | undefined = productDetails?.salePrice;
  const titleInput: string = productDetails?.productTitle ?? "";
  const descInput: string = productDetails?.productDescription ?? "";

  const sizeOptions: SizeOption[] = useMemo(() => {
    const map = new Map<number, Set<string>>();

    for (const s of sizesInput) {
      if (!s && s !== 0) continue;
      const raw = String(s).toUpperCase().trim();

      const m = /^(\d{2})([A-Z]+)$/.exec(raw);
      if (m) {
        const band = Number(m[1]);
        const cup = m[2];
        if (!map.has(band)) map.set(band, new Set());
        map.get(band)!.add(cup);
        continue;
      }

      const numericOnly = /^(\d{2,3})$/.exec(raw);
      if (numericOnly) {
        if (!map.has(0)) map.set(0, new Set());
        map.get(0)!.add(numericOnly[1]);
        continue;
      }

      if (/^[A-Z]{1,3}$/.test(raw)) {
        if (!map.has(0)) map.set(0, new Set());
        map.get(0)!.add(raw);
        continue;
      }

      if (!map.has(0)) map.set(0, new Set());
      map.get(0)!.add(raw);
    }

    return Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([band, cupsSet]) => ({
        band,
        cups: Array.from(cupsSet.values()).sort((a, b) => {
          const na = /^\d+$/.test(a) ? Number(a) : Number.MAX_SAFE_INTEGER;
          const nb = /^\d+$/.test(b) ? Number(b) : Number.MAX_SAFE_INTEGER;
          if (na !== nb) return na - nb;
          return a.localeCompare(b);
        }),
      }));
  }, [sizesInput]);

  const getSizesForColor = (
    color: string,
    prod: any = productDetails
  ): string[] => {
    const sizesFlat: string[] = prod?.selectedSizes ?? [];
    if (!color) return sizesFlat;

    if (prod?.colorData && typeof prod.colorData === "object") {
      const entry =
        prod.colorData[color] ??
        prod.colorData[color?.toLowerCase?.()] ??
        prod.colorData[color?.toUpperCase?.()];
      if (entry && Array.isArray(entry.sizes) && entry.sizes.length)
        return entry.sizes;
    }

    const mapCandidate =
      prod?.sizeByColor ??
      prod?.sizesByColor ??
      prod?.colorSizeMap ??
      prod?.colorData ??
      null;

    if (
      mapCandidate &&
      typeof mapCandidate === "object" &&
      !Array.isArray(mapCandidate)
    ) {
      const sizes =
        mapCandidate[color] ??
        mapCandidate[color?.toLowerCase?.()] ??
        mapCandidate[color?.toUpperCase?.()];
      if (Array.isArray(sizes) && sizes.length) return sizes;
    }

    if (Array.isArray(mapCandidate)) {
      const found = (mapCandidate as any[]).find(
        (m) => String(m.color).toLowerCase() === String(color).toLowerCase()
      );
      if (found) {
        const xs = found.sizes ?? found.selectedSizes ?? found.availableSizes;
        if (Array.isArray(xs)) return xs;
      }
    }

    if (Array.isArray(prod?.colors)) {
      const c = prod?.colors.find(
        (c: any) => String(c.name).toLowerCase() === String(color).toLowerCase()
      );
      if (c && Array.isArray(c.sizes)) return c.sizes;
    }

    return sizesFlat;
  };

  const availableSizesForSelectedColor = getSizesForColor(
    selectedColor,
    productDetails
  );
  const availableSizesSet = useMemo(
    () =>
      new Set(
        (availableSizesForSelectedColor || []).map((s: string) =>
          String(s).toUpperCase()
        )
      ),
    [availableSizesForSelectedColor]
  );

  if (!productDetails) return null;

  const discount =
    priceInput && salePriceInput
      ? Math.round(((priceInput - salePriceInput) / priceInput) * 100)
      : 0;

  const currentCartItem = cartItems?.find(
    (it: any) =>
      String(it.id) === String(productId) &&
      (it.size ?? "") === (selectedSize || "") &&
      (it.color ?? "") === (selectedColor || "")
  );
  const currentQty: number = currentCartItem?.qty ?? 0;

  const requiresSize = sizeOptions.length > 0;
  const requiresColor = colorDataMap
    ? Object.keys(colorDataMap).length > 0
    : (productDetails?.selectedColors ?? []).length > 0;

  const makeCartPayload = (sizeLabel?: string, qty = 1) => ({
    productId: productId as string,
    quantity: qty,
    selectedSize: requiresSize ? sizeLabel ?? selectedSize : undefined,
    selectedColor: requiresColor ? selectedColor : undefined,
  });

  const setAdding = (key: string, v: boolean) => {
    setAddingMap((prev) => {
      if (prev[key] === v) return prev;
      return { ...prev, [key]: v };
    });
  };

  const getExistingQtyForVariant = (
    pid: string | number,
    size?: string | undefined,
    color?: string | undefined
  ) => {
    if (!pid) return 0;
    const found = cartItems.find((it: any) => {
      const sameId =
        String(it.id) === String(pid) ||
        String(it.productId ?? "") === String(pid);
      const sameSize = (it.size ?? "") === (size ?? "");
      const sameColor = (it.color ?? "") === (color ?? "");
      return sameId && sameSize && sameColor;
    });
    return Number(found?.qty ?? 0);
  };

  const addToCartApi = async (
    payload: {
      productId: string;
      quantity: number;
      selectedSize?: string;
      selectedColor?: string;
    },
    reduxPayload?: any,
    mapKey = "current"
  ) => {
    try {
      setAdding(mapKey, true);

      const body = {
        productId: String(payload.productId),
        quantity: payload.quantity,
        selectedSize: payload.selectedSize,
        selectedColor: payload.selectedColor,
      };

      const resp = await axiosInstance.post(API_CART, body, {
        headers: { "Content-Type": "application/json" },
      });

      if (resp?.status === 200 || resp?.status === 201) {
        const reduxItem = reduxPayload ?? {
          id: payload.productId,
          productId: payload.productId,
          imageUrl: mainImage || galleryImages?.[0] || imagesInput?.[0] || "",
          title: titleInput,
          productName: titleInput,
          price: salePriceInput ?? priceInput,
          originalPrice: priceInput,
          rating: 0,
          qty: payload.quantity,
          size: payload.selectedSize,
          color: payload.selectedColor,
          silent: true,
        };

        dispatch(addToCart(reduxItem));

        showNotification({
          title: "Added to cart",
          message: "Item added to cart",
          color: "green",
          icon: <IconCheck size={16} />,
        });
      } else {
        showNotification({
          title: "Unable to add",
          message: resp?.data?.message ?? "Try again",
          color: "red",
          icon: <IconX size={16} />,
        });
      }
    } catch (err: any) {
      console.error("Add to cart API error:", err);

      const status = err?.response?.status;
      const apiMessage =
        err?.response?.data?.message ?? err?.message ?? "Unable to add to cart";

      if (status === 401 || status === 403) {
        showNotification({
          title: "Please login",
          message: "You need to login to add items to cart.",
          color: "blue",
          icon: <IconX size={16} />,
          autoClose: 3000,
        });
        navigate("/account");
      } else {
        showNotification({
          title: "Add failed",
          message: apiMessage,
          color: "red",
          icon: <IconX size={16} />,
        });
      }
    } finally {
      setAdding(mapKey, false);
    }
  };

  const updateLineQuantity = async (
    pid: string | number,
    newQuantity: number,
    size?: string | undefined,
    color?: string | undefined,
    mapKey = String(pid)
  ) => {
    try {
      setAdding(mapKey, true);

      const body = {
        productId: String(pid),
        quantity: newQuantity,
        selectedSize: size,
        selectedColor: color,
      };

      const resp = await axiosInstance.post(API_CART, body, {
        headers: { "Content-Type": "application/json" },
      });

      if (resp?.status === 200 || resp?.status === 201) {
        // success - update redux to match server: remove existing variant and re-add with exact qty (or remove)
        try {
          // remove existing variant if any
          dispatch(
            removeFromCart({
              id: String(pid),
              size,
              color,
              silent: true,
            })
          );
        } catch (e) {
          // ignore
        }

        if (newQuantity > 0) {
          // Build redux item. For similar products we may not have mainImage - it's best-effort.
          const reduxItem = {
            id: String(pid),
            productId: String(pid),
            imageUrl: mainImage || galleryImages?.[0] || imagesInput?.[0] || "",
            title: titleInput,
            productName: titleInput,
            price: salePriceInput ?? priceInput,
            originalPrice: priceInput,
            rating: 0,
            qty: newQuantity,
            size,
            color,
            silent: true,
          };
          dispatch(addToCart(reduxItem));
        }

        showNotification({
          title: newQuantity === 0 ? "Removed" : "Quantity updated",
          message:
            resp.data?.message ??
            (newQuantity === 0 ? "Item removed" : `Quantity: ${newQuantity}`),
          color: "green",
          icon: <IconCheck size={16} />,
        });
      } else {
        showNotification({
          title: "Update failed",
          message: resp?.data?.message ?? "Unable to update cart",
          color: "red",
          icon: <IconX size={16} />,
        });
      }
    } catch (err: any) {
      console.error("Update line failed", err);
      showNotification({
        title: "Update failed",
        message:
          err?.response?.data?.message ??
          err?.message ??
          "Unable to update cart",
        color: "red",
        icon: <IconX size={16} />,
      });
    } finally {
      setAdding(mapKey, false);
    }
  };

  const handleAddToCart = () => {
    if (requiresSize && !selectedSize) {
      showNotification({
        title: "Select size",
        message: "Please select a size before adding to cart",
        color: "yellow",
        icon: <IconX size={14} />,
      });
      return;
    }

    const payload = makeCartPayload(selectedSize, 1);

    if ((window as any).fbq) {
      (window as any).fbq("track", "AddToCart", {
        content_name: productDetails?.productTitle || "Unknown Product",
        content_ids: [productDetails?._id],
        content_type: "product",
        value: productDetails?.salePrice || 0,
        currency: "INR",
      });
    }

    addToCartApi(payload, undefined, "current");
  };

  const handleBuyNow = async () => {
    if (requiresSize && !selectedSize) {
      showNotification({
        title: "Select size",
        message: "Please select a size before proceeding",
        color: "yellow",
        icon: <IconX size={14} />,
      });
      return;
    }
    const payload = makeCartPayload(selectedSize, 1);
    await addToCartApi(payload, undefined, "current");
    navigate("/checkout");
  };

  const onColorSelect = (color: string) => {
    setSelectedColor(color);
    console.log("Color selected:", color);

    if (productDetails?.colorData && productDetails.colorData[color]) {
      const sizesForColor = productDetails.colorData[color].sizes || [];
      if (sizesForColor.length > 0) {
        if (!selectedSize || !sizesForColor.includes(selectedSize)) {
          setSelectedSize(sizesForColor[0]);
        }
      } else {
        setSelectedSize("");
      }
    }

    if (productDetails?.colorData && productDetails.colorData[color]) {
      const colorInfo = productDetails.colorData[color];
      let newImages: string[] = [];

      if (Array.isArray(colorInfo.images) && colorInfo.images.length) {
        newImages = colorInfo.images;
      } else if (typeof colorInfo.image === "string") {
        newImages = [colorInfo.image];
      } else {
        newImages = productDetails.images || [];
      }

      setGalleryImages(newImages);
      if (newImages.length > 0) {
        setMainImage(newImages[0]);
      }
    }
  };

  function findColorByImageUrl(data: any, imageUrl: string) {
    for (const [colorCode, colorData] of Object.entries(data)) {
      // @ts-ignore
      if (colorData.images.includes(imageUrl)) {
        return {
          colorCode,
          // @ts-ignore
          ...colorData,
        };
      }
    }
    return null;
  }

  const onColorSelectByImage = (img: string) => {
    const colorData = findColorByImageUrl(dataWithColor, img);
    if (colorData) {
      setSelectedColor(colorData.colorCode);
      return colorData;
    } else {
      return null;
    }
  };

  const onSizeSelect = (sizeLabel: string) => {
    setSelectedSize(sizeLabel);

    // const sizeIndex = sizesInput.findIndex(
    //   (s) => String(s).toUpperCase() === String(sizeLabel).toUpperCase()
    // );
    // if (sizeIndex >= 0 && galleryImages && galleryImages[sizeIndex]) {
    //   const newGallery = [...galleryImages];
    //   if (sizeIndex !== 0) {
    //     const [selImg] = newGallery.splice(sizeIndex, 1);
    //     newGallery.unshift(selImg);
    //   }
    //   setGalleryImages(newGallery);
    //   setMainImage(newGallery[0] || "");
    //   return;
    // }

    // // Try to lookup size-specific images in common shapes: imagesBySize, sizeImages, variants with size
    // const key = String(sizeLabel).toLowerCase();
    // let foundImgs: string[] | undefined = undefined;

    // const tryMap = (map: any) => {
    //   if (!map) return undefined;
    //   if (typeof map === "object" && !Array.isArray(map)) {
    //     const v = map[sizeLabel] ?? map[key] ?? map[sizeLabel?.toUpperCase?.()];
    //     if (v) return Array.isArray(v) ? v : [v];
    //   }
    //   return undefined;
    // };

    // foundImgs =
    //   tryMap(productDetails?.imagesBySize) ??
    //   tryMap(productDetails?.sizeImages) ??
    //   tryMap(productDetails?.imageBySize);

    // if (!foundImgs && Array.isArray(productDetails?.variants)) {
    //   const entry = productDetails.variants.find((vv: any) => {
    //     // consider variant.size or variant.selectedSize
    //     return String(vv.size ?? vv.selectedSize ?? "").toLowerCase() === key;
    //   });
    //   if (entry)
    //     foundImgs = entry.images ?? (entry.image ? [entry.image] : undefined);
    // }

    // if (!foundImgs && Array.isArray(productDetails?.colors)) {
    //   // sometimes colors array contains sizes mapping with images
    //   const entry = productDetails.colors.find(
    //     (c: any) => Array.isArray(c.sizes) && c.sizes.includes(sizeLabel)
    //   );
    //   if (entry)
    //     foundImgs = entry.images ?? (entry.image ? [entry.image] : undefined);
    // }

    // if (!foundImgs) foundImgs = productDetails?.images ?? [];

    // const imgsArr = Array.isArray(foundImgs)
    //   ? foundImgs
    //   : foundImgs
    //   ? [String(foundImgs)]
    //   : [];
    // if (imgsArr.length) {
    //   setGalleryImages(imgsArr);
    //   setMainImage(imgsArr[0] || "");
    // } else {
    //   setMainImage(galleryImages[0] || imagesInput[0] || "");
    // }
  };

  // helper: build grouped SizeOption[] from a product's selectedSizes array
  // helper: build grouped SizeOption[] from a product's selectedSizes array
  const buildSizeOptionsForProduct = (prod: any): SizeOption[] => {
    const sizesArr: string[] = prod?.selectedSizes ?? prod?.sizes ?? [];
    const map = new Map<number, Set<string>>();

    for (const s of sizesArr) {
      // @ts-ignore
      if (!s && s !== 0) continue;
      const raw = String(s).toUpperCase().trim();

      const m = /^(\d{2})([A-Z]+)$/.exec(raw);
      if (m) {
        const band = Number(m[1]);
        const cup = m[2];
        if (!map.has(band)) map.set(band, new Set());
        map.get(band)!.add(cup);
        continue;
      }

      const numericOnly = /^(\d{2,3})$/.exec(raw);
      if (numericOnly) {
        if (!map.has(0)) map.set(0, new Set());
        map.get(0)!.add(numericOnly[1]);
        continue;
      }

      if (/^[A-Z]{1,3}$/.test(raw)) {
        if (!map.has(0)) map.set(0, new Set());
        map.get(0)!.add(raw);
        continue;
      }

      if (!map.has(0)) map.set(0, new Set());
      map.get(0)!.add(raw);
    }

    return Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([band, cupsSet]) => ({
        band,
        cups: Array.from(cupsSet.values()).sort(),
      }));
  };

  // similar product add — if it needs size, open drawer; otherwise call API directly
  const handleAddSimilarClicked = (p: any) => {
    const pid = p._id ?? p.id ?? String(p.product ?? Date.now());
    const sizes = p?.selectedSizes ?? p?.sizes ?? [];
    const needsSize = Array.isArray(sizes) && sizes.length > 0;

    // chosen color for similar if available
    const thisColor =
      (p.selectedColors && p.selectedColors[0]) || (p.color ?? undefined);

    if (!needsSize) {
      // check existing qty in redux for this variant
      const existing = getExistingQtyForVariant(pid, undefined, thisColor);
      const qtyToSend = existing + 1;

      const payload = {
        productId: pid,
        quantity: qtyToSend,
        selectedSize: undefined,
        selectedColor: thisColor || undefined,
      };

      const reduxItem = {
        id: pid,
        productId: pid,
        imageUrl: (p.images && p.images[0]) || p.image || "",
        title: p.productTitle ?? p.title ?? p.productName ?? "",
        productName: p.productTitle ?? p.title ?? p.productName ?? "",
        price: p.salePrice ?? p.price,
        originalPrice: p.price,
        rating: 0,
        qty: qtyToSend,
        size: undefined,
        color: thisColor || undefined,
        silent: true,
      };

      // call unified API helper which will dispatch addToCart(...) on success
      addToCartApi(payload, reduxItem, pid);
      return;
    }

    // open drawer for this product (size required)
    setDrawerProduct(p);
    setOpenSizeDrawer(true);
  };

  // when drawer confirms for a similar product
  // sel now may contain quantity (but we compute authoritative qty here)
  const onDrawerConfirm = async (sel: {
    band: number;
    cup: string;
    label: string;
    quantity?: number;
  }) => {
    const chosen = sel.label;

    // if drawerProduct is null => it was main product
    if (!drawerProduct) {
      // main product flow: compute existing qty for main product & selected size/color
      const existing = getExistingQtyForVariant(
        productId as string,
        chosen,
        selectedColor || undefined
      );
      const qtyToSend = existing + 1;
      const payload = makeCartPayload(chosen, qtyToSend);
      await addToCartApi(payload, undefined, "current");
      setOpenSizeDrawer(false);
      return;
    }

    // similar product flow
    const p = drawerProduct;
    const pid = p._id ?? p.id ?? String(p.product ?? Date.now());
    const thisColor = (p.selectedColors && p.selectedColors[0]) || undefined;
    // authoritative existing qty from redux
    const existing = getExistingQtyForVariant(pid, chosen, thisColor);
    const qtyToSend = existing + 1;

    const payload = {
      productId: pid,
      quantity: qtyToSend,
      selectedSize: chosen,
      selectedColor: thisColor,
    };
    const reduxItem = {
      id: pid,
      productId: pid,
      imageUrl: (p.images && p.images[0]) || p.image || "",
      title: p.productTitle ?? p.title ?? p.productName ?? "",
      productName: p.productTitle ?? p.title ?? p.productName ?? "",
      price: p.salePrice ?? p.price,
      originalPrice: p.price,
      rating: 0,
      qty: qtyToSend,
      size: chosen,
      color: thisColor,
      silent: true,
    };

    await addToCartApi(payload, reduxItem, pid);
    setOpenSizeDrawer(false);
    setDrawerProduct(null);
  };

  // cancel drawer
  const onDrawerClose = () => {
    setOpenSizeDrawer(false);
    setDrawerProduct(null);
  };

  // -------------------
  // JSX (thumbnails now use galleryImages fallback to imagesInput)
  // -------------------
  return (
    <Container size="xl" py="md">
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }} style={{ position: "relative" }}>
          {isProductEligibleForCoupon && (
            <Box
              style={{
                position: "absolute",
                top: 0,
                left: 10,
                zIndex: 10,
              }}
            >
              <Badge
                color="red"
                size="lg"
                radius="sm"
                styles={{
                  root: {
                    backgroundColor: LIGHT_GREEN,
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "12px",
                    padding: "8px 12px",
                    textTransform: "none",
                  },
                }}
              >
                Buy ₹{coupon.discount} Get {coupon.offerDiscount}% OFF
              </Badge>
            </Box>
          )}
          <Image
            src={mainImage}
            alt="Main product"
            radius="md"
            height={400}
            width="100%"
            fit="contain"
          />

          {/* Image thumbnails - show images for selected color */}
          <Group mt="sm" wrap="wrap">
            {getAllColorImages.map((img: string, idx: number) => (
              <Box
                key={`all-colors-${idx}`}
                onClick={() => {
                  setMainImage(img), onColorSelectByImage(img);
                }}
                style={{
                  cursor: "pointer",
                  border:
                    mainImage === img
                      ? `3px solid ${LIGHT_GREEN}`
                      : "2px solid #e0e0e0",
                  borderRadius: 8,
                  width: 80,
                  height: 80,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 2,
                  backgroundColor:
                    mainImage === img
                      ? "rgba(19, 50, 21, 0.05)"
                      : "transparent",
                  transition: "all 0.3s ease",
                  transform: mainImage === img ? "scale(1.05)" : "scale(1)",
                }}
                onMouseEnter={(e) => {
                  if (mainImage !== img) {
                    e.currentTarget.style.borderColor = LIGHT_GREEN;
                    e.currentTarget.style.transform = "scale(1.02)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (mainImage !== img) {
                    e.currentTarget.style.borderColor = "#e0e0e0";
                    e.currentTarget.style.transform = "scale(1)";
                  }
                }}
              >
                <Image
                  src={img}
                  width={60}
                  height={60}
                  radius="sm"
                  style={{
                    opacity: mainImage === img ? 1 : 0.8,
                    transition: "opacity 0.3s ease",
                  }}
                />
              </Box>
            ))}
          </Group>
        </Grid.Col>

        {/* Right: details */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Title order={2}>{titleInput}</Title>
          <Text>{descInput}</Text>

          <Group mt="xs">
            <Text fw={700} size="xl">
              ₹{salePriceInput ?? priceInput}
            </Text>
            {salePriceInput ? (
              <Text c="dimmed" td="line-through">
                ₹{priceInput}
              </Text>
            ) : null}
            {salePriceInput ? (
              <Badge color="green">Save {discount}%</Badge>
            ) : null}
          </Group>

          {/* Colors */}
          {productDetails?.category !== "Combo" && (
            <Box mt="md">
              <Text fw={500}>Colors</Text>
              <Group mt="xs">
                {colorsInput.map((clr: string, i: number) => (
                  <Box
                    key={i}
                    onClick={() => onColorSelect(clr)}
                    title={clr}
                    style={{
                      cursor: "pointer",
                      border:
                        selectedColor === clr
                          ? `3px solid ${LIGHT_GREEN}`
                          : "1px solid #ccc",
                      borderRadius: "50%",
                      width: 28,
                      height: 28,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: /^#/.test(String(clr)) ? clr : "transparent",
                    }}
                  >
                    {!/^#/.test(String(clr)) && (
                      <div
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: 7,
                          background: LIGHT_GREEN,
                        }}
                      />
                    )}
                  </Box>
                ))}
                {colorsInput.length === 0 && (
                  <Text size="xs" c="dimmed">
                    Single Color
                  </Text>
                )}
              </Group>
            </Box>
          )}

          {/* Size breakdown */}
          <Box mt="md">
            <Text fw={500}>Sizes</Text>
            <Box mt="xs">
              {sizeOptions.length === 0 ? (
                <Text size="sm" c="dimmed">
                  Single size — no selection required
                </Text>
              ) : (
                <Group spacing="xs" wrap="wrap">
                  {sizeOptions
                    .flatMap((opt) =>
                      // if band === 0 we keep the cup label as-is (S, M, L, 28, 30)
                      opt.band === 0
                        ? opt.cups.map((cup) => cup)
                        : opt.cups.map((cup) => `${opt.band}${cup}`)
                    )
                    .filter((label) =>
                      // normalize check against availableSizesSet (availableSizesSet contains uppercase labels)
                      availableSizesSet.size
                        ? availableSizesSet.has(String(label).toUpperCase())
                        : true
                    )
                    .map((label) => {
                      const active =
                        (selectedSize || "").toUpperCase() ===
                        String(label).toUpperCase();
                      return (
                        <Button
                          key={label}
                          size="xs"
                          variant="outline"
                          onClick={() => onSizeSelect(label)}
                          styles={{
                            root: {
                              backgroundColor: active
                                ? "#92b775"
                                : "transparent",
                              color: active ? "#fff" : DARK_GREEN,
                              borderColor: DARK_GREEN,
                              "&:hover": {
                                backgroundColor: "#92b775",
                                color: "#fff",
                              },
                            },
                          }}
                        >
                          {label}
                        </Button>
                      );
                    })}
                </Group>
              )}
            </Box>

            {selectedSize ? (
              <Text size="sm" mt="8px">
                Selected: <b>{selectedSize}</b>
              </Text>
            ) : null}
          </Box>

          {/* Actions */}
          <Group mt="lg" gap="sm" align="center">
            {currentQty > 0 ? (
              <Group
                gap="xs"
                style={{
                  background: LIGHT_GREEN,
                  borderRadius: 999,
                  padding: "6px 8px",
                }}
              >
                <ActionIcon
                  variant="transparent"
                  onClick={() => {
                    // compute new qty and call server
                    const nextQty = Math.max(0, currentQty - 1);
                    updateLineQuantity(
                      productId as string,
                      nextQty,
                      requiresSize ? selectedSize : undefined,
                      requiresColor ? selectedColor : undefined,
                      "current"
                    );
                  }}
                  aria-label="Decrease quantity"
                >
                  <IconMinus size={16} color="#fff" />
                </ActionIcon>

                <Button
                  variant="subtle"
                  size="compact-sm"
                  radius="xl"
                  styles={{ root: { color: "white", pointerEvents: "none" } }}
                >
                  {currentQty}
                </Button>

                <ActionIcon
                  variant="transparent"
                  onClick={() => {
                    const nextQty = currentQty + 1;
                    updateLineQuantity(
                      productId as string,
                      nextQty,
                      requiresSize ? selectedSize : undefined,
                      requiresColor ? selectedColor : undefined,
                      "current"
                    );
                  }}
                  aria-label="Increase quantity"
                >
                  <IconPlus size={16} color="#fff" />
                </ActionIcon>
              </Group>
            ) : (
              <>
                <Button
                  loading={!!addingMap["current"]}
                  color="brand"
                  styles={(theme) => ({
                    root: {
                      backgroundColor: "#92B775",
                      color: "#FFF",
                      fontWeight: 600,
                    },
                  })}
                  onClick={handleAddToCart}
                >
                  Add to cart
                </Button>

                <Button
                  loading={!!addingMap["current"]}
                  variant="filled"
                  color="brand"
                  styles={(theme) => ({
                    root: {
                      borderColor: "#92B775", // LIGHT_GREEN border
                      color: "#133215", // DARK_GREEN text
                      fontWeight: 600,
                      "&:hover": {
                        backgroundColor: "rgba(146,183,117,0.15)", // subtle LIGHT_GREEN hover
                      },
                    },
                  })}
                  onClick={handleBuyNow}
                >
                  Buy Now
                </Button>
              </>
            )}
          </Group>

          <Button
            variant="subtle"
            size="sm"
            onClick={() => setOpenReturnPolicy(true)}
            sx={{
              color: DARK_GREEN,
              borderColor: DARK_GREEN,
            }}
          >
            Return / Exchange policy
          </Button>

          {/* Trust badges */}
          <Group mt="md" gap="lg">
            <Group>
              <ThemeIcon variant="light" color="green">
                <IconTruck />
              </ThemeIcon>
              <Text>Fast & Free Delivery</Text>
            </Group>
            <Group>
              <ThemeIcon variant="light" color="green">
                <IconPackage />
              </ThemeIcon>
              <Text>Discreet Packaging</Text>
            </Group>
          </Group>

          <Box mt="sm">
            <Text size="xs">✓ Free shipping for UPI/Card holders</Text>
            <Text size="xs">✓ 100% Secured Payment</Text>
          </Box>
        </Grid.Col>
      </Grid>

      {/* Tabs */}
      <Tabs defaultValue="description" mt="xl">
        {(productDetails?.Descriptionimages ?? []).length > 0 && (
          <Tabs.List>
            <Tabs.Tab
              value="description"
              p={0}
              style={{ fontSize: "20px", fontWeight: "bold" }}
            >
              Description
            </Tabs.Tab>
          </Tabs.List>
        )}

        <Tabs.Panel value="description" pt="xs">
          <Group
            mt="sm"
            wrap="nowrap"
            gap="sm"
            style={{ overflowX: isMobile ? "auto" : "unset" }}
          >
            {(productDetails?.Descriptionimages ?? []).length > 0 && (
              <>
                {(productDetails?.Descriptionimages ?? []).map((img, idx) => (
                  <>
                    <Stack key={idx} align="center" style={{ flexShrink: 0 }}>
                      <Image
                        src={img}
                        alt={`description-${idx}`}
                        radius="md"
                        w={"100%"}
                        h={isMobile ? 120 : 150}
                      />
                      <div>
                        <Text size="sm">
                          {productDetails?.braAttributes[idx]}
                        </Text>
                      </div>
                    </Stack>
                  </>
                ))}
              </>
            )}
          </Group>

          <Box mt="md">
            <Text fw={600}>Features:</Text>
            {productDetails?.braAttributes?.length > 0 ? (
              <ul>
                {productDetails.braAttributes.map(
                  (attr: string, idx: number) => (
                    <li key={idx}>
                      <Text size="sm">{attr}</Text>
                    </li>
                  )
                )}
              </ul>
            ) : (
              <ul>
                <li>Made with full cotton</li>
                <li>Slim fit for any body</li>
              </ul>
            )}
          </Box>
        </Tabs.Panel>
      </Tabs>

      <Divider my="lg" />

      {/* Similar products grid */}
      <Box mt="md">
        <Title order={4}>Similar Products</Title>
        <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md" mt="md">
          {similarProducts.length === 0 ? (
            <Text c="dimmed">No similar products found</Text>
          ) : (
            similarProducts.map((p: any) => {
              const pid = p._id ?? p.id ?? String(p.product ?? Date.now());
              const img = (p.images && p.images[0]) || p.image || "";
              const pPrice = p.salePrice ?? p.price;
              const pOrig = p.price;
              const savePct =
                pOrig && pPrice
                  ? Math.round(((pOrig - pPrice) / pOrig) * 100)
                  : 0;
              return (
                <Card key={pid} shadow="sm" radius="md" withBorder>
                  <Box
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`/product?id=${pid}`)}
                  >
                    <Image
                      src={img}
                      alt={p.productTitle ?? p.title}
                      height={180}
                      fit="contain"
                    />
                  </Box>
                  <Stack spacing={6} mt="sm">
                    <Text lineClamp={2} fw={600} size="sm">
                      {p.productTitle ?? p.title}
                    </Text>
                    <Group position="apart" align="center">
                      <div>
                        <Text fw={700}>₹{pPrice}</Text>
                        {pOrig && (
                          <Text size="xs" c="dimmed" td="line-through">
                            ₹{pOrig}
                          </Text>
                        )}
                      </div>
                      {savePct ? (
                        <Badge color="#92b775">Save {savePct}%</Badge>
                      ) : null}
                    </Group>
                    <Group position="apart" mt="xs">
                      <Button
                        size="xs"
                        variant="filled"
                        loading={!!addingMap[pid]}
                        onClick={() => handleAddSimilarClicked(p)}
                        styles={(theme) => ({
                          root: {
                            backgroundColor: "#92b775", // main green from root palette
                            color: theme.white,
                            "&:hover": {
                              backgroundColor: theme.colors.green[9], // darker shade on hover
                            },
                          },
                        })}
                      >
                        Add
                      </Button>
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => navigate(`/product?id=${pid}`)}
                        styles={{
                          root: {
                            color: "#111",
                            border: "1px solid green",
                          },
                        }}
                      >
                        View
                      </Button>
                    </Group>
                  </Stack>
                </Card>
              );
            })
          )}
        </SimpleGrid>
      </Box>

      {/* SizeSelectorDrawer */}
      <SizeSelectorDrawer
        opened={openSizeDrawer}
        onClose={onDrawerClose}
        onConfirm={() => {}}
        productTitle={
          drawerProduct
            ? drawerProduct.productTitle ?? drawerProduct.title ?? "Product"
            : titleInput
        }
        price={
          drawerProduct
            ? drawerProduct.salePrice ?? drawerProduct.price
            : salePriceInput ?? priceInput
        }
        imageUrl={
          drawerProduct
            ? (drawerProduct.images && drawerProduct.images[0]) ||
              drawerProduct.image ||
              ""
            : mainImage || galleryImages?.[0] || imagesInput?.[0] || ""
        }
        options={
          drawerProduct
            ? buildSizeOptionsForProduct(drawerProduct)
            : sizeOptions.length
            ? sizeOptions
            : undefined
        }
        productId={
          drawerProduct ? drawerProduct._id ?? drawerProduct.id : productId
        }
        selectedColor={
          drawerProduct
            ? (drawerProduct.selectedColors &&
                drawerProduct.selectedColors[0]) ||
              undefined
            : selectedColor
        }
        colors={
          drawerProduct
            ? drawerProduct.selectedColors ?? drawerProduct.colors ?? []
            : productDetails?.selectedColors ?? productDetails?.colors ?? []
        }
        
      />

      {/* Return / Exchange Policy Drawer */}
      <Drawer
        opened={openReturnPolicy}
        onClose={() => setOpenReturnPolicy(false)}
        withCloseButton={false}
        padding="md"
        position={isMobile ? "bottom" : "right"}
        size={isMobile ? "60%" : 420}
        overlayOpacity={0.45}
        lockScroll
        title={
          <Group position="apart" align="center" style={{ width: "100%" }}>
            <Text fw={700}>QUICK CONTACT : +91 70104 47947</Text>
            <CloseButton onClick={() => setOpenReturnPolicy(false)} />
          </Group>
        }
      >
        <ScrollArea
          style={{ height: isMobile ? "100%" : 520, paddingRight: 8 }}
        >
          <Stack spacing="md">
            <Title order={5}>15 DAYS Exchange</Title>

            <Stack spacing="sm">
              <Text>
                1. Product(s) can be exchanged if faulty/damaged or any size
                issue.
              </Text>

              <Text>
                2. Due to the intimate nature and hygienic standards of certain
                items, we regret that it is not possible for us to accept
                returns on Briefs, Panties, Cami Bras and some of the
                accessories.
              </Text>

              <Text>
                3. Exchange / Return request must be made within 15 working days
                from the date of product delivery.
              </Text>

              <Text>
                4. In the interests of hygiene, we may refuse returns where it's
                obvious that the item has been worn, washed or soiled.
              </Text>

              <Text>
                5. If you need your product(s) to be exchanged / Returned, Go To
                My Orders Section
              </Text>
            </Stack>

            <Group mt="md" spacing="lg">
              <Group>
                <ThemeIcon variant="light" color="green">
                  <IconTruck />
                </ThemeIcon>
                <Text size="sm">Fast & Free Delivery</Text>
              </Group>
              <Group>
                <ThemeIcon variant="light" color="green">
                  <IconPackage />
                </ThemeIcon>
                <Text size="sm">Discreet Packaging</Text>
              </Group>
            </Group>
          </Stack>
        </ScrollArea>
      </Drawer>
    </Container>
  );
}
