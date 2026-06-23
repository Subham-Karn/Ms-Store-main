import React, { useEffect, useState, useMemo } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa";
import { Loader2, Share2, Trash2, ShoppingCart, Zap, PackageCheck } from "lucide-react";

import RootLayout from "../util/RootLayout";
import ProductCard from "../components/ProductCard";
import AddComment from "../components/AddComment";
import { formatDate } from "../util/formateDate";
import { getAllCatalog, getCatalogById } from "../services/catalogService";

import { addToCart } from "../store/slices/cartSlice";
import { fetchComments, postComment, removeComment } from "../store/slices/appSlice";

/* ---- Helpers ---- */

const Stars = ({ rate = 0 }) => {
  const full = Math.floor(rate);
  const half = rate % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <div className="flex items-center gap-1">
      {Array(full).fill(null).map((_, i) => <FaStar key={`f${i}`} size={16} className="text-yellow-400" />)}
      {half && <FaStarHalfAlt size={16} className="text-yellow-400" />}
      {Array(empty).fill(null).map((_, i) => <FaRegStar key={`e${i}`} size={16} className="text-gray-300" />)}
    </div>
  );
};

const getShippingInfo = (charge) => {
  switch (charge) {
    case 63: return { label: "Letter", price: "₹63", icon: "📨" };
    case 70: return { label: "Manila", price: "₹70", icon: "📦" };
    case 100: return { label: "Large", price: "₹100", icon: "📫" };
    default: return { label: "Free Shipping", price: "₹0", icon: "🎁" };
  }
};

const shippingOptions = [
  { value: 63, label: "Letter", priceText: "₹63", icon: "📨" },
  { value: 70, label: "Manila", priceText: "₹70", icon: "📦" },
  { value: 100, label: "Large", priceText: "₹100", icon: "📫" },
];

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SKELETON COMPONENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const Shimmer = ({ className = "" }) => (
  <div className={`bg-gray-200 rounded-xl animate-pulse ${className}`} />
);

