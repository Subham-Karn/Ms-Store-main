import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

const DeleteModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50  p-4"
      >
        <motion.div 
          initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4"
        >
          <div className="flex justify-center text-red-500"><AlertTriangle size={48} /></div>
          <h3 className="text-xl font-bold text-center">{title}</h3>
          <p className="text-gray-500 text-center text-sm">{message}</p>
          <div className="flex gap-3 pt-4">
            <button onClick={onClose} className="flex-1 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 font-semibold transition">Cancel</button>
            <button onClick={onConfirm} className="flex-1 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-semibold transition">Delete</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DeleteModal;