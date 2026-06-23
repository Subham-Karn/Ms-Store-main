import React, { useState, useRef } from 'react';
import {
  Plus, Trash2, Save, Upload, ChevronLeft, FileText,
  AlertCircle, CheckCircle2, X, Info, Image, Images,
  Tag, Package, Layers, Percent
} from 'lucide-react';
import Papa from 'papaparse';
import {toast} from "react-hot-toast"
import api from "../../axios/api"
const REQUIRED_FIELDS = [
  'title', 'orignalprice', 'discountprice', 'stock', 'skuid',
  'category', 'menu', 'shipping_charge',
];

const FIELD_META = {
  title:           { label: 'Title',           type: 'text',   example: 'Cotton T-Shirt Blue',                          required: true,  group: 'core'      },
  description:     { label: 'Description',     type: 'text',   example: 'IMAGE IS ONLY FOR REFERENCE…',                 required: false, group: 'core'      },
  skuid:           { label: 'SKU ID',          type: 'text',   example: 'SKU-001-BLU',                                  required: true,  group: 'core'      },
  orignalprice:    { label: 'Original Price',  type: 'number', example: '999',                                          required: true,  group: 'pricing'   },
  discountprice:   { label: 'Discount Price',  type: 'number', example: '799',                                          required: true,  group: 'pricing'   },
  offer:           { label: 'Offer %',         type: 'number', example: '20 (auto-calc)',                               required: false, group: 'pricing'   },
  shipping_charge: { label: 'Shipping Charge', type: 'number', example: '49',                                           required: true,  group: 'pricing'   },
  stock:           { label: 'Stock',           type: 'number', example: '50',                                           required: true,  group: 'inventory' },
  category:        { label: 'Category',        type: 'text',   example: 'Clothing',                                     required: true,  group: 'nav'       },
  subcategory:     { label: 'Sub-Category',    type: 'text',   example: "Men's Wear",                                   required: false, group: 'nav'       },
  menu:            { label: 'Menu',            type: 'text',   example: 'Men',                                          required: true,  group: 'nav'       },
  submenu:         { label: 'Sub-Menu',        type: 'text',   example: 'Tops',                                         required: false, group: 'nav'       },
  tags:            { label: 'Tags',            type: 'text[]', example: 'cotton,summer,casual',                         required: false, group: 'tags'      },
  bunner:          { label: 'Banner URL',      type: 'url',    example: 'https://cdn.io/banner.jpg',                    required: false, group: 'media'     },
  thumbnails:      { label: 'Thumbnails',      type: 'url[]',  example: 'https://cdn.io/t1.jpg,https://cdn.io/t2.jpg',  required: false, group: 'media'     },
};

const GROUP_LABELS = {
  core:      'Product',
  pricing:   'Pricing',
  inventory: 'Inventory',
  nav:       'Navigation',
  tags:      'Tags',
  media:     'Media',
};

const isValidUrl = (s) => { try { new URL(s); return true; } catch { return false; } };
const parseList  = (raw) => raw ? String(raw).split(',').map(s => s.trim()).filter(Boolean) : [];
const calcOffer  = (orig, disc) => {
  const o = Number(orig), d = Number(disc);
  if (!o || !d || d >= o) return 0;
  return Math.round(((o - d) / o) * 100);
};

const emptyProduct = () => ({
  id: Date.now() + Math.random(),
  title: '',
  description: 'IMAGE IS ONLY FOR REFERENCE, ACTUAL SERIAL NUMBER MAY HAVE DIFFERENT NUMBER.',
  bunner: '',
  thumbnails: [],
  _thumbnails_raw: '',
  orignalprice: '',
  discountprice: '',
  offer: 0,
  stock: '',
  skuid: '',
  category: '',
  subcategory: '',
  menu: '',
  submenu: '',
  tags: [],
  _tags_raw: '',
  shipping_charge: '',
});