const ProductSkeleton = () => (
  <div className="w-full max-w-7xl mx-auto px-4 md:px-8 mt-24 md:mt-24 py-8 md:py-12">
    {/* Breadcrumb skeleton */}
    <div className="flex items-center gap-2 mb-6">
      <Shimmer className="h-3 w-10" />
      <Shimmer className="h-3 w-2" />
      <Shimmer className="h-3 w-16" />
      <Shimmer className="h-3 w-2" />
      <Shimmer className="h-3 w-32" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-16 items-start">
      {/* ── LEFT: image skeleton ── */}
      <div className="flex flex-col gap-4">
        <Shimmer className="w-full rounded-3xl" style={{ aspectRatio: "1/1" }} />
        <div className="flex gap-2.5">
          {[1, 2, 3, 4].map((i) => (
            <Shimmer key={i} className="shrink-0 rounded-2xl" style={{ width: 72, height: 72 }} />
          ))}
        </div>
      </div>

      {/* ── RIGHT: info skeleton ── */}
      <div className="flex flex-col gap-4">
        {/* category pill */}
        <Shimmer className="h-6 w-20 rounded-full" />

        {/* title */}
        <Shimmer className="h-8 w-3/4" />
        <Shimmer className="h-6 w-1/2" />

        {/* stars */}
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((i) => <Shimmer key={i} className="h-4 w-4 rounded" />)}
          <Shimmer className="h-4 w-8" />
          <Shimmer className="h-4 w-16" />
        </div>

        {/* price block */}
        <Shimmer className="h-24 w-full rounded-2xl" />

        {/* description lines */}
        <Shimmer className="h-4 w-full" />
        <Shimmer className="h-4 w-5/6" />
        <Shimmer className="h-4 w-4/6" />

        <div className="h-px bg-gray-200 my-1" />

        {/* shipping options */}
        <Shimmer className="h-4 w-32" />
        <div className="grid grid-cols-4 gap-2.5">
          {[1, 2, 3, 4].map((i) => <Shimmer key={i} className="h-16 rounded-xl" />)}
        </div>

        {/* stock */}
        <Shimmer className="h-9 w-44 rounded-xl" />

        {/* quantity */}
        <div className="flex items-center gap-4">
          <Shimmer className="h-4 w-16" />
          <Shimmer className="h-10 w-32 rounded-xl" />
        </div>

        {/* CTA buttons */}
        <div className="flex gap-3">
          <Shimmer className="h-12 flex-1 rounded-2xl" />
          <Shimmer className="h-12 flex-1 rounded-2xl" />
        </div>

        {/* trust badges */}
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => <Shimmer key={i} className="h-14 rounded-xl" />)}
        </div>

        {/* tags */}
        <div className="flex gap-1.5">
          {[1, 2, 3].map((i) => <Shimmer key={i} className="h-6 w-14 rounded-full" />)}
        </div>
      </div>
    </div>

    {/* Reviews skeleton */}
    <div className="mt-16">
      <Shimmer className="h-7 w-40 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Shimmer className="w-9 h-9 rounded-full" />
              <div className="flex flex-col gap-1.5 flex-1">
                <Shimmer className="h-3.5 w-24" />
                <Shimmer className="h-3 w-32" />
              </div>
              <Shimmer className="h-3 w-14" />
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((j) => <Shimmer key={j} className="h-4 w-4 rounded" />)}
            </div>
            <Shimmer className="h-3.5 w-full" />
            <Shimmer className="h-3.5 w-4/5" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MAIN COMPONENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const ProdutsviewRoute = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const initialCatalog = location.state?.catalog || null;
  const initialAllCatalogs = location.state?.allCatalogs || [];

  const [catalogData, setCatalogData] = useState(initialCatalog);
  const [previewImage, setPreviewImage] = useState(
    initialCatalog?.banner || initialCatalog?.bunner || null
  );
  const [allCatalogs, setAllCatalogs] = useState(initialAllCatalogs);
  const [quantity, setQuantity] = useState(1);
  const [commentLoading, setCommentLoading] = useState(false);
  const [cartAdded, setCartAdded] = useState(false);
  const [shippingCharge, setShippingCharge] = useState(63);

  // true only when we're fetching from backend (no state passed via link)
  const [pageLoading, setPageLoading] = useState(!initialCatalog);
  const [notFound, setNotFound] = useState(false);

  const { comments, loading } = useSelector((state) => state.app);
  const { user } = useSelector((state) => state.user);

  /* ── Fetch single catalog when arriving via direct URL ── */
  useEffect(() => {
    if (!initialCatalog) {
      setPageLoading(true);
      setNotFound(false);
      (async () => {
        try {
          const res = await getCatalogById(id);
          if (res.success && res.data) {
            setCatalogData(res.data);
            setPreviewImage(res.data.banner || res.data.bunner);
          } else {
            setNotFound(true);
          }
        } catch {
          setNotFound(true);
        } finally {
          setPageLoading(false);
        }
      })();
    }
  }, [id, initialCatalog]);

  /* ── Fetch all catalogs for "similar products" ── */
  useEffect(() => {
    if (!initialAllCatalogs.length) {
      (async () => {
        const res = await getAllCatalog();
        if (res.success) setAllCatalogs(res.data);
      })();
    }
  }, [initialAllCatalogs]);

  /* ── Comments + scroll top ── */
  useEffect(() => {
    if (id) {
      dispatch(fetchComments(id));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [id, dispatch]);

  /* ── Page title ── */
  useEffect(() => {
    if (catalogData?.title) document.title = `${catalogData.title} | Ms Store`;
  }, [catalogData?.title]);

  /* ── Derived values ── */
  const {
    banner = catalogData?.bunner,
    thumbnails = catalogData?.thumbinals || [],
    title = "",
    description = "",
    orignalprice = 0,
    discountprice = 0,
    offer = 0,
    rate = 0,
    category = "",
    pid,
    stock = 0,
    shipping_charge = 0,
    tags = [],
    subcategory,
  } = catalogData || {};

  const isInStock = stock > 0;
  const hasDiscount = discountprice > 0;

  const avgRating = comments.length
    ? (comments.reduce((sum, c) => sum + (c.rate || 0), 0) / comments.length).toFixed(1)
    : rate;

  const similarProducts = useMemo(
    () => allCatalogs.filter((item) => item.category === category && item.pid !== id),
    [allCatalogs, category, id]
  );

  const allImages = [banner, ...thumbnails].filter(Boolean).slice(0, 6);

  /* ── Handlers ── */
  const handleAddToCart = () => {
  dispatch(addToCart({
    product: {
      ...catalogData,
      shipping_charge: shippingCharge
    },
    quantity: Number(quantity)
  }));

  setCartAdded(true);
  toast.success("Added to cart!");
  setTimeout(() => setCartAdded(false), 2000);
};
    

  const handleBuyNow = () => {
  dispatch(addToCart({
    product: {
      ...catalogData,
      shipping_charge: shippingCharge
    },
    quantity: Number(quantity)
  }));

  navigate("/cart");
};

  const handleAddComment = async (data) => {
    try {
      setCommentLoading(true);
      await dispatch(postComment({ pid: id, userid: user?.id, ...data })).unwrap();
      dispatch(fetchComments(id));
      toast.success("Review posted!");
    } catch (err) {
      toast.error(err || "Failed to post review");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await dispatch(removeComment({ id: commentId, pid: id })).unwrap();
      dispatch(fetchComments(id));
      toast.success("Review deleted");
    } catch (err) {
      toast.error(err || "Failed to delete");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title, text: "Check this out!", url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied!");
    }
  };

  /* ━━━━━━━━━━ RENDER STATES ━━━━━━━━━━ */

  // Loading skeleton — shown only on direct URL visits
  if (pageLoading) {
    return (
      <RootLayout>
        <ProductSkeleton />
      </RootLayout>
    );
  }

  // Not found
  if (notFound || !catalogData) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 h-screen text-center px-4">
        <span className="text-6xl">📭</span>
        <h1 className="text-3xl font-bold text-gray-800">Product Not Found</h1>
        <p className="text-gray-500">This product may have been removed or doesn't exist.</p>
        <button
          onClick={() => navigate("/")}
          className="mt-2 bg-[#1a5a8a] text-white px-6 py-2.5 rounded-xl hover:bg-[#154d76] transition-colors"
        >
          Back to Home
        </button>
      </div>
    );
  }

  /* ━━━━━━━━━━ MAIN RENDER ━━━━━━━━━━ */
  return (
    <RootLayout>
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 mt-24 md:mt-24 py-8 md:py-12">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6 flex-wrap">
          <Link to="/" className="hover:text-[#1a5a8a] transition-colors">Home</Link>
          <span>/</span>
          <Link to={`/catalogs/${category}`} className="hover:text-[#1a5a8a] capitalize transition-colors">{category}</Link>
          {subcategory && (
            <>
              <span>/</span>
              <Link to={`/catalogs/${category}/${subcategory}`} className="hover:text-[#1a5a8a] capitalize transition-colors">{subcategory}</Link>
            </>
          )}
          <span>/</span>
          <span className="text-[#1a5a8a] truncate max-w-[180px]">{title}</span>
        </nav>

        {/* ━━━ PRODUCT SECTION ━━━ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-16 items-start">

          {/* ━━━ LEFT: IMAGE GALLERY ━━━ */}
          <div className="flex flex-col gap-4 md:sticky md:top-24">
            <div
              className="relative group rounded-3xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200/70 shadow-lg"
              style={{ aspectRatio: "1 / 1" }}
            >
              <img
                src={previewImage || banner}
                alt={title}
                className="w-full h-full object-contain p-8 transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
              <div className="absolute top-4 left-4 right-4 flex items-start justify-between pointer-events-none">
                <div className="flex flex-col gap-2 pointer-events-auto">
                  {offer > 0 && (
                    <span className="text-xs font-black bg-gradient-to-r from-red-500 to-rose-500 text-white px-3 py-1.5 rounded-full shadow-lg shadow-red-500/30 tracking-wide">
                      {Math.floor(offer)}% OFF
                    </span>
                  )}
                  {!isInStock && (
                    <span className="text-xs font-bold bg-gray-900/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full">
                      Out of Stock
                    </span>
                  )}
                </div>
                <button
                  onClick={handleShare}
                  className="pointer-events-auto bg-white shadow-md border border-gray-100 text-gray-500 p-2.5 rounded-2xl hover:text-[#1a5a8a] hover:border-[#1a5a8a]/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                >
                  <Share2 size={16} />
                </button>
              </div>
            </div>

            {allImages.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setPreviewImage(img)}
                    className={`shrink-0 rounded-2xl border-2 overflow-hidden bg-gray-50 transition-all duration-200 focus:outline-none
                      ${previewImage === img
                        ? "border-[#1a5a8a] shadow-lg shadow-[#1a5a8a]/20 scale-105"
                        : "border-gray-200 hover:border-[#1a5a8a]/50 opacity-70 hover:opacity-100"
                      }`}
                    style={{ width: 72, height: 72 }}
                  >
                    <img src={img} alt={`view-${i + 1}`} className="w-full h-full object-contain p-1.5" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ━━━ RIGHT: PRODUCT INFO ━━━ */}
          <div className="flex flex-col gap-0">
            {category && (
              <Link
                to={`/catalogs/${category}`}
                className="self-start text-xs font-semibold text-[#1a5a8a] bg-[#1a5a8a]/8 hover:bg-[#1a5a8a]/15 px-3 py-1 rounded-full mb-3 transition-colors capitalize"
              >
                {category}
              </Link>
            )}

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight tracking-tight mb-4">
              {title}
            </h1>

            <div className="flex items-center gap-3 mb-5">
              <Stars rate={Number(avgRating)} />
              <span className="text-sm font-bold text-gray-800">{avgRating}</span>
              <span className="w-px h-4 bg-gray-200" />
              <span className="text-sm text-gray-400">{comments.length} review{comments.length !== 1 ? "s" : ""}</span>
              {isInStock && (
                <>
                  <span className="w-px h-4 bg-gray-200" />
                  <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse" />
                    In Stock
                  </span>
                </>
              )}
            </div>

            {/* Price block */}
            <div className="bg-gradient-to-br from-[#1a5a8a]/5 to-[#1a5a8a]/3 rounded-2xl p-4 mb-5 border border-[#1a5a8a]/10">
              <div className="flex items-baseline gap-3 flex-wrap">
                {hasDiscount ? (
                  <>
                    <span className="text-4xl font-black text-[#1a5a8a] tracking-tight">
                      ₹{discountprice.toLocaleString("en-IN")}
                    </span>
                    <span className="text-lg text-gray-400 line-through font-medium">
                      ₹{orignalprice.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs font-black text-green-700 bg-green-100 border border-green-200 px-2.5 py-1 rounded-full">
                      SAVE ₹{(orignalprice - discountprice).toLocaleString("en-IN")}
                    </span>
                  </>
                ) : (
                  <span className="text-4xl font-black text-[#1a5a8a] tracking-tight">
                    ₹{orignalprice.toLocaleString("en-IN")}
                  </span>
                )}
              </div>
              {hasDiscount && (
                <p className="text-xs text-green-600 font-medium mt-1.5">
                  🎉 You're saving {offer}% on this item
                </p>
              )}
            </div>

            {description && (
              <p className="text-gray-500 text-sm leading-relaxed mb-5">{description}</p>
            )}

            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-5" />

            {/* Shipping selector */}
            <div className="flex flex-col gap-4 mb-5">
              <div>
                <span className="text-sm font-medium text-gray-600 mb-2 block">Select Shipping Method</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {shippingOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setShippingCharge(opt.value)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border-2 transition-all duration-200 focus:outline-none active:scale-95
                        ${shippingCharge === opt.value
                          ? "border-[#1a5a8a] bg-[#1a5a8a]/5 shadow-sm shadow-[#1a5a8a]/10"
                          : "border-gray-100 bg-gray-50 hover:border-[#1a5a8a]/30 hover:bg-gray-100"
                        }`}
                    >
                      <span className="text-xl mb-1">{opt.icon}</span>
                      <span className="text-[11px] font-bold text-gray-700">{opt.label}</span>
                      <span className={`text-[10px] font-semibold ${opt.value === 0 ? "text-green-600" : "text-gray-500"}`}>
                        {opt.priceText}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm mt-1">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isInStock ? "bg-green-50" : "bg-red-50"}`}>
                  <PackageCheck size={15} className={isInStock ? "text-green-600" : "text-red-500"} />
                </div>
                <span className={`font-medium ${isInStock ? "text-green-600" : "text-red-500"}`}>
                  {isInStock ? `${stock} unit${stock !== 1 ? "s" : ""} available` : "Currently out of stock"}
                </span>
              </div>
            </div>

            {/* Quantity */}
            {isInStock && (
              <div className="flex items-center gap-4 mb-5">
                <span className="text-sm font-medium text-gray-600">Quantity</span>
                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, Number(q) - 1))}
                    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-[#1a5a8a] transition-colors text-lg font-semibold"
                  >
                    −
                  </button>
                  <span className="w-10 h-10 flex items-center justify-center text-gray-800 font-bold text-sm border-x-2 border-gray-200">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(10, Number(q) + 1))}
                    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-[#1a5a8a] transition-colors text-lg font-semibold"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* CTA buttons */}
            {isInStock ? (
              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-sm font-bold border-2 transition-all duration-300 active:scale-[0.98]
                    ${cartAdded
                      ? "bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/30"
                      : "border-[#1a5a8a] text-[#1a5a8a] hover:bg-[#1a5a8a] hover:text-white hover:shadow-lg hover:shadow-[#1a5a8a]/25 hover:-translate-y-0.5"
                    }`}
                >
                  <ShoppingCart size={17} />
                  {cartAdded ? "Added to Cart!" : "Add to Cart"}
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 flex items-center justify-center gap-2.5 bg-[#1a5a8a] text-white py-3.5 rounded-2xl text-sm font-bold
                    hover:bg-[#154d76] hover:shadow-xl hover:shadow-[#1a5a8a]/35 hover:-translate-y-0.5
                    transition-all duration-300 active:scale-[0.98] shadow-lg shadow-[#1a5a8a]/20"
                >
                  <Zap size={17} />
                  Buy Now
                </button>
              </div>
            ) : (
              <button disabled className="w-full py-3.5 rounded-2xl text-sm font-bold bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-gray-200 mb-5">
                Currently Unavailable
              </button>
            )}

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              {[
                { icon: "🔒", label: "Secure Payment" },
                { icon: "↩️", label: "Easy Returns" },
                { icon: "✅", label: "Quality Assured" },
              ].map(({ icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl bg-gray-50 border border-gray-100 text-center">
                  <span className="text-lg">{icon}</span>
                  <span className="text-[10px] font-semibold text-gray-500 leading-tight">{label}</span>
                </div>
              ))}
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag, i) => (
                  <Link
                    key={i}
                    to={`/search?tag=${tag}`}
                    className="text-xs font-medium text-[#1a5a8a] bg-[#1a5a8a]/8 hover:bg-[#1a5a8a] hover:text-white px-3 py-1 rounded-full transition-all duration-200"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ━━━ REVIEWS ━━━ */}
        <section className="mt-16">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Customer Reviews
              {comments.length > 0 && (
                <span className="ml-2 text-base font-normal text-gray-400">({comments.length})</span>
              )}
            </h2>
            {comments.length > 0 && (
              <div className="flex items-center gap-2">
                <Stars rate={Number(avgRating)} />
                <span className="text-sm font-semibold text-gray-600">{avgRating} / 5</span>
              </div>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <Shimmer className="w-9 h-9 rounded-full" />
                    <div className="flex flex-col gap-1.5 flex-1">
                      <Shimmer className="h-3.5 w-24" />
                      <Shimmer className="h-3 w-32" />
                    </div>
                    <Shimmer className="h-3 w-14" />
                  </div>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(j => <Shimmer key={j} className="h-4 w-4 rounded" />)}
                  </div>
                  <Shimmer className="h-3.5 w-full" />
                  <Shimmer className="h-3.5 w-4/5" />
                </div>
              ))}
            </div>
          ) : comments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              {comments.map((comment, i) => (
                <div key={i} className="flex flex-col gap-3 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {comment?.user?.avatar ? (
                        <img src={comment.user.avatar} alt="avatar" className="w-9 h-9 rounded-full object-cover border-2 border-[#1a5a8a]/20" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1a5a8a] to-[#2678b5] flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {(comment?.user?.fullName || comment?.full_name || "U").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {comment?.user?.fullName || comment?.full_name || "Anonymous"}
                        </p>
                        {comment?.user?.email && (
                          <p className="text-xs text-gray-400">{comment.user.email}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-[11px] text-gray-300">{formatDate(comment.created_at)}</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <Stars rate={comment?.rate || 0} />
                      <span className="text-xs text-gray-400 font-medium">{comment?.rate}/5</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{comment?.comment}</p>
                  </div>
                  {comment?.user?.id === user?.id && (
                    <div className="flex justify-end pt-1 border-t border-gray-50">
                      <button
                        onClick={() => handleDeleteComment(comment.id || comment.c_id)}
                        className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200 mb-10">
              <p className="text-4xl mb-3">💬</p>
              <p className="font-medium text-gray-500">No reviews yet</p>
              <p className="text-sm mt-1">Be the first to share your experience!</p>
            </div>
          )}

          {user ? (
            <AddComment onSubmit={handleAddComment} pid={pid} commentLoading={commentLoading} />
          ) : (
            <div className="p-5 bg-[#1a5a8a]/5 border border-[#1a5a8a]/15 rounded-2xl text-center">
              <p className="text-gray-600 text-sm">
                <Link to="/login" className="text-[#1a5a8a] font-semibold hover:underline">Log in</Link>{" "}
                to leave a review
              </p>
            </div>
          )}
        </section>

        {/* ━━━ SIMILAR PRODUCTS ━━━ */}
        {similarProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-bold text-gray-900 mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {similarProducts.slice(0, 8).map((product) => (
                <ProductCard key={product.pid} product={product} allCatalogs={allCatalogs} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ━━━ STICKY MOBILE CTA ━━━ */}
      {isInStock && (
        <div className="fixed bottom-0 left-0 right-0 md:hidden z-50 px-4 pb-4 pt-3 bg-white/90 backdrop-blur border-t border-gray-100 shadow-lg">
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border-2 transition-all duration-300 ${
                cartAdded
                  ? "bg-green-500 border-green-500 text-white"
                  : "border-[#1a5a8a] text-[#1a5a8a]"
              }`}
            >
              <ShoppingCart size={15} />
              {cartAdded ? "Added!" : "Cart"}
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 flex items-center justify-center gap-2 bg-[#1a5a8a] text-white py-3 rounded-xl text-sm font-semibold"
            >
              <Zap size={15} />
              Buy Now
            </button>
          </div>
        </div>
      )}

      <div className="h-20 md:hidden" />
    </RootLayout>
  );
};

export default ProdutsviewRoute;