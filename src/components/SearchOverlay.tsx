import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, Tag } from 'lucide-react';
import { Product } from '../types.js';
import { api } from '../lib/api.js';
import { ProductMasonryGrid } from './ProductMasonryGrid.js';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (slug: string) => void;
  onViewAll: (query: string) => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  onViewAll
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setResults([]);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api.getProducts({ search: query.trim() });
        setResults(data);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div
      id="search-overlay-modal"
      className="fixed inset-0 z-50 bg-[#080808]/95 backdrop-blur-xl flex flex-col animate-in fade-in duration-200"
    >
      {/* Top Bar */}
      <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 pt-8 pb-4 flex items-center justify-between border-b border-[#1C1C1C]">
        <div className="flex items-center space-x-3 w-full">
          <Search size={22} className="text-[#C9A227]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && query.trim()) {
                onViewAll(query);
                onClose();
              }
            }}
            placeholder="Search products"
            className="w-full bg-transparent text-xl sm:text-2xl text-[#F5F2EA] placeholder-[#555555] font-light outline-none"
          />
        </div>
        <button
          onClick={onClose}
          className="p-2 text-[#9B9B9B] hover:text-[#F5F2EA] transition-colors ml-4"
          aria-label="Close search"
        >
          <X size={24} />
        </button>
      </div>

      {/* Content Body */}
      <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 flex-1 overflow-y-auto">
        {loading && (
          <div className="py-12 text-center text-sm text-[#D6C28A] tracking-widest uppercase animate-pulse">
            Searching Men's Fashion Catalog...
          </div>
        )}

        {!loading && query.trim() && results.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-base text-[#D5D2CA] font-medium">No results found for "{query}"</p>
            <p className="text-xs text-[#9B9B9B] mt-2">
              Try searching for T-shirt, Oxford shirt, Selvedge denim, Men's bomber jacket, or Footwear.
            </p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-[#1C1C1C]">
              <span className="text-xs uppercase tracking-widest text-[#9B9B9B]">
                Found {results.length} results
              </span>
              <button
                onClick={() => {
                  onViewAll(query);
                  onClose();
                }}
                className="text-xs uppercase tracking-widest text-[#C9A227] hover:text-[#E0B84F] flex items-center space-x-1"
              >
                <span>View All In Shop</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <ProductMasonryGrid
              products={results}
              onSelectProduct={slug => {
                onSelectProduct(slug);
                onClose();
              }}
              maxColumns={4}
              pageSize={8}
            />
          </div>
        )}

        {!query.trim() && (
          <div className="py-8">
            <h4 className="text-xs uppercase tracking-[0.2em] text-[#9B9B9B] mb-4">
              Curated Menswear Searches
            </h4>
            <div className="flex flex-wrap gap-2">
              {[
                'T-shirt',
                'Black shirt',
                'Slim fit jeans',
                "Men's jacket",
                'Track pants',
                'Sneakers',
                'Polo',
                'Hoodie'
              ].map(term => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-3.5 py-1.5 rounded-full bg-[#151515] border border-[#262626] hover:border-[#C9A227] text-xs text-[#D5D2CA] hover:text-[#E0B84F] transition-all flex items-center space-x-1.5"
                >
                  <Tag size={12} className="text-[#C9A227]" />
                  <span>{term}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