const EditCell = ({ value, onChange, placeholder = '', mono = false }) => (
  <input
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    className={`w-full px-2 py-1.5 rounded-lg bg-transparent hover:bg-gray-50 focus:bg-white
      focus:ring-1 focus:ring-[#1a5a8a]/25 focus:outline-none text-[11.5px] text-gray-700
      transition-all placeholder:text-gray-300 ${mono ? 'font-mono' : ''}`}
  />
);

const UrlCell = ({ value, onChange, placeholder }) => {
  const valid = value && isValidUrl(value);
  const bad   = value && !valid;
  return (
    <div className="min-w-[160px] space-y-1">
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder || 'https://…'}
        className={`w-full px-2 py-1.5 rounded-lg bg-transparent hover:bg-gray-50 focus:bg-white
          text-[11px] transition-all placeholder:text-gray-300 focus:outline-none
          ${bad ? 'ring-1 ring-red-300 text-red-500' : 'focus:ring-1 focus:ring-[#1a5a8a]/25 text-gray-700'}`}
      />
      {valid && (
        <a href={value} target="_blank" rel="noopener noreferrer" title={value}
          className="inline-flex items-center gap-1 text-[9.5px] bg-[#1a5a8a]/8 text-[#1a5a8a]
            px-2 py-0.5 rounded-full hover:bg-[#1a5a8a]/15 transition-colors truncate max-w-full">
          <Image size={8} />{value.replace(/^https?:\/\//, '').slice(0, 24)}{value.length > 30 ? '…' : ''}
        </a>
      )}
    </div>
  );
};

const ThumbCell = ({ raw, onChange }) => {
  const urls    = parseList(raw);
  const invalid = urls.filter(u => !isValidUrl(u));
  return (
    <div className="min-w-[190px] space-y-1">
      <input value={raw} onChange={e => onChange(e.target.value)} placeholder="url1,url2,url3"
        className={`w-full px-2 py-1.5 rounded-lg bg-transparent hover:bg-gray-50 focus:bg-white
          text-[11px] transition-all placeholder:text-gray-300 focus:outline-none
          ${invalid.length ? 'ring-1 ring-red-300 text-red-500' : 'focus:ring-1 focus:ring-[#1a5a8a]/25 text-gray-700'}`}
      />
      {urls.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {urls.map((u, i) => (
            <span key={i} className={`inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full
              ${isValidUrl(u) ? 'bg-[#1a5a8a]/8 text-[#1a5a8a]' : 'bg-red-50 text-red-400'}`}>
              <Images size={7} />{u.replace(/^https?:\/\//, '').slice(0, 16)}{u.length > 22 ? '…' : ''}
            </span>
          ))}
        </div>
      )}
      {invalid.length > 0 && <p className="text-[9px] text-red-400">{invalid.length} invalid URL(s)</p>}
    </div>
  );
};

const TagsCell = ({ raw, onChange }) => {
  const tags = parseList(raw);
  return (
    <div className="min-w-[140px] space-y-1">
      <input value={raw} onChange={e => onChange(e.target.value)} placeholder="tag1,tag2,tag3"
        className="w-full px-2 py-1.5 rounded-lg bg-transparent hover:bg-gray-50 focus:bg-white
          focus:ring-1 focus:ring-[#1a5a8a]/25 focus:outline-none text-[11px] text-gray-700
          transition-all placeholder:text-gray-300"
      />
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.map((t, i) => (
            <span key={i} className="text-[9px] bg-violet-50 text-violet-500 px-1.5 py-0.5 rounded-full">{t}</span>
          ))}
        </div>
      )}
    </div>
  );
};

const OfferBadge = ({ orig, disc }) => {
  const pct = calcOffer(orig, disc);
  if (!pct) return <span className="text-[10px] text-gray-300">—</span>;
  return (
    <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">
      <Percent size={8} />{pct}%
    </span>
  );
};

const CSVInstructionModal = ({ onClose, onFileSelect }) => {
  const fileRef = useRef();
  const groups = Object.entries(
    Object.entries(FIELD_META).reduce((acc, [key, info]) => {
      if (!acc[info.group]) acc[info.group] = [];
      acc[info.group].push([key, info]);
      return acc;
    }, {})
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1a5a8a]/10 flex items-center justify-center">
              <FileText size={18} className="text-[#1a5a8a]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-800">CSV Upload Guide</h2>
              <p className="text-[11px] text-gray-400">Match these exact column headers in your file</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={16} className="text-gray-400" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5 space-y-5">
          <div className="flex gap-3 bg-amber-50 border border-amber-100 rounded-xl p-3.5">
            <Info size={14} className="text-amber-500 mt-0.5 shrink-0" />
            <div className="text-[11.5px] text-amber-700 leading-relaxed space-y-1">
              <p>Use <strong>exact column headers</strong> (case-sensitive) in row 1. Extra columns are ignored.</p>
              <p>For <code className="bg-amber-100 px-1 rounded">thumbnails</code> and <code className="bg-amber-100 px-1 rounded">tags</code>, separate multiple values with a <strong>comma</strong> inside the same cell.</p>
              <p><code className="bg-amber-100 px-1 rounded">offer</code> is <strong>auto-calculated</strong> — you can omit it.</p>
            </div>
          </div>

          {groups.map(([group, fields]) => (
            <div key={group}>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1.5">
                {group === 'media'   && <Image size={10} />}
                {group === 'nav'     && <Layers size={10} />}
                {group === 'tags'    && <Tag size={10} />}
                {group === 'pricing' && <Percent size={10} />}
                {GROUP_LABELS[group]}
              </p>
              <div className="rounded-xl border border-gray-100 overflow-hidden mb-1">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-3 py-2 text-[9.5px] uppercase tracking-widest text-gray-400 font-medium">Column</th>
                      <th className="text-left px-3 py-2 text-[9.5px] uppercase tracking-widest text-gray-400 font-medium">Type</th>
                      <th className="text-left px-3 py-2 text-[9.5px] uppercase tracking-widest text-gray-400 font-medium">Example</th>
                      <th className="text-left px-3 py-2 text-[9.5px] uppercase tracking-widest text-gray-400 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {fields.map(([key, info]) => (
                      <tr key={key} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-3 py-2">
                          <code className="bg-[#1a5a8a]/8 text-[#1a5a8a] px-1.5 py-0.5 rounded text-[10.5px] font-mono">{key}</code>
                        </td>
                        <td className="px-3 py-2 text-gray-400 text-[10.5px]">{info.type}</td>
                        <td className="px-3 py-2 text-gray-400 font-mono text-[10px] max-w-[180px] truncate" title={info.example}>{info.example}</td>
                        <td className="px-3 py-2">
                          {info.required
                            ? <span className="bg-red-50 text-red-500 text-[9.5px] px-2 py-0.5 rounded-full font-medium">Required</span>
                            : key === 'offer'
                              ? <span className="bg-sky-50 text-sky-500 text-[9.5px] px-2 py-0.5 rounded-full">Auto-calc</span>
                              : <span className="bg-gray-100 text-gray-400 text-[9.5px] px-2 py-0.5 rounded-full">Optional</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">Sample CSV (first 2 rows)</p>
            <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
              <pre className="text-[10px] text-green-400 font-mono whitespace-pre leading-5">{
`title,skuid,orignalprice,discountprice,stock,shipping_charge,category,menu,tags,bunner,thumbnails
Cotton T-Shirt,SKU-001,999,799,50,49,Clothing,Men,"cotton,casual",https://cdn.io/b1.jpg,"https://cdn.io/t1.jpg,https://cdn.io/t2.jpg"
Denim Jeans,SKU-002,1999,1499,30,0,Clothing,Men,denim,https://cdn.io/b2.jpg,https://cdn.io/j1.jpg`
              }</pre>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 pt-4 border-t border-gray-50 flex gap-3 justify-end shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">
            Cancel
          </button>
          <button onClick={() => fileRef.current.click()}
            className="px-5 py-2 bg-[#1a5a8a] text-white text-sm rounded-xl flex items-center gap-2 hover:bg-[#154d78] transition-colors shadow-sm">
            <Upload size={14} /> Choose CSV File
          </button>
          <input ref={fileRef} type="file" accept=".csv" className="hidden"
            onChange={e => { onFileSelect(e); onClose(); }} />
        </div>
      </div>
    </div>
  );
};
const ValidationBanner = ({ result, onDismiss }) => {
  if (!result) return null;
  const hasErrors = result.errors.length > 0;
  return (
    <div className={`rounded-xl border p-4 flex gap-3 mb-4
      ${hasErrors ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
      <div className="shrink-0 mt-0.5">
        {hasErrors ? <AlertCircle size={15} className="text-red-500" /> : <CheckCircle2 size={15} className="text-emerald-500" />}
      </div>
      <div className="flex-1 min-w-0">
        {hasErrors ? (
          <>
            <p className="text-xs font-semibold text-red-700 mb-1">
              {result.errors.length} issue(s) found — rows imported with defaults where possible
            </p>
            <ul className="space-y-0.5">
              {result.errors.slice(0, 7).map((e, i) => <li key={i} className="text-[11px] text-red-600">{e}</li>)}
              {result.errors.length > 7 && <li className="text-[11px] text-red-400">…and {result.errors.length - 7} more</li>}
            </ul>
          </>
        ) : (
          <p className="text-xs font-semibold text-emerald-700">
            {result.count} product(s) imported — all fields validated ✓
          </p>
        )}
      </div>
      <button onClick={onDismiss} className="shrink-0 p-1 hover:bg-black/5 rounded-lg">
        <X size={13} className="text-gray-400" />
      </button>
    </div>
  );
};

const DataCell = ({ label, children }) => (
  <div className="w-full xl:w-auto xl:px-2 xl:py-3 flex xl:block items-center justify-between
    border-b border-gray-50/50 xl:border-none pb-2 xl:pb-0 last:border-none last:pb-0">
    <span className="xl:hidden text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-1/3 shrink-0">
      {label}
    </span>
    <div className="w-2/3 xl:w-full">
      {children}
    </div>
  </div>
);

const GRID_COLS = "40px minmax(160px,2fr) 110px 80px 90px 90px 70px 80px 120px 120px 100px 120px minmax(140px,1fr) minmax(140px,1fr) minmax(190px,1fr) 50px";

const ProductGridManager = ({ catalog, addRow, removeRow, updateItem, setShowCSVModal }) => {
  const desktopGridColumns = "40px minmax(160px, 2fr) 110px 80px 90px 90px 70px 80px 120px 120px 100px 120px minmax(140px, 1fr) minmax(140px, 1fr) minmax(140px, 1fr) 50px";

  return (
    <div className="bg-white rounded border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)] overflow-hidden">
      
      {/* ── Grid Container ── */}
      <div className="overflow-x-auto">
        <div className="min-w-full xl:min-w-[1600px] flex flex-col">
          
          {/* ── Desktop Header Row (Hidden on Mobile) ── */}
          <div 
            className="hidden xl:grid bg-[#1a5a8a] text-[10px] uppercase tracking-widest text-white font-bold"
            style={{ gridTemplateColumns: desktopGridColumns }}
          >
            <div className="p-4">#</div>
            <div className="p-4">Title</div>
            <div className="p-4">SKU ID</div>
            <div className="p-4">Stock</div>
            <div className="p-4">Orig. ₹</div>
            <div className="p-4">Disc. ₹</div>
            <div className="p-4">Offer</div>
            <div className="p-4">Ship ₹</div>
            <div className="p-4">Category</div>
            <div className="p-4">Sub-Cat</div>
            <div className="p-4">Menu</div>
            <div className="p-4">Sub-Menu</div>
            <div className="p-4">Tags</div>
            <div className="p-4">Banner URL</div>
            <div className="p-4">Thumbnails</div>
            <div className="p-4 text-center">Action</div>
          </div>

          {/* ── Body Rows (Cards on Mobile, Grid on Desktop) ── */}
          <div className="flex flex-col divide-y divide-gray-50/80">
            {catalog.map((item, index) => (
              <div 
                key={item.id} 
                className="group flex flex-col xl:grid p-4 xl:p-0 hover:bg-gray-50/40 transition-colors gap-3 xl:gap-0 items-start xl:items-center"
                style={{ 
                  // On extra-large screens (xl), apply the grid. Otherwise, it naturally flexes as a column (Card).
                  gridTemplateColumns: window.innerWidth >= 1280 ? desktopGridColumns : '1fr' 
                }}
              >
                {/* Mobile Card Header / Desktop # */}
                <div className="flex justify-between items-center w-full xl:w-auto xl:px-4 xl:py-3">
                  <span className="text-xs font-mono text-gray-400 font-bold bg-gray-50 xl:bg-transparent px-2 py-1 xl:p-0 rounded-md">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {/* Delete Button (Visible only on mobile header, hidden on desktop here) */}
                  <button onClick={() => removeRow(item.id)} className="xl:hidden p-2 text-red-400 hover:bg-red-50 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Helper component for Mobile Labels */}
                <DataCell label="Product Title">
                  <EditCell value={item.title} onChange={v => updateItem(item.id, 'title', v)} placeholder="Product title" />
                </DataCell>
                
                <DataCell label="SKU ID">
                  <EditCell value={item.skuid} onChange={v => updateItem(item.id, 'skuid', v)} placeholder="SKU-001" mono />
                </DataCell>
                
                <DataCell label="Stock">
                  <EditCell value={item.stock} onChange={v => updateItem(item.id, 'stock', v)} placeholder="0" />
                </DataCell>

                <DataCell label="Orig. Price ₹">
                  <EditCell value={item.orignalprice} onChange={v => updateItem(item.id, 'orignalprice', v)} placeholder="0" />
                </DataCell>
                
                <DataCell label="Disc. Price ₹">
                  <EditCell value={item.discountprice} onChange={v => updateItem(item.id, 'discountprice', v)} placeholder="0" />
                </DataCell>
                
                <DataCell label="Offer">
                  <OfferBadge orig={item.orignalprice} disc={item.discountprice} />
                </DataCell>
                
                <DataCell label="Shipping ₹">
                  <EditCell value={item.shipping_charge} onChange={v => updateItem(item.id, 'shipping_charge', v)} placeholder="0" />
                </DataCell>

                <DataCell label="Category">
                  <EditCell value={item.category} onChange={v => updateItem(item.id, 'category', v)} placeholder="Category" />
                </DataCell>
                
                <DataCell label="Sub-Category">
                  <EditCell value={item.subcategory} onChange={v => updateItem(item.id, 'subcategory', v)} placeholder="Optional" />
                </DataCell>
                
                <DataCell label="Menu">
                  <EditCell value={item.menu} onChange={v => updateItem(item.id, 'menu', v)} placeholder="Menu" />
                </DataCell>
                
                <DataCell label="Sub-Menu">
                  <EditCell value={item.submenu} onChange={v => updateItem(item.id, 'submenu', v)} placeholder="Optional" />
                </DataCell>

                <DataCell label="Tags">
                  <TagsCell raw={item._tags_raw} onChange={v => updateItem(item.id, '_tags_raw', v)} />
                </DataCell>

                <DataCell label="Banner URL">
                  <UrlCell value={item.bunner} onChange={v => updateItem(item.id, 'bunner', v)} placeholder="https://..." />
                </DataCell>
                
                <DataCell label="Thumbnails">
                  <ThumbCell raw={item._thumbnails_raw} onChange={v => updateItem(item.id, '_thumbnails_raw', v)} />
                </DataCell>

                {/* Desktop Delete Action (Hidden on mobile as it's at the top of the card) */}
                <div className="hidden xl:flex items-center justify-center w-full px-2 py-3">
                  <button onClick={() => removeRow(item.id)} className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 rounded-xl transition-all">
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>

              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ── Empty State ── */}
      {catalog.length === 0 && (
        <div className="py-24 flex flex-col items-center text-center gap-3">
          <div className="w-16 h-16 rounded-3xl bg-gray-50 border border-gray-100 flex items-center justify-center">
            <Package size={24} className="text-gray-300" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">No products added yet</p>
            <p className="text-xs text-gray-400 mt-1">Upload a CSV or click "Add Row" to begin</p>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={addRow} className="text-xs font-semibold px-5 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl transition-colors flex items-center gap-2">
              <Plus size={14} /> Add Row
            </button>
            <button onClick={() => setShowCSVModal(true)} className="text-xs font-semibold px-5 py-2.5 bg-blue-50/50 hover:bg-blue-50 text-blue-600 rounded-xl border border-blue-100/50 transition-colors flex items-center gap-2">
              <Upload size={14} /> Upload CSV
            </button>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      {catalog.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-50 flex items-center justify-between bg-gray-50/30">
          <button onClick={addRow} className="text-xs font-bold text-gray-400 hover:text-gray-800 flex items-center gap-1.5 transition-colors">
            <Plus size={14} /> ADD ANOTHER ROW
          </button>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
            {catalog.length} item{catalog.length !== 1 ? 's' : ''} queued
          </span>
        </div>
      )}
    </div>
  );
};
const ProductManager = ({ onClose , user}) => {
  const [catalog, setCatalog]           = useState([]);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [validation, setValidation]     = useState(null);

  const updateItem = (id, field, value) => {
    setCatalog(prev => prev.map(item => {
      if (item.id !== id) return item;
      if (field === '_thumbnails_raw') return { ...item, _thumbnails_raw: value, thumbnails: parseList(value) };
      if (field === '_tags_raw')       return { ...item, _tags_raw: value, tags: parseList(value) };
      if (field === 'orignalprice')    return { ...item, orignalprice: value, offer: calcOffer(value, item.discountprice) };
      if (field === 'discountprice')   return { ...item, discountprice: value, offer: calcOffer(item.orignalprice, value) };
      return { ...item, [field]: value };
    }));
  };

  const addRow    = () => setCatalog(prev => [...prev, emptyProduct()]);
  const removeRow = (id) => setCatalog(prev => prev.filter(item => item.id !== id));

  const validateAndImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const errors  = [];
        const headers = results.meta.fields || [];

        const missing = REQUIRED_FIELDS.filter(f => !headers.includes(f));
        if (missing.length) errors.push(`Missing required columns: ${missing.join(', ')}`);

        const formattedData = results.data.map((row, idx) => {
          const rn = idx + 2;

          ['orignalprice', 'discountprice', 'stock', 'shipping_charge', 'offer'].forEach(f => {
            if (row[f] !== undefined && row[f] !== '' && isNaN(Number(row[f])))
              errors.push(`Row ${rn}: "${f}" is not a number ("${row[f]}")`);
          });

          ['title', 'category', 'skuid', 'menu'].forEach(f => {
            if (!row[f] || !String(row[f]).trim())
              errors.push(`Row ${rn}: "${f}" is empty`);
          });

          const orig = Number(row.orignalprice), disc = Number(row.discountprice);
          if (!isNaN(orig) && !isNaN(disc) && disc > orig)
            errors.push(`Row ${rn}: discountprice (${disc}) > orignalprice (${orig})`);

          if (row.bunner?.trim() && !isValidUrl(row.bunner.trim()))
            errors.push(`Row ${rn}: bunner is not a valid URL`);

          const thumbUrls = parseList(row.thumbnails);
          thumbUrls.forEach((u, ti) => {
            if (!isValidUrl(u)) errors.push(`Row ${rn}: thumbnails[${ti + 1}] invalid URL`);
          });

          return {
            id: Date.now() + idx + Math.random(),
            title:           row.title || '',
            description:     row.description || 'IMAGE IS ONLY FOR REFERENCE, ACTUAL SERIAL NUMBER MAY HAVE DIFFERENT NUMBER.',
            bunner:          row.bunner?.trim() || '',
            thumbnails:      thumbUrls,
            _thumbnails_raw: row.thumbnails || '',
            orignalprice:    row.orignalprice || '',
            discountprice:   row.discountprice || '',
            offer:           row.offer !== undefined && row.offer !== ''
                               ? Number(row.offer)
                               : calcOffer(Number(row.orignalprice), Number(row.discountprice)),
            stock:           row.stock || '',
            skuid:           row.skuid || '',
            category:        row.category || '',
            subcategory:     row.subcategory || '',
            menu:            row.menu || '',
            submenu:         row.submenu || '',
            tags:            parseList(row.tags),
            _tags_raw:       row.tags || '',
            shipping_charge: row.shipping_charge || '',
          };
        });

        setCatalog(prev => [...prev, ...formattedData]);
        setValidation({ errors, count: formattedData.length });
        errors.length
          ? toast.error(`Imported with ${errors.length} issue(s). Please review.`, 'error')
          : toast.success(`${formattedData.length} product(s) imported successfully!`);
      },
      error: () => toast.error('Failed to parse CSV. Please check the file format.', 'error'),
    });
  };

const saveBatch = async () => {
  if (!catalog.length) { 
    toast.error('No products to save.', { id: 'error' }); 
    return; 
  }

  const productsToSave = catalog.map(({ _thumbnails_raw, _tags_raw, id, ...rest }) => rest);
  const currentUserId = user?.id || user?.uid; 

  const loadingToast = toast.loading('Saving inventory to database...');

  try {
    const response = await api.post('/products/bulk', {
      userId: currentUserId,
      products: productsToSave
    });

    if (response.data.success) {
      toast.success(`${productsToSave.length} product(s) saved to inventory!`, { id: loadingToast });
      setCatalog([]);
    }
  } catch (error) {
    console.error("Batch Save Error:", error);
    toast.error(
      error.response?.data?.message || 'Failed to save products to database.', 
      { id: loadingToast }
    );
  }
};

  return (
    <>
      {showCSVModal && (
        <CSVInstructionModal
          onClose={() => setShowCSVModal(false)}
          onFileSelect={validateAndImportCSV}
        />
      )}

      <div className="min-h-screen font-sans ">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            {onClose && (
              <button onClick={onClose} className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-gray-200 transition-all">
                <ChevronLeft size={18} className="text-gray-500" />
              </button>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Inventory Manager</h1>
              <p className="text-[11px] text-gray-400 mt-0.5">Bulk add via CSV or manual grid entry</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {catalog.length > 0 && (
              <span className="text-[11px] bg-[#1a5a8a]/10 text-[#1a5a8a] font-semibold px-3 py-1.5 rounded-xl">
                {catalog.length} item{catalog.length !== 1 ? 's' : ''}
              </span>
            )}
            <button onClick={addRow}
              className="px-3.5 py-2 bg-white border border-gray-200 rounded flex items-center gap-1.5 text-xs text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
              <Plus size={14} /> Add Row
            </button>
            <button onClick={() => setShowCSVModal(true)}
              className="px-3.5 py-2 bg-white border border-gray-200 rounded flex items-center gap-1.5 text-xs text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
              <Upload size={14} /> Upload CSV
            </button>
            <button onClick={saveBatch}
              className="px-5 py-2 bg-[#1a5a8a] text-white rounded text-xs flex items-center gap-1.5 hover:bg-[#154d78] transition-colors shadow-sm font-medium">
              <Save size={14} /> Save All
            </button>
          </div>
        </div>

        {/* Validation Banner */}
        <ValidationBanner result={validation} onDismiss={() => setValidation(null)} />
        <ProductGridManager
          catalog={catalog}
          addRow={addRow}
          removeRow={removeRow}
          updateItem={updateItem}
          setShowCSVModal={setShowCSVModal}
        />
      </div>
    </>
  );
};

export default ProductManager;