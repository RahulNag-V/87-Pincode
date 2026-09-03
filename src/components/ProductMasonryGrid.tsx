import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Product } from '../types.js';
import { ProductCard } from './ProductCard.js';
import { Sparkles, ArrowDown, Loader2 } from 'lucide-react';

interface ProductMasonryGridProps {
  products: Product[];
  onSelectProduct: (slug: string) => void;
  maxColumns?: number; // default 5 for desktop
  pageSize?: number; // for progressive discovery loading
  emptyMessage?: string;
}

export const ProductMasonryGrid: React.FC<ProductMasonryGridProps> = ({
  products,
  onSelectProduct,
  maxColumns = 5,
  pageSize = 20,
  emptyMessage = 'No garments match your current discovery criteria.'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Responsive column count based on container width
  // Mobile (< 640px): 2 columns
  // Tablet (640px - 1024px): 3 columns
  // Laptop (1024px - 1440px): 4 columns
  // Desktop (>= 1440px): 5 columns (or maxColumns)
  const [columnCount, setColumnCount] = useState<number>(() => {
    if (typeof window === 'undefined') return 3;
    const w = window.innerWidth;
    if (w < 640) return 2;
    if (w < 1024) return 3;
    if (w < 1440) return Math.min(4, maxColumns);
    return maxColumns;
  });

  useEffect(() => {
    const updateColumns = () => {
      const width = containerRef.current?.offsetWidth || window.innerWidth;
      if (width < 640) {
        setColumnCount(2); // Strict 2-column mobile masonry
      } else if (width < 960) {
        setColumnCount(Math.min(3, maxColumns)); // 2-3 columns on tablet
      } else if (width < 1360) {
        setColumnCount(Math.min(4, maxColumns)); // 3-4 on laptop
      } else {
        setColumnCount(maxColumns); // 4-5 on large desktop
      }
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, [maxColumns]);

  // Progressive loading / pagination state to maintain blazing-fast rendering
  const [visibleCount, setVisibleCount] = useState<number>(pageSize);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Reset visibleCount when products change drastically (e.g. filter/search change)
  useEffect(() => {
    setVisibleCount(pageSize);
  }, [products, pageSize]);

  const displayedProducts = useMemo(() => {
    return products.slice(0, visibleCount);
  }, [products, visibleCount]);

  const hasMore = visibleCount < products.length;

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + pageSize, products.length));
      setIsLoadingMore(false);
    }, 300);
  };

  // Distribute items into columns round-robin (preserves left-to-right chronological/sorted order)
  const columns = useMemo(() => {
    const cols: Product[][] = Array.from({ length: columnCount }, () => []);
    displayedProducts.forEach((item, index) => {
      cols[index % columnCount].push(item);
    });
    return cols;
  }, [displayedProducts, columnCount]);

  if (products.length === 0) {
    return (
      <div className="py-20 text-center bg-[#0D0D0D] border border-[#1C1C1C] rounded-lg p-8 max-w-lg mx-auto">
        <Sparkles className="w-8 h-8 text-[#C9A227] mx-auto mb-3 opacity-80" />
        <p className="luxury-serif text-lg text-[#F5F2EA]">{emptyMessage}</p>
        <p className="text-xs text-[#888888] mt-2 modern-sans leading-relaxed">
          Try expanding your price range, choosing another collection, or resetting active size filters.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full space-y-10">
      {/* Masonry Columns Container */}
      <div className="flex gap-3 sm:gap-4 md:gap-5 items-start w-full">
        {columns.map((columnItems, colIndex) => (
          <div
            key={`col-${colIndex}`}
            className="flex-1 flex flex-col gap-3 sm:gap-4 md:gap-5 min-w-0"
          >
            {columnItems.map((product, itemIndex) => {
              const globalIndex = itemIndex * columnCount + colIndex;
              return (
                <motion.div
                  key={product.id}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-20px' }}
                  transition={{
                    duration: 0.35,
                    delay: Math.min((globalIndex % 8) * 0.04, 0.25),
                    ease: [0.21, 0.47, 0.32, 0.98]
                  }}
                  className="w-full"
                >
                  <ProductCard
                    product={product}
                    onSelect={onSelectProduct}
                    priority={globalIndex < 4}
                  />
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Progressive Loading State / "Discover More" Button */}
      {hasMore && (
        <div className="pt-8 pb-4 flex flex-col items-center justify-center">
          <div className="text-[11px] uppercase tracking-[0.25em] text-[#888888] mb-3 font-medium">
            Showing {displayedProducts.length} of {products.length} Garments
          </div>
          <button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="group px-8 py-3 rounded-full bg-[#141414] border border-[#2B2B2B] hover:border-[#C9A227] text-xs uppercase tracking-[0.2em] font-semibold text-[#F5F2EA] hover:text-[#C9A227] transition-all flex items-center space-x-2.5 shadow-lg active:scale-95"
          >
            {isLoadingMore ? (
              <>
                <Loader2 size={15} className="animate-spin text-[#C9A227]" />
                <span>Loading Discovery Stream...</span>
              </>
            ) : (
              <>
                <span>Discover More Garments</span>
                <ArrowDown size={14} className="group-hover:translate-y-0.5 transition-transform text-[#C9A227]" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
