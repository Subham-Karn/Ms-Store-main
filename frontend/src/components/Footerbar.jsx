import React, { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { fetchCatalogs } from "../store/slices/appSlice";

const Footerbar = () => {
  const { catalogs} = useSelector(state =>state.app);
  const dispatch = useDispatch();
  
  useEffect(() => {
    if (!catalogs || catalogs.length === 0) {
      dispatch(fetchCatalogs());
    }
  }, [dispatch, catalogs]);

  // Extract & flatten tags inside useMemo
  const uniqueTags = useMemo(() => {
    const allTags = catalogs ? catalogs.flatMap((item) => item.tags || []) : [];
    return [...new Set(allTags)];
  }, [catalogs]);

  return (
      <footer className="bg-[#1a5a8a] text-white mt-16">
        <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* Tags */}
          <div>
            <h2 className="text-lg font-semibold border-l-4 border-red-500 pl-3 mb-5 uppercase tracking-wide">
              Tags
            </h2>
            <div className="flex flex-wrap gap-2 mb-8">
              {uniqueTags.length === 0 ? (
                <p className="text-sm text-gray-300">No Tags Found</p>
              ) : (
                uniqueTags.map((tag, i) => (
                  <Link
                    key={i}
                    to={`/search?tag=${tag}`}
                    className="bg-white/20 text-xs px-3 py-1 rounded-md hover:bg-white/30 transition"
                  >
                    {tag}
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Follow */}
          <div>
            <h2 className="text-lg font-semibold border-l-4 border-red-500 pl-3 mb-5 uppercase tracking-wide">
              Follow Us
            </h2>
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/subham.sharma1111"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center bg-white/20 rounded-full hover:bg-white/30 transition"
              >
                <FaFacebookF size={16} />
              </a>
              <a
                href="https://www.instagram.com/ms_store_111/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center bg-white/20 rounded-full hover:bg-white/30 transition"
              >
                <FaInstagram size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h2 className="text-lg font-semibold border-l-4 border-red-500 pl-3 mb-5 uppercase tracking-wide">
              Quick Links
            </h2>
            <div className="flex flex-col gap-2">
              <Link
                to="/catalogs"
                className=" text-xs px-3 py-1 rounded-md hover:bg-white/30 transition"
              >
                Catalogs
              </Link>
              <Link
                to="/about"
                className=" text-xs px-3 py-1 rounded-md hover:bg-white/30 transition"
              >
                About Us
              </Link>
              <Link
                to="/return-policy"
                className=" text-xs px-3 py-1 rounded-md hover:bg-white/30 transition"
              >
                Return Policy
              </Link>
              <Link
                to="/refund-policy"
                className=" text-xs px-3 py-1 rounded-md hover:bg-white/30 transition"
              >
                Refund Policy
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h2 className="text-lg font-semibold border-l-4 border-red-500 pl-3 mb-5 uppercase tracking-wide">
              Contact Info
            </h2>
            <p onClick={() => window.open("https://www.google.com/maps")} className="text-sm mb-2 cursor-pointer">Address: Kishanganj,Bihar 855108</p>
            <p onClick={() => window.open("tel:+91-91229 78929")} className="text-sm mb-2 cursor-pointer">Whatsapp:+91-91229 78929</p>
            <p onClick={() => window.open("mailto:sharmonu371@gmail.com")} className="text-sm mb-4 cursor-pointer">Email: contactmsstoreinfo@gmail.com</p>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="bg-[#164b72] text-center py-4 text-xs text-gray-300">
          © {new Date().getFullYear()} MS Store. All Rights Reserved.
        </div>
      </footer>
  );
};

export default Footerbar;
