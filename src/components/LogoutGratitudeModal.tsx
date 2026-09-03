import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, CheckCircle2, ArrowRight } from 'lucide-react';

interface LogoutGratitudeModalProps {
  isOpen: boolean;
  userName?: string;
  onConfirmLogout: () => void;
  onCancel: () => void;
}

export const LogoutGratitudeModal: React.FC<LogoutGratitudeModalProps> = ({
  isOpen,
  userName,
  onConfirmLogout,
  onCancel
}) => {
  const [isConcluding, setIsConcluding] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsConcluding(false);
    }
  }, [isOpen]);

  const handleProceed = () => {
    setIsConcluding(true);
    setTimeout(() => {
      onConfirmLogout();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        id="logout-gratitude-backdrop"
        className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      >
        <motion.div
          id="logout-gratitude-card"
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="w-full max-w-md bg-[#0C0C0C] border border-[#2A2A2A] rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.9)] overflow-hidden relative"
        >
          {/* Subtle Top Gold Accent Line */}
          <div className="h-1 w-full bg-gradient-to-r from-[#C9A227]/20 via-[#C9A227] to-[#C9A227]/20" />

          <div className="p-6 sm:p-8 text-center space-y-5">
            {/* Animated Gratitude Icon Monogram */}
            <div className="relative mx-auto w-16 h-16 rounded-full bg-[#171717] border border-[#C9A227]/40 flex items-center justify-center shadow-lg shadow-[#C9A227]/10">
              <Sparkles className="w-8 h-8 text-[#C9A227] animate-pulse" />
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#C9A227] text-black flex items-center justify-center">
                <Heart size={11} className="fill-black" />
              </div>
            </div>

            {/* Gratitude Eyebrow & Headline */}
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#C9A227] font-semibold block mb-1">
                With Sincere Gratitude
              </span>
              <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#F5F2EA]">
                Thank You for Visiting
              </h2>
              <p className="text-xs uppercase tracking-widest text-[#9B9B9B] mt-0.5">
                87 PINCODE MENSWEAR ATELIER
              </p>
            </div>

            {/* Personalized Message */}
            <div className="bg-[#121212] border border-[#1F1F1F] rounded-xl p-4 text-left space-y-2">
              <p className="text-xs text-[#E5E2DA] leading-relaxed">
                Dear <span className="font-semibold text-[#E0B84F]">{userName || 'Valued Patron'}</span>,
              </p>
              <p className="text-xs text-[#A8A49A] leading-relaxed">
                It has been an honor catering to your sartorial style. Your trust and patronage mean everything to our atelier. Our master craftsmen look forward to welcoming you back soon.
              </p>
              <p className="text-[11px] italic text-[#777777] pt-1 border-t border-[#1C1C1C]">
                “Elegance is not about being noticed, it's about being remembered.”
              </p>
            </div>

            {/* Status if concluding */}
            {isConcluding ? (
              <div className="flex items-center justify-center space-x-2 py-3 text-xs text-[#C9A227]">
                <CheckCircle2 size={16} className="animate-spin" />
                <span>Signing you out with grace... Until next time.</span>
              </div>
            ) : (
              /* Action Controls */
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  id="gratitude-cancel-btn"
                  onClick={onCancel}
                  className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl border border-[#2A2A2A] hover:border-[#444] text-[#B5B2AA] hover:text-[#F5F2EA] text-xs uppercase tracking-wider font-semibold transition-colors order-2 sm:order-1"
                >
                  Stay in Atelier
                </button>
                <button
                  id="gratitude-confirm-logout-btn"
                  onClick={handleProceed}
                  className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-[#C9A227] hover:bg-[#D4AF37] text-[#080808] text-xs uppercase tracking-wider font-bold transition-all shadow-md shadow-[#C9A227]/20 flex items-center justify-center space-x-1.5 order-1 sm:order-2"
                >
                  <span>Farewell & Sign Out</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
