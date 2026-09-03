import React, { useState, useEffect, useMemo } from 'react';
import { Product } from '../types.js';
import { ProductMasonryGrid } from '../components/ProductMasonryGrid.js';
import { CategoryDiscoveryBar } from '../components/CategoryDiscoveryBar.js';
import { ShopFilterBar } from '../components/ShopFilterBar.js';
import { useStore } from '../context/StoreContext.js';
import { api } from '../lib/api.js';

interface ShopViewProps {
  navigate: (view: string, params?: Record<string, any>) => void;
  initialParams?: {
    category?: string;
    filter?: string;
    search?: string;
    [key: string]: any;
  };
  initialCategorySlug?: string;
}

export const ShopView: React.FC<ShopViewProps> = ({
  navigate,
  initialParams = {} as Record<string, any>,
  initialCategorySlug
}) => {
  const { categories } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialCategorySlug || initialParams.category || ''
  );
  const [selectedFilterTag, setSelectedFilterTag] = useState<string>(
    initialParams.filter || ''
  );
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number>(100000);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [searchQuery, setSearchQuery] = useState<string>(initialParams.search || '');

  useEffect(() => {
    if (initialCategorySlug) setSelectedCategory(initialCategorySlug);
    else if (initialParams.category) setSelectedCategory(initialParams.category);
    if (initialParams.filter) setSelectedFilterTag(initialParams.filter);
    if (initialParams.search) setSearchQuery(initialParams.search);
  }, [initialCategorySlug, initialParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await api.getProducts({
          category: selectedCategory || undefined,
          search: searchQuery || undefined
        });
        setProducts(data);
      } catch (err) {
        console.error('Error fetching shop products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory, searchQuery]);

  // Derive unique sizes and colors across catalog with menswear ordering
  const allSizes = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => p.sizes.forEach(s => set.add(s)));
    const sizeOrder = [
      'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL',
      '30', '32', '34', '36', '38', '40',
      'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11', 'UK 12',
      'One Size'
    ];
    return Array.from(set).sort((a, b) => {
      const idxA = sizeOrder.indexOf(a);
      const idxB = sizeOrder.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [products]);

  const allColors = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => p.colors.forEach(c => set.add(c)));
    return Array.from(set).sort();
  }, [products]);

  // Client-side filtering & sorting
  const filteredProducts = useMemo(() => {
    return products
      .filter(prod => {
        const displayPrice = prod.sale_price ?? prod.price;
        if (displayPrice > priceRange) return false;
        if (inStockOnly && prod.stock <= 0) return false;

        if (selectedFilterTag === 'new_arrival' && !prod.is_new_arrival) return false;
        if (selectedFilterTag === 'bestseller' && !prod.is_bestseller) return false;
        if (selectedFilterTag === 'featured' && !prod.is_featured) return false;

        if (selectedSizes.length > 0) {
          const hasSize = prod.sizes.some(s => selectedSizes.includes(s));
          if (!hasSize) return false;
        }

        if (selectedColors.length > 0) {
          const hasColor = prod.colors.some(c => selectedColors.includes(c));
          if (!hasColor) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const priceA = a.sale_price ?? a.price;
        const priceB = b.sale_price ?? b.price;

        if (sortBy === 'price_asc') return priceA - priceB;
        if (sortBy === 'price_desc') return priceB - priceA;
        if (sortBy === 'newest') return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        if (sortBy === 'bestseller') return (b.is_bestseller ? 1 : 0) - (a.is_bestseller ? 1 : 0);
        return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
      });
  }, [
    products,
    priceRange,
    inStockOnly,
    selectedFilterTag,
    selectedSizes,
    selectedColors,
    sortBy
  ]);

  const toggleSize = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors(prev =>
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const resetFilters = () => {
    setSelectedCategory('');
    setSelectedFilterTag('');
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRange(100000);
    setInStockOnly(false);
    setSearchQuery('');
    setSortBy('featured');
  };

  const hasActiveFilters =
    Boolean(selectedCategory) ||
    Boolean(selectedFilterTag) ||
    selectedSizes.length > 0 ||
    selectedColors.length > 0 ||
    priceRange < 100000 ||
    inStockOnly ||
    Boolean(searchQuery);

  return (
    <div className="min-h-screen bg-[#080808] text-[#F5F2EA] py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Page Header (Clean, Editorial) */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#1A1A1A]">
          <div>
            <div className="flex items-center space-x-2 text-[10px] uppercase tracking-[0.25em] text-[#C9A227] mb-1 font-semibold">
              <span>Men's Fashion Discovery</span>
              <span>•</span>
              <span>Visual Atelier Feed</span>
            </div>
            <h1 className="luxury-serif text-2xl sm:text-4xl font-bold text-[#F5F2EA] tracking-tight">
              {selectedCategory
                ? categories.find(c => c.slug === selectedCategory)?.name || "Men's Collection"
                : selectedFilterTag === 'new_arrival'
                ? "New Men's Arrivals"
                : selectedFilterTag === 'bestseller'
                ? "Bestselling Menswear"
                : selectedFilterTag === 'featured'
                ? "Featured Signatures"
                : searchQuery
                ? `Results for "${searchQuery}"`
                : "Curated Menswear Feed"}
            </h1>
          </div>
        </div>

        {/* 1. Visual Category Discovery Row */}
        <CategoryDiscoveryBar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={slug => setSelectedCategory(slug)}
        />

        {/* 2. Compact Sticky Filter & Sort Bar */}
        <div className="sticky top-20 z-30 pt-1">
          <ShopFilterBar
            allSizes={allSizes}
            selectedSizes={selectedSizes}
            onToggleSize={toggleSize}
            allColors={allColors}
            selectedColors={selectedColors}
            onToggleColor={toggleColor}
            priceRange={priceRange}
            onPriceChange={setPriceRange}
            inStockOnly={inStockOnly}
            onToggleInStock={setInStockOnly}
            sortBy={sortBy}
            onSortChange={setSortBy}
            selectedFilterTag={selectedFilterTag}
            onSelectFilterTag={setSelectedFilterTag}
            hasActiveFilters={hasActiveFilters}
            onResetFilters={resetFilters}
            totalCount={filteredProducts.length}
          />
        </div>

        {/* 3. Pinterest-Style Masonry Discovery Grid */}
        <div className="pt-2">
          {loading ? (
            <div className="py-24 text-center">
              <span className="text-xs uppercase tracking-[0.3em] text-[#C9A227] animate-pulse font-medium">
                Assembling Atelier Collections...
              </span>
            </div>
          ) : (
            <ProductMasonryGrid
              products={filteredProducts}
              onSelectProduct={slug => navigate('product', { slug })}
              maxColumns={5}
              pageSize={20}
              emptyMessage="No garments match your active filters"
            />
          )}
        </div>
      </div>
    </div>
  );
};
