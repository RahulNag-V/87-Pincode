import React, { useState, useRef, useEffect } from 'react';
import {
  SlidersHorizontal,
  ChevronDown,
  X,
  RotateCcw,
  Check,
  Tag,
  ArrowUpDown
} from 'lucide-react';

interface ShopFilterBarProps {
  allSizes: string[];
  selectedSizes: string[];
  onToggleSize: (size: string) => void;
  allColors: string[];
  selectedColors: string[];
  onToggleColor: (color: string) => void;
  priceRange: number;
  onPriceChange: (price: number) => void;
  inStockOnly: boolean;
  onToggleInStock: (val: boolean) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  selectedFilterTag: string;
  onSelectFilterTag: (tag: string) => void;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  totalCount: number;
}

export const ShopFilterBar: React.FC<ShopFilterBarProps> = ({
  allSizes,
  selectedSizes,
  onToggleSize,
  allColors,
  selectedColors,
  onToggleColor,
  priceRange,
  onPriceChange,
  inStockOnly,
  onToggleInStock,
  sortBy,
  onSortChange,
  selectedFilterTag,
  onSelectFilterTag,
  hasActiveFilters,
  onResetFilters,
  totalCount
}) => {
  // Desktop active popover dropdown states
  const [openDropdown, setOpenDropdown] = useState<'size' | 'color' | 'price' | 'tag' | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeFilterCount =
    (selectedFilterTag ? 1 : 0) +
    selectedSizes.length +
    selectedColors.length +
    (priceRange < 100000 ? 1 : 0) +
    (inStockOnly ? 1 : 0);

  return (
    <div ref={barRef} className="w-full space-y-3">
      {/* Primary Horizontal Filter & Sort Bar */}
      <div className="bg-[#0C0C0C]/90 backdrop-blur-md border border-[#1C1C1C] rounded-lg p-2 sm:p-2.5 flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: Desktop Quick Dropdowns */}
        <div className="hidden lg:flex items-center space-x-2 flex-wrap">
          {/* Tag Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === 'tag' ? null : 'tag')}
              className={`px-3 py-1.5 rounded text-xs uppercase tracking-wider font-medium flex items-center space-x-1.5 border transition-all ${
                selectedFilterTag
                  ? 'bg-[#C9A227]/15 border-[#C9A227] text-[#E0B84F] font-semibold'
                  : 'bg-[#141414] border-[#222222] text-[#D5D2CA] hover:border-[#C9A227]/50'
              }`}
            >
              <span>
                {selectedFilterTag === 'featured'
                  ? 'Featured'
                  : selectedFilterTag === 'new_arrival'
                  ? 'New Arrivals'
                  : selectedFilterTag === 'bestseller'
                  ? 'Bestsellers'
                  : 'Curated'}
              </span>
              <ChevronDown size={13} className={openDropdown === 'tag' ? 'rotate-180 transition-transform' : 'transition-transform'} />
            </button>

            {openDropdown === 'tag' && (
              <div className="absolute top-full left-0 mt-2 w-44 bg-[#111111] border border-[#242424] rounded-md shadow-2xl p-1.5 z-40 space-y-1 animate-in fade-in zoom-in-95">
                {[
                  { label: 'All Garments', value: '' },
                  { label: 'Featured Pieces', value: 'featured' },
                  { label: 'New Arrivals', value: 'new_arrival' },
                  { label: 'Bestsellers', value: 'bestseller' }
                ].map(item => (
                  <button
                    key={item.value}
                    onClick={() => {
                      onSelectFilterTag(item.value);
                      setOpenDropdown(null);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition-colors flex items-center justify-between ${
                      selectedFilterTag === item.value
                        ? 'bg-[#C9A227]/20 text-[#E0B84F] font-semibold'
                        : 'text-[#D5D2CA] hover:bg-[#1A1A1A] hover:text-[#F5F2EA]'
                    }`}
                  >
                    <span>{item.label}</span>
                    {selectedFilterTag === item.value && <Check size={12} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Size Popover */}
          {allSizes.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === 'size' ? null : 'size')}
                className={`px-3 py-1.5 rounded text-xs uppercase tracking-wider font-medium flex items-center space-x-1.5 border transition-all ${
                  selectedSizes.length > 0
                    ? 'bg-[#C9A227]/15 border-[#C9A227] text-[#E0B84F] font-semibold'
                    : 'bg-[#141414] border-[#222222] text-[#D5D2CA] hover:border-[#C9A227]/50'
                }`}
              >
                <span>Size {selectedSizes.length > 0 && `(${selectedSizes.length})`}</span>
                <ChevronDown size={13} className={openDropdown === 'size' ? 'rotate-180 transition-transform' : 'transition-transform'} />
              </button>

              {openDropdown === 'size' && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-[#111111] border border-[#242424] rounded-md shadow-2xl p-3 z-40 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[#222222]">
                    <span className="text-[10px] uppercase tracking-widest text-[#888888] font-bold">
                      Available Sizes
                    </span>
                    {selectedSizes.length > 0 && (
                      <button
                        onClick={() => selectedSizes.forEach(s => onToggleSize(s))}
                        className="text-[10px] text-[#C9A227] hover:underline"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 max-h-48 overflow-y-auto pr-1">
                    {allSizes.map(size => {
                      const isSelected = selectedSizes.includes(size);
                      return (
                        <button
                          key={size}
                          onClick={() => onToggleSize(size)}
                          className={`py-1.5 rounded text-[11px] font-medium transition-all ${
                            isSelected
                              ? 'bg-[#C9A227] text-[#080808] font-bold shadow-sm'
                              : 'bg-[#181818] border border-[#262626] text-[#D5D2CA] hover:border-[#C9A227]'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Color Popover */}
          {allColors.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === 'color' ? null : 'color')}
                className={`px-3 py-1.5 rounded text-xs uppercase tracking-wider font-medium flex items-center space-x-1.5 border transition-all ${
                  selectedColors.length > 0
                    ? 'bg-[#C9A227]/15 border-[#C9A227] text-[#E0B84F] font-semibold'
                    : 'bg-[#141414] border-[#222222] text-[#D5D2CA] hover:border-[#C9A227]/50'
                }`}
              >
                <span>Color {selectedColors.length > 0 && `(${selectedColors.length})`}</span>
                <ChevronDown size={13} className={openDropdown === 'color' ? 'rotate-180 transition-transform' : 'transition-transform'} />
              </button>

              {openDropdown === 'color' && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-[#111111] border border-[#242424] rounded-md shadow-2xl p-3 z-40 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[#222222]">
                    <span className="text-[10px] uppercase tracking-widest text-[#888888] font-bold">
                      Palette
                    </span>
                    {selectedColors.length > 0 && (
                      <button
                        onClick={() => selectedColors.forEach(c => onToggleColor(c))}
                        className="text-[10px] text-[#C9A227] hover:underline"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                    {allColors.map(color => {
                      const isSelected = selectedColors.includes(color);
                      return (
                        <button
                          key={color}
                          onClick={() => onToggleColor(color)}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition-colors ${
                            isSelected
                              ? 'bg-[#C9A227]/20 text-[#E0B84F] font-semibold'
                              : 'text-[#D5D2CA] hover:bg-[#1A1A1A]'
                          }`}
                        >
                          <span>{color}</span>
                          {isSelected && <Check size={12} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Price Range Popover */}
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === 'price' ? null : 'price')}
              className={`px-3 py-1.5 rounded text-xs uppercase tracking-wider font-medium flex items-center space-x-1.5 border transition-all ${
                priceRange < 100000
                  ? 'bg-[#C9A227]/15 border-[#C9A227] text-[#E0B84F] font-semibold'
                  : 'bg-[#141414] border-[#222222] text-[#D5D2CA] hover:border-[#C9A227]/50'
              }`}
            >
              <span>{priceRange < 100000 ? `Under ₹${priceRange.toLocaleString('en-IN')}` : 'Price Range'}</span>
              <ChevronDown size={13} className={openDropdown === 'price' ? 'rotate-180 transition-transform' : 'transition-transform'} />
            </button>

            {openDropdown === 'price' && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-[#111111] border border-[#242424] rounded-md shadow-2xl p-4 z-40 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between mb-3 text-xs">
                  <span className="text-[10px] uppercase tracking-widest text-[#888888] font-bold">
                    Max Price
                  </span>
                  <span className="text-sm font-bold text-[#E0B84F]">
                    ₹{priceRange.toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="100000"
                  step="1000"
                  value={priceRange}
                  onChange={e => onPriceChange(Number(e.target.value))}
                  className="w-full accent-[#C9A227] bg-[#222222] h-1.5 rounded cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#666666] mt-2">
                  <span>₹1,000</span>
                  <span>₹50,000</span>
                  <span>₹100,000</span>
                </div>
              </div>
            )}
          </div>

          {/* In Stock Toggle Pill */}
          <button
            onClick={() => onToggleInStock(!inStockOnly)}
            className={`px-3 py-1.5 rounded text-xs uppercase tracking-wider font-medium flex items-center space-x-1.5 border transition-all ${
              inStockOnly
                ? 'bg-[#C9A227]/20 border-[#C9A227] text-[#E0B84F] font-semibold'
                : 'bg-[#141414] border-[#222222] text-[#888888] hover:text-[#D5D2CA] hover:border-[#C9A227]/40'
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${inStockOnly ? 'bg-[#C9A227]' : 'bg-[#444444]'}`} />
            <span>In Stock Only</span>
          </button>
        </div>

        {/* Mobile Filter Button (Activates Bottom Sheet) */}
        <button
          onClick={() => setMobileDrawerOpen(true)}
          className="lg:hidden px-3.5 py-1.5 rounded bg-[#141414] border border-[#282828] hover:border-[#C9A227] text-xs uppercase tracking-wider font-semibold flex items-center space-x-2 text-[#F5F2EA]"
        >
          <SlidersHorizontal size={13} className="text-[#C9A227]" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-[#C9A227] text-[#080808] text-[9.5px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Right: Garment Count & Sort Selector */}
        <div className="flex items-center space-x-3 ml-auto">
          <span className="hidden sm:inline-block text-[11px] uppercase tracking-[0.2em] text-[#888888] font-medium whitespace-nowrap">
            {totalCount} Garments
          </span>

          <div className="relative">
            <select
              id="shop-sort-selector"
              value={sortBy}
              onChange={e => onSortChange(e.target.value)}
              className="appearance-none bg-[#141414] border border-[#242424] focus:border-[#C9A227] rounded px-3 py-1.5 pr-7 text-xs text-[#F5F2EA] uppercase tracking-wider font-medium outline-none cursor-pointer"
            >
              <option value="featured">Sort: Featured</option>
              <option value="newest">Sort: Newest</option>
              <option value="bestseller">Sort: Bestsellers</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-2.5 text-[#888888] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Active Filter Badges Strip */}
      {hasActiveFilters && (
        <div className="flex items-center space-x-2 flex-wrap gap-y-1.5 text-xs px-1">
          <span className="text-[10px] uppercase tracking-widest text-[#888888] font-semibold mr-1">
            Active:
          </span>

          {selectedFilterTag && (
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[#181818] border border-[#2B2B2B] text-[11px] text-[#D5D2CA]">
              <span>
                {selectedFilterTag === 'featured'
                  ? 'Featured'
                  : selectedFilterTag === 'new_arrival'
                  ? 'New Arrival'
                  : 'Bestseller'}
              </span>
              <button
                onClick={() => onSelectFilterTag('')}
                className="hover:text-[#C9A227] ml-1"
                aria-label="Remove filter"
              >
                <X size={11} />
              </button>
            </span>
          )}

          {selectedSizes.map(size => (
            <span
              key={size}
              className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[#181818] border border-[#2B2B2B] text-[11px] text-[#D5D2CA]"
            >
              <span>Size: {size}</span>
              <button
                onClick={() => onToggleSize(size)}
                className="hover:text-[#C9A227] ml-1"
                aria-label={`Remove size ${size}`}
              >
                <X size={11} />
              </button>
            </span>
          ))}

          {selectedColors.map(color => (
            <span
              key={color}
              className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[#181818] border border-[#2B2B2B] text-[11px] text-[#D5D2CA]"
            >
              <span>Color: {color}</span>
              <button
                onClick={() => onToggleColor(color)}
                className="hover:text-[#C9A227] ml-1"
                aria-label={`Remove color ${color}`}
              >
                <X size={11} />
              </button>
            </span>
          ))}

          {priceRange < 100000 && (
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[#181818] border border-[#2B2B2B] text-[11px] text-[#D5D2CA]">
              <span>Under ₹{priceRange.toLocaleString('en-IN')}</span>
              <button
                onClick={() => onPriceChange(100000)}
                className="hover:text-[#C9A227] ml-1"
                aria-label="Remove price filter"
              >
                <X size={11} />
              </button>
            </span>
          )}

          {inStockOnly && (
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[#181818] border border-[#2B2B2B] text-[11px] text-[#D5D2CA]">
              <span>In Stock</span>
              <button
                onClick={() => onToggleInStock(false)}
                className="hover:text-[#C9A227] ml-1"
                aria-label="Remove in stock filter"
              >
                <X size={11} />
              </button>
            </span>
          )}

          <button
            onClick={onResetFilters}
            className="text-[11px] text-[#C9A227] hover:underline flex items-center space-x-1 ml-2 font-medium"
          >
            <RotateCcw size={10} />
            <span>Reset All</span>
          </button>
        </div>
      )}

      {/* Mobile Filters Bottom Sheet Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end lg:hidden animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#0E0E0E] border-l border-[#1F1F1F] h-full p-6 overflow-y-auto flex flex-col justify-between">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#222222]">
                <div className="flex items-center space-x-2">
                  <SlidersHorizontal size={15} className="text-[#C9A227]" />
                  <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-[#F5F2EA]">
                    Filter Wardrobe
                  </h3>
                </div>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 text-[#9B9B9B] hover:text-[#F5F2EA]"
                  aria-label="Close filters"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Tag / Status */}
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#888888] font-bold block mb-2">
                  Curated Status
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'All Garments', value: '' },
                    { label: 'Featured', value: 'featured' },
                    { label: 'New Arrivals', value: 'new_arrival' },
                    { label: 'Bestsellers', value: 'bestseller' }
                  ].map(tag => (
                    <button
                      key={tag.value}
                      onClick={() => onSelectFilterTag(tag.value)}
                      className={`py-2 px-3 rounded text-xs uppercase tracking-wider font-medium text-center border transition-all ${
                        selectedFilterTag === tag.value
                          ? 'bg-[#C9A227] text-[#080808] border-[#C9A227] font-bold'
                          : 'bg-[#141414] border-[#222222] text-[#D5D2CA]'
                      }`}
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              {allSizes.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] uppercase tracking-widest text-[#888888] font-bold">
                      Sizes
                    </span>
                    {selectedSizes.length > 0 && (
                      <span className="text-[10px] text-[#C9A227]">{selectedSizes.length} selected</span>
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 max-h-40 overflow-y-auto pr-1">
                    {allSizes.map(size => {
                      const isSelected = selectedSizes.includes(size);
                      return (
                        <button
                          key={size}
                          onClick={() => onToggleSize(size)}
                          className={`py-2 rounded text-xs font-medium border transition-all ${
                            isSelected
                              ? 'bg-[#C9A227] text-[#080808] border-[#C9A227] font-bold'
                              : 'bg-[#141414] border-[#242424] text-[#D5D2CA]'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Colors */}
              {allColors.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[#888888] font-bold block mb-2">
                    Palette
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                    {allColors.map(color => {
                      const isSelected = selectedColors.includes(color);
                      return (
                        <button
                          key={color}
                          onClick={() => onToggleColor(color)}
                          className={`px-3 py-1.5 rounded text-xs border transition-all ${
                            isSelected
                              ? 'bg-[#C9A227] text-[#080808] border-[#C9A227] font-bold'
                              : 'bg-[#141414] border-[#242424] text-[#D5D2CA]'
                          }`}
                        >
                          {color}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-[10px] uppercase tracking-widest text-[#888888] font-bold">
                    Max Price
                  </span>
                  <span className="text-sm font-bold text-[#E0B84F]">
                    ₹{priceRange.toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="100000"
                  step="1000"
                  value={priceRange}
                  onChange={e => onPriceChange(Number(e.target.value))}
                  className="w-full accent-[#C9A227] bg-[#222222] h-2 rounded cursor-pointer"
                />
              </div>

              {/* In Stock */}
              <div>
                <label className="flex items-center space-x-3 cursor-pointer p-2.5 rounded bg-[#141414] border border-[#222222]">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={e => onToggleInStock(e.target.checked)}
                    className="accent-[#C9A227] w-4 h-4"
                  />
                  <span className="text-xs text-[#D5D2CA] font-medium">In Stock & Ready to Dispatch</span>
                </label>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-[#222222] space-y-2">
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="w-full py-3 rounded bg-[#C9A227] text-[#080808] text-xs uppercase tracking-widest font-bold shadow-lg"
              >
                Show {totalCount} Garments
              </button>
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    onResetFilters();
                  }}
                  className="w-full py-2.5 text-xs text-[#9B9B9B] hover:text-[#F5F2EA] flex items-center justify-center space-x-1.5"
                >
                  <RotateCcw size={12} />
                  <span>Reset All Filters</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
