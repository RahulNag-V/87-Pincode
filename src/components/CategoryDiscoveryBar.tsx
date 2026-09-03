import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Category } from '../types.js';
import {
  ChevronDown,
  Layers,
  Search,
  Check,
  X,
  Sparkles,
  RotateCcw
} from 'lucide-react';

interface CategoryDiscoveryBarProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
}

export const CategoryDiscoveryBar: React.FC<CategoryDiscoveryBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Close dropdown on outside click or escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

  const handleCategorySelect = (slug: string) => {
    onSelectCategory(slug);
    setIsDropdownOpen(false);
    setSearchFilter('');
  };

  // Filter categories within the dropdown search
  const filteredCategories = useMemo(() => {
    if (!searchFilter.trim()) return categories;
    const q = searchFilter.toLowerCase().trim();
    return categories.filter(
      c => c.name.toLowerCase().includes(q) || (c.description && c.description.toLowerCase().includes(q))
    );
  }, [categories, searchFilter]);

  const activeCategoryObject = categories.find(c => c.slug === selectedCategory);

  return (
    <div className="w-full pb-3">
      {/* Header bar: Title & Collections Counter */}
      <div className="flex items-center justify-between mb-2.5 px-1">
        <div className="flex items-center space-x-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227] animate-pulse" />
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#C9A227] font-semibold">
            Visual Category Discovery
          </span>
          <span className="text-[10px] text-[#777777] uppercase tracking-wider">
            • {categories.length} Collections
          </span>
        </div>

        {selectedCategory && (
          <button
            onClick={() => onSelectCategory('')}
            className="flex items-center space-x-1.5 text-[11px] text-[#9B9B9B] hover:text-[#C9A227] transition-colors"
          >
            <RotateCcw size={11} />
            <span>Reset to All</span>
          </button>
        )}
      </div>

      {/* Primary Discovery Bar with Unified Dropdown Pill */}
      <div className="relative flex items-center space-x-3">
        {/* Unified Luxury Collection Selector Button */}
        <div className="relative" ref={dropdownRef}>
          <button
            id="category-selector-dropdown-btn"
            onClick={() => setIsDropdownOpen(prev => !prev)}
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
            className={`group flex items-center space-x-3 px-4 py-2.5 rounded-full border transition-all duration-300 text-left outline-none ${
              !selectedCategory
                ? 'bg-[#C9A227] hover:bg-[#D4AF37] text-[#080808] border-[#C9A227] font-bold shadow-[0_4px_16px_rgba(201,162,39,0.25)]'
                : 'bg-[#141414] hover:bg-[#1A1A1A] border-[#C9A227] text-[#F5F2EA] shadow-[0_4px_16px_rgba(0,0,0,0.6)]'
            }`}
          >
            {/* Left Icon or Category Avatar */}
            {!selectedCategory ? (
              <div className="w-6 h-6 rounded-full bg-[#080808] text-[#C9A227] flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                <Layers size={13} />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full overflow-hidden border border-[#C9A227] shrink-0 bg-[#080808]">
                <img
                  src={activeCategoryObject?.image}
                  alt={activeCategoryObject?.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Label */}
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase tracking-wider font-bold whitespace-nowrap">
                {!selectedCategory ? 'All Collections' : activeCategoryObject?.name}
              </span>
              {selectedCategory && (
                <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#C9A227]/20 text-[#E0B84F] border border-[#C9A227]/30">
                  Active
                </span>
              )}
            </div>

            {/* Chevron Icon */}
            <div className="pl-1">
              <ChevronDown
                size={15}
                className={`transition-transform duration-300 ${
                  isDropdownOpen ? 'rotate-180' : ''
                } ${!selectedCategory ? 'text-[#080808]' : 'text-[#C9A227]'}`}
              />
            </div>
          </button>

          {/* Smooth Luxury Dropdown Popover */}
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                id="category-discovery-dropdown-menu"
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="absolute top-full left-0 mt-2.5 w-80 sm:w-88 bg-[#0D0D0D]/95 border border-[#262626] rounded-2xl shadow-[0_20px_45px_rgba(0,0,0,0.92)] p-2.5 z-50 backdrop-blur-xl"
              >
                {/* Dropdown Header */}
                <div className="flex items-center justify-between px-2.5 py-2 border-b border-[#1C1C1C] mb-2">
                  <div className="flex items-center space-x-2">
                    <Sparkles size={13} className="text-[#C9A227]" />
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#C9A227] font-semibold">
                      Explore Collections
                    </span>
                  </div>
                  <button
                    onClick={() => setIsDropdownOpen(false)}
                    className="text-[#888888] hover:text-[#F5F2EA] p-1 rounded-md hover:bg-[#1A1A1A] transition-colors"
                    aria-label="Close dropdown"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Quick Search Filter */}
                {categories.length > 4 && (
                  <div className="relative mb-2 px-1">
                    <Search size={13} className="absolute left-3.5 top-2.5 text-[#777777]" />
                    <input
                      type="text"
                      value={searchFilter}
                      onChange={e => setSearchFilter(e.target.value)}
                      placeholder="Search collections..."
                      className="w-full bg-[#151515] border border-[#222222] focus:border-[#C9A227] rounded-xl pl-8 pr-7 py-2 text-xs text-[#F5F2EA] placeholder-[#666666] outline-none transition-colors"
                      autoFocus
                    />
                    {searchFilter && (
                      <button
                        onClick={() => setSearchFilter('')}
                        className="absolute right-3 top-2.5 text-[#888888] hover:text-[#F5F2EA]"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                )}

                {/* Category List - Zero scrollbars, smooth touch & wheel scroll */}
                <div className="max-h-72 overflow-y-auto space-y-1.5 pr-0.5 no-scrollbar">
                  {/* 1. All Collections Master Option */}
                  {(!searchFilter || 'all collections'.includes(searchFilter.toLowerCase())) && (
                    <button
                      onClick={() => handleCategorySelect('')}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-left ${
                        !selectedCategory
                          ? 'bg-[#C9A227]/15 border border-[#C9A227]/60 text-[#F5F2EA]'
                          : 'hover:bg-[#161616] text-[#D5D2CA] border border-transparent hover:border-[#222222]'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                            !selectedCategory
                              ? 'bg-[#C9A227] text-[#080808]'
                              : 'bg-[#1C1C1C] text-[#C9A227]'
                          }`}
                        >
                          <Layers size={14} />
                        </div>
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider">
                            All Collections
                          </div>
                          <div className="text-[10px] text-[#888888]">
                            Complete atelier catalogue
                          </div>
                        </div>
                      </div>
                      {!selectedCategory && <Check size={15} className="text-[#C9A227] shrink-0" />}
                    </button>
                  )}

                  {/* Divider */}
                  <div className="my-1 border-t border-[#1C1C1C]" />

                  {/* 2. Individual Categories */}
                  {filteredCategories.length === 0 ? (
                    <div className="py-6 text-center text-xs text-[#777777]">
                      No collections match "{searchFilter}"
                    </div>
                  ) : (
                    filteredCategories.map(cat => {
                      const isSelected = selectedCategory === cat.slug;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => handleCategorySelect(cat.slug)}
                          className={`w-full flex items-center justify-between p-2 rounded-xl transition-all text-left group ${
                            isSelected
                              ? 'bg-[#C9A227]/15 border border-[#C9A227]/60 text-[#F5F2EA]'
                              : 'hover:bg-[#161616] text-[#D5D2CA] border border-transparent hover:border-[#222222]'
                          }`}
                        >
                          <div className="flex items-center space-x-3 min-w-0">
                            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-[#2B2B2B] bg-[#1A1A1A] group-hover:border-[#C9A227]/50 transition-colors">
                              <img
                                src={cat.image}
                                alt={cat.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                              />
                            </div>
                            <div className="truncate">
                              <div
                                className={`text-xs uppercase tracking-wider truncate font-semibold ${
                                  isSelected ? 'text-[#E0B84F]' : 'text-[#E5E2DA]'
                                }`}
                              >
                                {cat.name}
                              </div>
                              {cat.description && (
                                <div className="text-[10px] text-[#777777] truncate max-w-[190px]">
                                  {cat.description}
                                </div>
                              )}
                            </div>
                          </div>
                          {isSelected && <Check size={15} className="text-[#C9A227] shrink-0 ml-2" />}
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Dropdown Footer */}
                <div className="mt-2.5 pt-2 border-t border-[#1C1C1C] px-2.5 flex items-center justify-between text-[10px] uppercase tracking-wider text-[#666666]">
                  <span>{categories.length} Collections</span>
                  {selectedCategory && (
                    <button
                      onClick={() => handleCategorySelect('')}
                      className="text-[#C9A227] hover:underline font-semibold"
                    >
                      Clear Selection
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Selected Category Chip with Clear Icon */}
        {selectedCategory && (
          <div className="hidden sm:flex items-center space-x-2 text-xs text-[#9B9B9B] pl-2 border-l border-[#222222]">
            <span className="text-[10px] uppercase tracking-widest text-[#777777]">Filtered by:</span>
            <span className="text-xs text-[#E0B84F] font-semibold uppercase tracking-wider">
              {activeCategoryObject?.name}
            </span>
            <button
              onClick={() => onSelectCategory('')}
              className="w-5 h-5 rounded-full bg-[#181818] hover:bg-[#252525] text-[#888888] hover:text-[#F5F2EA] flex items-center justify-center transition-colors ml-1"
              title="Clear category filter"
            >
              <X size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
