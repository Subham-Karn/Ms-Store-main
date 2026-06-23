import React, { useRef, useState } from "react";
import { Search, X, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SearchInput = ({ className = "", autoFocus = false, onSubmit }) => {
  const [focused, setFocused] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const handleSubmit = () => {
    const q = search.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
    onSubmit?.();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
    if (e.key === "Escape") {
      setSearch("");
      inputRef.current?.blur();
    }
  };

  const clearSearch = () => {
    setSearch("");
    inputRef.current?.focus();
  };

  const hasValue = search.length > 0;

  return (
    <div
      className={`
        group relative flex items-center gap-2
        bg-gray-50 border transition-all duration-300 ease-out
        rounded-full px-3.5 py-2
        ${focused
          ? "border-[#1a5a8a] bg-white shadow-[0_0_0_3px_rgba(26,90,138,0.12)] ring-0"
          : "border-gray-200 hover:border-gray-300 hover:bg-white"
        }
        ${className}
      `}
    >
      {/* Search icon — pulses subtly when focused */}
      <Search
        size={16}
        className={`shrink-0 transition-all duration-300 ${
          focused ? "text-[#1a5a8a] scale-110" : "text-gray-400 group-hover:text-gray-500"
        }`}
      />

      {/* Input */}
      <input
        ref={inputRef}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={handleKeyDown}
        autoFocus={autoFocus}
        type="text"
        name="search"
        id="search"
        placeholder="Search products…"
        className="bg-transparent outline-none w-full text-sm text-gray-800 placeholder:text-gray-400 placeholder:font-normal"
      />

      {/* Right side: clear button OR keyboard hint */}
      <div className="flex items-center gap-1.5 shrink-0">
        {hasValue ? (
          /* Clear button */
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); clearSearch(); }}
            className="p-0.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        ) : (
          /* ⌘K hint — visible only when not focused, hidden on small screens */
          <kbd
            className={`hidden sm:flex items-center gap-0.5 text-[10px] font-semibold text-gray-400
              border border-gray-200 rounded px-1.5 py-0.5 leading-none
              transition-opacity duration-200 ${focused ? "opacity-0" : "opacity-100"}`}
          >
            ↵
          </kbd>
        )}

        {/* Submit arrow — appears when there's a value */}
        {hasValue && (
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); handleSubmit(); }}
            className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1a5a8a] hover:bg-[#154a72]
              text-white transition-all duration-200 shadow-sm"
            aria-label="Search"
          >
            <ArrowRight size={13} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchInput;