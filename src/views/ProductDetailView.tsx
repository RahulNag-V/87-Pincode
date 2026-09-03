import React, { useState, useEffect } from 'react';
import {
  Heart,
  ShoppingBag,
  MessageCircle,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Star,
  Plus,
  Minus,
  Check,
  ArrowLeft,
  X
} from 'lucide-react';
import { Product, ProductReview } from '../types.js';
import { useCart } from '../context/CartContext.js';
import { useWishlist } from '../context/WishlistContext.js';
import { useAuth } from '../context/AuthContext.js';
import { useStore } from '../context/StoreContext.js';
import { ProductCard } from '../components/ProductCard.js';
import { api } from '../lib/api.js';

interface ProductDetailViewProps {
  slug: string;
  navigate: (view: string, params?: Record<string, any>) => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({ slug, navigate }) => {
  const { addItem, openCartDrawer } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated, openAuthModal } = useAuth();
  const { contact } = useStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  // Review Modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await api.getProductBySlug(slug);
        setProduct(data.product);
        setRelated(data.related);
        setReviews(data.reviews || []);
        if (data.product.images.length > 0) {
          setSelectedImage(data.product.images[0]);
        }
        if (data.product.sizes.length > 0) {
          setSelectedSize(data.product.sizes[0]);
        }
        if (data.product.colors.length > 0) {
          setSelectedColor(data.product.colors[0]);
        }
        setQuantity(1);
      } catch (err) {
        console.error('Error fetching product detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[#080808]">
        <div className="text-center space-y-3">
          <span className="text-xs uppercase tracking-[0.3em] text-[#C9A227] animate-pulse">
            Consulting Atelier Archives...
          </span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#080808] text-center p-6">
        <p className="font-editorial text-2xl text-[#F5F2EA]">Creation Not Found</p>
        <p className="text-xs text-[#9B9B9B] mt-2">
          This piece may have been retired or moved into our bespoke archives.
        </p>
        <button
          onClick={() => navigate('shop')}
          className="mt-6 px-6 py-2.5 rounded bg-[#C9A227] text-[#080808] text-xs uppercase tracking-widest font-bold"
        >
          Return to Atelier
        </button>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const displayPrice = product.sale_price ?? product.price;

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) return;
    addItem(product, selectedSize, selectedColor, quantity);
  };

  const handleOrderViaWhatsApp = () => {
    if (!selectedSize || !selectedColor) return;
    addItem(product, selectedSize, selectedColor, quantity);

    if (!isAuthenticated) {
      openAuthModal(() => {
        navigate('cart');
      });
    } else {
      navigate('cart');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    if (!reviewComment.trim()) return;

    setReviewSubmitting(true);
    setReviewError('');
    try {
      await api.submitReview({
        product_id: product.id,
        rating: reviewRating,
        comment: reviewComment.trim()
      });
      setReviewSuccess(true);
      setTimeout(() => {
        setReviewModalOpen(false);
        setReviewSuccess(false);
        setReviewComment('');
      }, 2000);
    } catch (err: any) {
      setReviewError(err.message || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-[#F5F2EA] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <button
          onClick={() => navigate('shop')}
          className="flex items-center space-x-2 text-xs uppercase tracking-widest text-[#9B9B9B] hover:text-[#C9A227] transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          <span>Return to Collections</span>
        </button>

        {/* Top Product Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-[#1A1A1A]">
          {/* Left: Gallery (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
            {/* Thumbnails strip */}
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-24 rounded overflow-hidden border-2 transition-all shrink-0 bg-[#121212] ${
                    selectedImage === img
                      ? 'border-[#C9A227]'
                      : 'border-[#222222] opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Main Stage Image */}
            <div className="flex-1 aspect-[3/4] relative rounded overflow-hidden bg-[#111111] border border-[#1C1C1C]">
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />

              {product.is_new_arrival && (
                <span className="absolute top-4 left-4 px-3 py-1 rounded-sm bg-[#080808]/90 border border-[#C9A227]/50 text-[#E0B84F] text-[10px] uppercase tracking-[0.2em] font-bold">
                  New Arrival
                </span>
              )}

              <button
                onClick={() => toggleWishlist(product.id)}
                className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-all ${
                  inWishlist
                    ? 'bg-[#C9A227] text-[#080808]'
                    : 'bg-[#080808]/70 text-[#D5D2CA] hover:text-[#C9A227]'
                }`}
                aria-label="Toggle wishlist"
              >
                <Heart size={18} className={inWishlist ? 'fill-current' : ''} />
              </button>
            </div>
          </div>

          {/* Right: Atelier Spec Sheet & Ordering Actions (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div>
              {/* Category & SKU */}
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.25em] text-[#C9A227] font-semibold mb-2">
                <span>{product.category_name || 'Haute Couture'}</span>
                <span className="text-[#666666]">SKU: {product.sku}</span>
              </div>

              {/* Title */}
              <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#F5F2EA] leading-snug">
                {product.name}
              </h1>

              {/* Pricing */}
              <div className="mt-4 flex items-baseline space-x-3 pb-6 border-b border-[#1A1A1A]">
                <span className="text-2xl font-bold text-[#F5F2EA]">
                  ₹{displayPrice.toLocaleString('en-IN')}
                </span>
                {product.sale_price && (
                  <>
                    <span className="text-sm text-[#666666] line-through">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#C9A227]/15 border border-[#C9A227]/40 text-[#E0B84F] text-[10px] uppercase font-bold tracking-wider">
                      Save ₹{(product.price - product.sale_price).toLocaleString('en-IN')}
                    </span>
                  </>
                )}
              </div>

              {/* Stock Indicator */}
              <div className="mt-4 flex items-center space-x-2 text-xs">
                {product.stock > 5 ? (
                  <span className="text-emerald-400 font-medium flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>In Stock — Ready for Atelier Dispatch</span>
                  </span>
                ) : product.stock > 0 ? (
                  <span className="text-[#E0B84F] font-semibold flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#E0B84F] animate-ping"></span>
                    <span>Only {product.stock} pieces remaining in atelier</span>
                  </span>
                ) : (
                  <span className="text-red-400 font-medium">Sold Out — Bespoke Order on Request</span>
                )}
              </div>

              {/* Size Selector */}
              <div className="mt-6">
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="text-[11px] uppercase tracking-wider text-[#9B9B9B] font-semibold">
                    Select Size
                  </span>
                  <span className="text-[11px] text-[#C9A227]">Men's Sizing Scale</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[48px] py-2 px-3.5 rounded text-xs uppercase font-medium transition-all ${
                        selectedSize === size
                          ? 'bg-[#C9A227] text-[#080808] font-bold shadow-lg shadow-[#C9A227]/20'
                          : 'bg-[#141414] border border-[#262626] text-[#D5D2CA] hover:border-[#C9A227]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selector */}
              <div className="mt-6">
                <span className="block text-[11px] uppercase tracking-wider text-[#9B9B9B] font-semibold mb-2">
                  Shade: <strong className="text-[#F5F2EA]">{selectedColor}</strong>
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {product.colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`py-1.5 px-3 rounded text-xs uppercase font-medium transition-all ${
                        selectedColor === color
                          ? 'bg-[#1F1F1F] border border-[#C9A227] text-[#E0B84F] font-bold'
                          : 'bg-[#141414] border border-[#262626] text-[#9B9B9B] hover:text-[#F5F2EA]'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Stepper */}
              <div className="mt-6">
                <span className="block text-[11px] uppercase tracking-wider text-[#9B9B9B] font-semibold mb-2">
                  Quantity
                </span>
                <div className="inline-flex items-center border border-[#2B2B2B] rounded bg-[#141414]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="p-2 text-[#9B9B9B] hover:text-[#F5F2EA] disabled:opacity-30"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-4 text-xs font-bold text-[#F5F2EA]">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="p-2 text-[#9B9B9B] hover:text-[#F5F2EA] disabled:opacity-30"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 space-y-3">
                {/* 1. Order Via WhatsApp Button */}
                <button
                  id="product-order-whatsapp-btn"
                  onClick={handleOrderViaWhatsApp}
                  disabled={product.stock <= 0}
                  className="w-full py-4 bg-[#C9A227] hover:bg-[#E0B84F] text-[#080808] text-xs uppercase tracking-[0.2em] font-bold rounded flex items-center justify-center space-x-2 transition-all shadow-xl hover:shadow-[#C9A227]/30 disabled:opacity-50"
                >
                  <MessageCircle size={18} />
                  <span>ORDER VIA WHATSAPP CONCIERGE</span>
                </button>

                {/* 2. Add To Bag Button */}
                <button
                  id="product-add-to-cart-btn"
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className="w-full py-3.5 bg-[#141414] hover:bg-[#1C1C1C] border border-[#2B2B2B] hover:border-[#C9A227] text-[#F5F2EA] text-xs uppercase tracking-[0.2em] font-semibold rounded flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                >
                  <ShoppingBag size={16} className="text-[#C9A227]" />
                  <span>ADD TO ATELIER BAG</span>
                </button>
              </div>

              {/* Atelier Assurance Checklist */}
              <div className="mt-8 pt-6 border-t border-[#1A1A1A] space-y-2.5 text-xs text-[#9B9B9B]">
                <div className="flex items-center space-x-2">
                  <ShieldCheck size={16} className="text-[#C9A227] shrink-0" />
                  <span>Authenticity Guaranteed with 24K Gilded Hardware</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Truck size={16} className="text-[#C9A227] shrink-0" />
                  <span>Complimentary Priority Express Shipping over ₹2,999</span>
                </div>
                <div className="flex items-center space-x-2">
                  <RotateCcw size={16} className="text-[#C9A227] shrink-0" />
                  <span>7-Day Atelier Exchanges & Bespoke Alterations</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Narrative & Craftsmanship Description */}
        <div className="py-14 border-b border-[#1A1A1A] grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-editorial text-xl font-bold text-[#F5F2EA]">
              The Creation & Silhouette
            </h3>
            <p className="text-sm text-[#D5D2CA] leading-relaxed font-light">
              {product.description}
            </p>
          </div>

          <div className="space-y-4 bg-[#0D0D0D] border border-[#1A1A1A] p-6 rounded">
            <h4 className="text-xs uppercase tracking-[0.2em] text-[#C9A227] font-semibold">
              Garment Specifications
            </h4>
            <ul className="text-xs text-[#9B9B9B] space-y-2">
              <li><strong className="text-[#D5D2CA]">Foundation:</strong> 100% Virgin Fiber & Silk Lining</li>
              <li><strong className="text-[#D5D2CA]">Hardware:</strong> 24K Electroplated Brass</li>
              <li><strong className="text-[#D5D2CA]">Fit:</strong> Architectural Tailored Cut</li>
              <li><strong className="text-[#D5D2CA]">Care:</strong> Specialist Dry Clean Only</li>
            </ul>
          </div>
        </div>

        {/* Patron Reviews Section */}
        <div className="py-14 border-b border-[#1A1A1A]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#C9A227] font-bold">
                TESTIMONIALS
              </span>
              <h3 className="font-editorial text-2xl font-bold text-[#F5F2EA]">
                Patron Reviews ({reviews.length})
              </h3>
            </div>
            <button
              onClick={() => setReviewModalOpen(true)}
              className="px-5 py-2.5 rounded bg-[#141414] border border-[#2B2B2B] hover:border-[#C9A227] text-xs uppercase tracking-wider text-[#E0B84F] font-semibold transition-all"
            >
              Write Patron Review
            </button>
          </div>

          {reviews.length === 0 ? (
            <div className="py-10 text-center text-xs text-[#888888] bg-[#0D0D0D] border border-[#1A1A1A] rounded">
              Be the first patron to leave a testimonial for this creation.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map(rev => (
                <div key={rev.id} className="p-5 rounded bg-[#0D0D0D] border border-[#1A1A1A]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#F5F2EA]">{rev.user_name}</span>
                    <div className="flex items-center space-x-1 text-[#C9A227]">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} size={12} className="fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-[#D5D2CA] leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                  <span className="text-[10px] text-[#666666] mt-3 block">
                    {new Date(rev.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Related Creations */}
        {related.length > 0 && (
          <div className="py-14">
            <h3 className="font-editorial text-2xl font-bold text-[#F5F2EA] mb-8">
              Complementary Ensemble Pieces
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map(rel => (
                <ProductCard
                  key={rel.id}
                  product={rel}
                  onSelect={s => navigate('product', { slug: s })}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Write Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0F0F0F] border border-[#262626] rounded p-6 sm:p-8 relative">
            <button
              onClick={() => setReviewModalOpen(false)}
              className="absolute top-4 right-4 text-[#888888] hover:text-[#F5F2EA]"
            >
              <X size={20} />
            </button>

            <h3 className="font-editorial text-xl font-bold text-[#F5F2EA] mb-2">
              Patron Review
            </h3>
            <p className="text-xs text-[#9B9B9B] mb-6">
              Share your thoughts on the drape, fit, and craftsmanship of {product.name}.
            </p>

            {reviewSuccess ? (
              <div className="p-4 rounded bg-emerald-950/40 border border-emerald-800 text-emerald-200 text-xs">
                Your review has been submitted for atelier verification.
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                {reviewError && (
                  <div className="p-3 rounded bg-red-950/40 border border-red-800 text-red-200 text-xs">
                    {reviewError}
                  </div>
                )}

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B] mb-2">
                    Rating
                  </label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setReviewRating(r)}
                        className="p-1 text-[#C9A227]"
                      >
                        <Star
                          size={22}
                          className={r <= reviewRating ? 'fill-current' : 'text-[#444444]'}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#9B9B9B] mb-1">
                    Your Testimonial
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                    placeholder="Describe the fabric quality, stitching, and feel..."
                    className="w-full bg-[#141414] border border-[#2B2B2B] focus:border-[#C9A227] rounded p-3 text-xs text-[#F5F2EA] outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="w-full py-3 bg-[#C9A227] hover:bg-[#E0B84F] text-[#080808] text-xs uppercase tracking-widest font-bold rounded transition-all disabled:opacity-50"
                >
                  {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
