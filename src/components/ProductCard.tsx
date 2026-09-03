import React, { useState } from 'react';
import { Heart, ShoppingBag, X, Check, Eye } from 'lucide-react';
import { Product } from '../types.js';
import { useWishlist } from '../context/WishlistContext.js';
import { useCart } from '../context/CartContext.js';

interface ProductCardProps {
  product: Product;
  onSelect: (slug: string) => void;
  priority?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  priority = false
}) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addItem } = useCart();
  const inWishlist = isInWishlist(product.id);

  // Quick Add State
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'Standard');
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0] || 'Standard');
  const [justAdded, setJustAdded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Determine aesthetic editorial aspect ratio based on product type / featured status
  // to give natural height variation without awkward stretching or excessive cropping
  const getAspectRatioClass = () => {
    if (product.is_featured) return 'aspect-[3/4.4]'; // Editorial tall
    const slug = product.slug.toLowerCase();
    if (slug.includes('boot') || slug.includes('shoe') || slug.includes('sneaker')) {
      return 'aspect-[4/4.2]'; // Near square for footwear
    }
    if (slug.includes('t-shirt') || slug.includes('tee') || slug.includes('polo')) {
      return 'aspect-[3/4]'; // Classic menswear portrait
    }
    if (slug.includes('jacket') || slug.includes('coat') || slug.includes('suit') || slug.includes('blazer')) {
      return 'aspect-[3/4.5]'; // Taller structured silhouette
    }
    if (slug.includes('trousers') || slug.includes('pant') || slug.includes('jeans')) {
      return 'aspect-[3/4.2]'; // Vertical trouser drape
    }
    // Deterministic balanced variance based on product ID
    const hash = product.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const ratios = ['aspect-[3/4]', 'aspect-[3/4.2]', 'aspect-[4/4.8]', 'aspect-[3/3.8]'];
    return ratios[hash % ratios.length];
  };

  const displayPrice = product.sale_price ?? product.price;
  const hasMultipleVariants = product.sizes.length > 1 || product.colors.length > 1;

  const handleQuickAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasMultipleVariants) {
      setQuickAddOpen(true);
    } else {
      performAddToCart(selectedSize, selectedColor);
    }
  };

  const performAddToCart = (size: string, color: string) => {
    addItem(product, size, color, 1);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
      setQuickAddOpen(false);
    }, 1200);
  };

  const handleConfirmQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    performAddToCart(selectedSize, selectedColor);
  };

  return (
    <article
      id={`product-card-${product.id}`}
      onClick={() => onSelect(product.slug)}
      className="group relative flex flex-col bg-[#0F0F0F] border border-[#1E1E1E] hover:border-[#C9A227]/50 rounded-md cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.85)]"
    >
      {/* 1. Image Hero Container (Variable Aspect Ratio) */}
      <div className={`relative ${getAspectRatioClass()} w-full overflow-hidden bg-[#151515]`}>
        {/* Placeholder skeleton while loading */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-[#161616] animate-pulse" />
        )}

        {/* Primary Image */}
        <img
          src={product.images[0]}
          alt={product.name}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-700 ease-out ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Secondary Crossfade Image on Desktop Hover */}
        {product.images[1] && (
          <img
            src={product.images[1]}
            alt={`${product.name} alternate angle`}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 ease-out pointer-events-none"
          />
        )}

        {/* Badges Overlay (Top-Left) */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
          {product.is_featured && (
            <span className="px-2 py-0.5 rounded-sm bg-[#080808]/90 border border-[#C9A227]/60 text-[#E0B84F] text-[8.5px] uppercase tracking-[0.2em] font-semibold backdrop-blur-sm shadow-sm">
              Featured
            </span>
          )}
          {product.is_new_arrival && !product.is_featured && (
            <span className="px-2 py-0.5 rounded-sm bg-[#080808]/85 border border-[#333333] text-[#F5F2EA] text-[8.5px] uppercase tracking-[0.18em] font-medium backdrop-blur-sm shadow-sm">
              New
            </span>
          )}
          {product.is_bestseller && !product.is_new_arrival && !product.is_featured && (
            <span className="px-2 py-0.5 rounded-sm bg-[#C9A227] text-[#080808] text-[8.5px] uppercase tracking-[0.18em] font-bold shadow-sm">
              Bestseller
            </span>
          )}
          {product.sale_price && (
            <span className="px-1.5 py-0.5 rounded-sm bg-red-950/80 border border-red-800/80 text-red-300 text-[8.5px] uppercase tracking-wider font-semibold backdrop-blur-sm">
              Sale
            </span>
          )}
        </div>

        {/* Wishlist Button (Top-Right) */}
        <button
          id={`wishlist-btn-${product.id}`}
          onClick={e => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all z-20 ${
            inWishlist
              ? 'bg-[#C9A227] text-[#080808] shadow-md scale-105'
              : 'bg-[#080808]/65 text-[#F5F2EA] md:opacity-0 md:group-hover:opacity-100 hover:text-[#C9A227] hover:bg-[#080808]/90'
          }`}
          aria-label={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart size={14} className={inWishlist ? 'fill-current' : ''} />
        </button>

        {/* Add to Cart Action Button (Desktop hover bar / Mobile touch button) */}
        {!quickAddOpen && (
          <div className="absolute inset-x-2.5 bottom-2.5 z-20 transition-all duration-300 md:opacity-0 md:group-hover:opacity-100 md:translate-y-1 md:group-hover:translate-y-0">
            <button
              id={`quick-add-${product.id}`}
              onClick={handleQuickAddClick}
              className={`w-full py-2.5 px-3 rounded text-[10.5px] uppercase tracking-[0.16em] font-bold transition-all flex items-center justify-center space-x-2 shadow-2xl ${
                justAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#0A0A0A]/95 hover:bg-[#C9A227] text-[#F5F2EA] hover:text-[#080808] border border-[#2B2B2B] hover:border-[#C9A227] backdrop-blur-md'
              }`}
            >
              {justAdded ? (
                <>
                  <Check size={13} className="stroke-[2.5]" />
                  <span>Added to Cart</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={13} />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Quick Add Variant Selection Drawer / Popover Overlay */}
        {quickAddOpen && (
          <div
            onClick={e => e.stopPropagation()}
            className="absolute inset-0 z-30 bg-[#080808]/95 backdrop-blur-md p-3.5 flex flex-col justify-between animate-in fade-in duration-200"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#222222]">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#C9A227] font-semibold">
                Select Size for Cart
              </span>
              <button
                onClick={() => setQuickAddOpen(false)}
                className="p-1 text-[#9B9B9B] hover:text-[#F5F2EA] transition-colors"
                aria-label="Close size selection"
              >
                <X size={14} />
              </button>
            </div>

            <div className="py-2 space-y-3 flex-1 overflow-y-auto">
              {/* Size Options */}
              {product.sizes.length > 0 && (
                <div>
                  <label className="text-[9px] uppercase tracking-wider text-[#888888] block mb-1.5">
                    Size: <span className="text-[#F5F2EA] font-semibold">{selectedSize}</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {product.sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-2.5 py-1 rounded text-[10px] font-medium transition-all ${
                          selectedSize === size
                            ? 'bg-[#C9A227] text-[#080808] font-bold shadow'
                            : 'bg-[#181818] border border-[#2A2A2A] text-[#D5D2CA] hover:border-[#C9A227]'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Options */}
              {product.colors.length > 1 && (
                <div>
                  <label className="text-[9px] uppercase tracking-wider text-[#888888] block mb-1.5">
                    Color: <span className="text-[#F5F2EA] font-semibold">{selectedColor}</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {product.colors.map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${
                          selectedColor === color
                            ? 'bg-[#C9A227] text-[#080808] font-bold shadow'
                            : 'bg-[#181818] border border-[#2A2A2A] text-[#D5D2CA] hover:border-[#C9A227]'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Add Button */}
            <button
              onClick={handleConfirmQuickAdd}
              disabled={justAdded}
              className={`w-full py-2.5 px-3 rounded text-[10.5px] uppercase tracking-widest font-bold transition-all flex items-center justify-center space-x-1.5 shadow-lg ${
                justAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#C9A227] text-[#080808] hover:bg-[#D4AF37]'
              }`}
            >
              {justAdded ? (
                <>
                  <Check size={13} className="stroke-[2.5]" />
                  <span>Added to Cart</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={13} />
                  <span>Add to Cart • ₹{displayPrice.toLocaleString('en-IN')}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* 2. Small Product Information (Image-First Philosophy) */}
      <div className="p-3 sm:p-3.5 flex flex-col justify-between flex-1 space-y-1.5">
        <div>
          {/* Subtle Category line */}
          <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.2em] text-[#888888] mb-0.5">
            <span className="truncate">{product.category_name || 'Menswear Atelier'}</span>
            {product.stock <= 5 && product.stock > 0 && (
              <span className="text-amber-500 font-medium">Only {product.stock} left</span>
            )}
          </div>

          {/* Product Name */}
          <h3 className="luxury-serif text-[13.5px] sm:text-sm font-semibold text-[#F5F2EA] group-hover:text-[#E0B84F] transition-colors line-clamp-1 leading-snug">
            {product.name}
          </h3>
        </div>

        {/* Pricing line - full width, crystal-clear and never truncated */}
        <div className="pt-2 border-t border-[#1C1C1C] flex items-center justify-between">
          <div className="flex items-baseline space-x-2">
            <span className="text-sm font-bold text-[#E0B84F]">
              ₹{displayPrice.toLocaleString('en-IN')}
            </span>
            {product.sale_price && (
              <span className="text-[11px] text-[#777777] line-through">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Available sizes hint */}
          <div className="text-[10px] text-[#888888] modern-sans">
            {product.sizes.length > 0 && (
              <span>{product.sizes.slice(0, 3).join('/')}{product.sizes.length > 3 ? '+' : ''}</span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
