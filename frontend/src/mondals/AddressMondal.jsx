import React, { useState } from 'react';
import { X, Loader, MapPin, Check } from 'lucide-react';

const FIELD_CONFIG = {
  fullName:    { label: 'Full Name',       placeholder: 'John Doe' },
  phoneNumber: { label: 'Phone Number',    placeholder: '9876543210' },
  email:       { label: 'Email',           placeholder: 'john@example.com' },
  street:      { label: 'Street Address',  placeholder: '123 Main Street', full: true },
  landmark:    { label: 'Landmark',        placeholder: 'Near park (optional)', full: true },
  city:        { label: 'City',            placeholder: 'Mumbai' },
  state:       { label: 'State',           placeholder: 'Maharashtra' },
  pincode:     { label: 'Pincode',         placeholder: '400001' },
};

const AddressModal = ({ isOpen, onClose, address, setAddress, errors, onSave, isLoading, isEditing }) => {
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) =>
    setAddress({ ...address, [e.target.name]: e.target.value });

  const handleSave = async () => {
    const result = await onSave();
    if (result?.success) {
      setSaved(true);
      setTimeout(() => { setSaved(false); onClose(); }, 1400);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto shadow-lg">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-[#1a5a8a]" />
            <h2 className="text-sm font-semibold text-gray-800">
              {isEditing ? 'Edit Address' : 'Add New Address'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Fields */}
        <div className="px-5 py-4 grid grid-cols-2 gap-x-3 gap-y-4">
          {Object.entries(FIELD_CONFIG).map(([key, cfg]) => (
            <div key={key} className={cfg.full ? 'col-span-2' : 'col-span-1'}>
              <label className="block text-xs text-gray-500 mb-1">{cfg.label}</label>
              <input
                name={key}
                value={address[key] ?? ''}
                onChange={handleChange}
                placeholder={cfg.placeholder}
                className={`w-full px-3 py-2 text-sm border rounded-md outline-none
                  bg-white text-gray-800 placeholder-gray-300
                  focus:border-[#1a5a8a] focus:ring-1 focus:ring-[#1a5a8a]/20 transition
                  ${errors[key] ? 'border-red-400' : 'border-gray-200'}`}
              />
              {errors[key] && (
                <p className="text-xs text-red-500 mt-1">{errors[key]}</p>
              )}
            </div>
          ))}

          {/* Default toggle */}
          <label className="col-span-2 flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              name="isdefault"
              checked={address.isdefault ?? false}
              onChange={(e) => setAddress({ ...address, isdefault: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-8 h-4 rounded-full bg-gray-200 peer-checked:bg-[#1a5a8a]
                            relative transition-colors duration-200 flex-shrink-0
                            after:content-[''] after:absolute after:top-0.5 after:left-0.5
                            after:w-3 after:h-3 after:bg-white after:rounded-full
                            after:transition-transform after:duration-200
                            peer-checked:after:translate-x-4" />
            <span className="text-xs text-gray-600">Set as default address</span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-md
                       hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || saved}
            className={`px-5 py-2 text-sm font-medium rounded-md text-white flex items-center gap-1.5
                        transition-all active:scale-95
                        ${saved ? 'bg-green-600' : 'bg-[#1a5a8a] hover:bg-[#14476a]'}
                        disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {isLoading ? (
              <><Loader size={14} className="animate-spin" /> Saving</>
            ) : saved ? (
              <><Check size={14} /> Saved</>
            ) : (
              'Save Address'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddressModal;