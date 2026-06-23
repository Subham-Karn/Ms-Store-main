import React, { useState } from "react";
import { FaRegStar, FaStar } from "react-icons/fa";
import { Loader2, Send } from "lucide-react";

const LABELS = ["Poor", "Fair", "Good", "Very Good", "Excellent"];

const AddComment = ({ onSubmit, pid, commentLoading }) => {
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [touched, setTouched] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (!comment.trim() || rating === 0) return;

    onSubmit({ pid, comment, rate: rating });
    setComment("");
    setRating(0);
    setTouched(false);
  };

  const active = hover || rating;
  const showError = touched && (!comment.trim() || rating === 0);

  return (
    <div className="w-full max-w-2xl">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-[#1a5a8a]/5 to-transparent">
          <h2 className="text-lg font-semibold text-[#1a5a8a]">Write a Review</h2>
          <p className="text-xs text-gray-400 mt-0.5">Your experience helps others make better choices</p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-5">
          {/* Star Rating */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-600">Your Rating</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  className="focus:outline-none transition-transform duration-100 hover:scale-125 active:scale-110"
                  aria-label={`${star} star${star !== 1 ? "s" : ""}`}
                >
                  {star <= active ? (
                    <FaStar className="w-7 h-7 text-yellow-400 drop-shadow-sm" />
                  ) : (
                    <FaRegStar className="w-7 h-7 text-gray-300" />
                  )}
                </button>
              ))}

              {/* Label */}
              <span
                className={`ml-3 text-sm font-medium transition-all duration-200 ${
                  active ? "text-[#1a5a8a] opacity-100" : "opacity-0"
                }`}
              >
                {active ? LABELS[active - 1] : ""}
              </span>
            </div>

            {touched && rating === 0 && (
              <p className="text-xs text-red-500">Please select a rating.</p>
            )}
          </div>

          {/* Comment Textarea */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-600">Your Review</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts about this product..."
              rows={4}
              maxLength={500}
              className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-700 placeholder-gray-300 resize-none outline-none transition-all duration-200
                focus:ring-2 focus:ring-[#1a5a8a]/25 focus:border-[#1a5a8a]
                ${touched && !comment.trim() ? "border-red-300 bg-red-50/30" : "border-gray-200 bg-gray-50/50 hover:border-gray-300"}
              `}
            />
            <div className="flex justify-between items-center">
              {touched && !comment.trim() ? (
                <p className="text-xs text-red-500">Please write a review.</p>
              ) : (
                <span />
              )}
              <span className="text-[11px] text-gray-300 ml-auto">{comment.length}/500</span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={commentLoading}
            className="flex items-center justify-center gap-2 bg-[#1a5a8a] text-white py-3 px-6 rounded-xl text-sm font-semibold
              hover:bg-[#154d76] active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm shadow-[#1a5a8a]/30"
          >
            {commentLoading ? (
              <><Loader2 size={16} className="animate-spin" /> Submitting...</>
            ) : (
              <><Send size={15} /> Submit Review</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddComment;