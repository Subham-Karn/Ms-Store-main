import React, { useState } from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { ShoppingCart, Check , Package , X} from "lucide-react";
import { Link } from "react-router-dom";
import { app } from "../assets/assets";
import { Helmet } from "react-helmet-async";
import { useDispatch } from "react-redux";
import { addToCart } from "../store/slices/cartSlice";

const BRAND = "#1a5a8a";
const RUPEE = "₹";

/* ---- Star renderer ---- */
const Stars = ({ rate = 0, size = 12 }) => {
  const full = Math.floor(rate);
  const half = rate % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  const cls = `text-yellow-400`;
  const s = { width: size, height: size };
  return (
    <span className="flex items-center gap-0.5">
      {Array(full).fill(null).map((_, i) => <FaStar key={`f${i}`} className={cls} style={s} />)}
      {half && <FaStarHalfAlt className={cls} style={s} />}
      {Array(empty).fill(null).map((_, i) => <FaRegStar key={`e${i}`} className="text-gray-300" style={s} />)}
    </span>
  );
};

/* ---- Skeleton ---- */
const Skeleton = () => (
  <div className="flex flex-col gap-3 p-3 animate-pulse">
    <div className="w-full aspect-square bg-gradient-to-br from-gray-200 to-gray-100 rounded-xl" />
    <div className="h-4 bg-gray-200 rounded w-3/4" />
    <div className="h-4 bg-gray-200 rounded w-1/2" />
    <div className="h-9 bg-gray-200 rounded-lg w-full" />
  </div>
);

const ProductCard = ({ product, loading = false, allCatalogs = [] }) => {
  const dispatch = useDispatch();
  const [added, setAdded] = useState(false);
  const [showShipping, setShowShipping] = useState(false);
  const [shippingCharge, setShippingCharge] = useState(63);

  if (loading) return <Skeleton />;

  const isInStock = product.stock > 0;
  const hasDiscount = product.discountprice > 0;

  const triggerShippingSelect = (e) => {
    e.preventDefault(); 
    setShowShipping(true);
  };

  const confirmAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
  dispatch(addToCart({ product: { ...product, shipping_charge: shippingCharge }, quantity: 1 }));
    setAdded(true);
    setShowShipping(false);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <>
      <Helmet>
        <title>{product.title} | Ms Store</title>
        <meta name="description" content={`Buy ${product.title} at the best price. ${product.offer > 0 ? product.offer + "% off!" : ""}`} />
        <meta property="og:title" content={`${product.title} | Ms Store`} />
        <meta property="og:image" content={product.bunner} />
        <meta property="og:url" content={`https://msstore.vercel.app/catalog/${product.pid}`} />
        <meta property="og:type" content="product" />
        <link rel="canonical" href={`https://msstore.in/catalog/${product.pid}`} />
      </Helmet>

      <div className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-[#1a5a8a]/20 hover:shadow-xl hover:shadow-[#1a5a8a]/8 transition-all duration-300">
        
        {/* Image block */}
        <Link
          to={`/catalog/${product.pid}`}
          state={{ catalog: product, allCatalogs }}
          className="relative block overflow-hidden bg-gray-50"
          style={{ aspectRatio: "1 / 1" }}
        >
          <img
            src={product.bunner}
            alt={product.title}
            onError={(e) => (e.target.src = app.defaultImage)}
            className={`w-full h-full object-contain p-3 transition-transform duration-500 group-hover:scale-108 ${
              !isInStock ? "grayscale opacity-60" : ""
            }`}
            style={{ transform: "scale(1)", transition: "transform 0.5s ease" }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.07)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.offer > 0 && (
              <span className="text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full shadow">
                {Math.floor(product.offer)}% OFF
              </span>
            )}
            {!isInStock && (
              <span className="text-[10px] font-semibold bg-gray-800/80 text-white px-2 py-0.5 rounded-full">
                Out of Stock
              </span>
            )}
          </div>
        </Link>

        {/* Info block */}
        <div className="flex flex-col gap-2 p-3 flex-1">
          <Link
            to={`/catalog/${product.pid}`}
            state={{ catalog: product, allCatalogs }}
            className="text-sm font-medium text-gray-800 hover:text-[#1a5a8a] line-clamp-2 leading-snug transition-colors"
          >
            {product.title || "—"}
          </Link>

          {/* Stars */}
          {product.rate > 0 && (
            <div className="flex items-center gap-1">
              <Stars rate={product.rate} />
              <span className="text-[11px] text-gray-400">({product.rate})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2 mt-auto pt-1">
            {hasDiscount ? (
              <>
                <span className="text-base font-bold text-[#1a5a8a]">{RUPEE}{product.discountprice}</span>
                <span className="text-xs text-gray-400 line-through">{RUPEE}{product.orignalprice}</span>
              </>
            ) : (
              <span className="text-base font-bold text-[#1a5a8a]">{RUPEE}{product.orignalprice || 0}</span>
            )}
          </div>
        </div>

        {/* Cart button & Shipping Reveal */}
        <div className="px-3 pb-3">
          {!isInStock ? (
            <button disabled className="w-full py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-gray-200">
              Out of Stock
            </button>
          ) : showShipping ? (
            // ─── SHIPPING SELECTION STATE ───
            <div className="flex flex-col gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-gray-600 flex items-center gap-1">
                  <Package size={12} /> Shipping
                </span>
                <button onClick={() => setShowShipping(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              </div>
              
              <select 
                value={shippingCharge}
                onChange={(e) => setShippingCharge(Number(e.target.value))}
                className="w-full text-xs py-1.5 px-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-[#1a5a8a] cursor-pointer"
              >
                <option value={63}>Letter (₹63)</option>
                <option value={70}>Manila (₹70)</option>
                <option value={100}>Large (₹100)</option>
              </select>

              <button
                onClick={confirmAddToCart}
                className="w-full py-2 bg-[#1a5a8a] text-white rounded-lg text-xs font-bold hover:bg-[#154d76] transition-colors flex items-center justify-center gap-1"
              >
                <Check size={14} /> Confirm Add
              </button>
            </div>
          ) : (
            // ─── DEFAULT ADD TO CART STATE ───
            <button
              onClick={triggerShippingSelect}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                added
                  ? "bg-green-500 text-white"
                  : "bg-[#1a5a8a]/8 text-[#1a5a8a] border-2 border-[#1a5a8a]/20 hover:bg-[#1a5a8a] hover:text-white hover:border-[#1a5a8a]"
              }`}
            >
              {added ? (
                <><Check size={15} /> Added!</>
              ) : (
                <><ShoppingCart size={15} /> Add to Cart</>
              )}
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductCard;