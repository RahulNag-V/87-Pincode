import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext.js';

interface CategoriesViewProps {
  navigate: (view: string, params?: Record<string, any>) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({ navigate }) => {
  const { categories } = useStore();

  return (
    <div className="min-h-screen bg-[#080808] text-[#F5F2EA] py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#C9A227] font-semibold">
            ATELIER ARCHIVES
          </span>
          <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-[#F5F2EA] mt-2 mb-4">
            Curated Collections
          </h1>
          <p className="text-xs sm:text-sm text-[#9B9B9B] leading-relaxed font-light">
            Each collection is developed around rigorous architectural proportions, noble fibers,
            and hand-finished 24K gilded details.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((cat, idx) => (
            <div
              key={cat.id}
              onClick={() => navigate('category', { slug: cat.slug })}
              className="group relative h-[420px] rounded overflow-hidden cursor-pointer border border-[#1C1C1C] hover:border-[#C9A227]/60 transition-all duration-500 flex flex-col justify-end p-8"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out brightness-[0.6]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/40 to-transparent" />

              <div className="relative z-10">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#C9A227] font-semibold">
                  Collection 0{idx + 1}
                </span>
                <h3 className="font-editorial text-2xl font-bold text-[#F5F2EA] mt-1 mb-2">
                  {cat.name}
                </h3>
                <p className="text-xs text-[#D5D2CA]/80 line-clamp-2 leading-relaxed mb-4">
                  {cat.description}
                </p>
                <div className="inline-flex items-center space-x-2 text-xs uppercase tracking-widest text-[#E0B84F] font-semibold group-hover:translate-x-1 transition-transform">
                  <span>Explore Collection</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
