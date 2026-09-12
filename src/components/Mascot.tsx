import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { triggerHaptic, playSound } from '../lib/audio';

export type MascotMood =
  | 'happy'
  | 'celebrate'
  | 'dance'
  | 'fire'
  | 'love'
  | 'thinking'
  | 'sad'
  | 'shocked'
  | 'sleeping'
  | 'eating'
  | 'ninja'
  | 'dizzy'
  | 'waving'
  | 'excited'
  | 'petting'
  | 'petting_love'
  | 'petting_wink'
  | 'petting_stars'
  | 'petting_tickle'
  | 'petting_snuggle'
  | 'idle';

interface MascotProps {
  message?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  mood?: MascotMood;
  interactive?: boolean;
  className?: string;
  onClick?: () => void;
}

export const GkooBirdSvg: React.FC<{ mood?: MascotMood; className?: string }> = ({
  mood = 'happy',
  className = "w-full h-full drop-shadow-md",
}) => {
  return (
    <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        {/* Ambient Glow */}
        <radialGradient id="gkoo_glow" cx="50%" cy="50%" r="55%">
          <stop
            offset="0%"
            stopColor={
              mood === 'sad'
                ? '#93C5FD'
                : mood === 'fire'
                ? '#F97316'
                : mood === 'love'
                ? '#FB7185'
                : mood === 'dance'
                ? '#A855F7'
                : '#FF8A8A'
            }
            stopOpacity={mood === 'fire' ? '0.55' : '0.35'}
          />
          <stop offset="100%" stopColor="#FF8A8A" stopOpacity="0" />
        </radialGradient>

        {/* 3D Body Gradient */}
        <linearGradient id="gkoo_body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop
            offset="0%"
            stopColor={
              mood === 'sad'
                ? '#F87171'
                : mood === 'fire'
                ? '#FF6B35'
                : mood === 'love'
                ? '#FF758F'
                : '#FF8F8F'
            }
          />
          <stop
            offset="100%"
            stopColor={
              mood === 'sad'
                ? '#DC2626'
                : mood === 'fire'
                ? '#EA580C'
                : mood === 'love'
                ? '#E11D48'
                : '#FF5F6D'
            }
          />
        </linearGradient>

        {/* 3D Wing Gradient */}
        <linearGradient id="gkoo_wing" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FF6B6B" />
          <stop offset="100%" stopColor="#E64553" />
        </linearGradient>

        {/* Soft Pearlescent Belly */}
        <linearGradient id="gkoo_belly" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F1F5F9" />
        </linearGradient>

        {/* Vibrant Golden Beak */}
        <linearGradient id="gkoo_beak" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFCB52" />
          <stop offset="100%" stopColor="#FF9F1A" />
        </linearGradient>

        {/* Golden Sparkle Gradient */}
        <linearGradient id="gold_spark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>

        {/* Fire Aura Flames */}
        <linearGradient id="flame_grad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#EF4444" stopOpacity="0.8" />
          <stop offset="60%" stopColor="#F59E0B" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FEF08A" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {/* ================= BACKGROUND EFFECTS & AURAS ================= */}
      {mood === 'fire' && (
        <motion.g
          animate={{ scale: [1, 1.1, 1], opacity: [0.7, 0.95, 0.7] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          style={{ transformOrigin: '128px 128px' }}
        >
          {/* Raging Fire Aura */}
          <path
            fill="url(#flame_grad)"
            d="M128 10 C160 50 190 30 200 80 C230 110 230 170 200 210 C170 240 86 240 56 210 C26 170 26 110 56 80 C66 30 96 50 128 10 Z"
          />
        </motion.g>
      )}

      {/* Floating Ambient Aura Glow */}
      <circle cx="128" cy="128" r="96" fill="url(#gkoo_glow)" />

      {/* Ground Shadow */}
      <ellipse cx="128" cy="226" rx="54" ry="9" fill="#000" opacity="0.16" />

      {/* Bird Feet */}
      <motion.g
        animate={
          mood === 'celebrate' || mood === 'dance'
            ? { y: [0, -5, 0] }
            : {}
        }
        transition={{ repeat: Infinity, duration: 0.6 }}
      >
        <path d="M104 208 L94 222 M104 208 L104 223 M104 208 L114 222" stroke="#F59E0B" strokeWidth="5" strokeLinecap="round" />
        <path d="M152 208 L142 222 M152 208 L152 223 M152 208 L162 222" stroke="#F59E0B" strokeWidth="5" strokeLinecap="round" />
      </motion.g>

      {/* Main Body Solid Base Fallback (Prevents mobile transparency bug) */}
      <path
        fill={mood === 'sad' ? '#DC2626' : mood === 'fire' ? '#EA580C' : mood === 'love' ? '#E11D48' : '#FF5F6D'}
        d="M128 34 C176 34 216 72 216 124 C216 178 178 214 128 214 C78 214 40 178 40 124 C40 72 80 34 128 34 Z"
      />
      {/* Main Body 3D Gradient Layer */}
      <path
        fill="url(#gkoo_body)"
        d="M128 34 C176 34 216 72 216 124 C216 178 178 214 128 214 C78 214 40 178 40 124 C40 72 80 34 128 34 Z"
      />

      {/* Feather Crest / Hair Tuft with Dynamic Physics */}
      {mood !== 'celebrate' && mood !== 'sleeping' && (
        <motion.g
          animate={
            mood === 'excited' || mood === 'dance' || mood === 'fire'
              ? { rotate: [-8, 12, -8] }
              : mood === 'thinking'
              ? { rotate: [4, -4, 4] }
              : { rotate: [-2, 3, -2] }
          }
          transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
          style={{ transformOrigin: '128px 40px' }}
        >
          <path fill="#FF7070" d="M116 34 C116 12 136 6 148 18 C140 22 136 34 136 44 Z" />
          <path fill="#FF5C6C" d="M132 34 C142 8 170 8 176 28 C162 28 150 38 145 50 Z" />
        </motion.g>
      )}

      {/* Soft White Belly (Solid Base + Pearlescent Gradient) */}
      <ellipse cx="128" cy="158" rx="46" ry="40" fill="#FFFFFF" />
      <ellipse cx="128" cy="158" rx="46" ry="40" fill="url(#gkoo_belly)" />

      {/* ======================= ACCESSORIES (HATS, HEADBANDS, HEADPHONES) ======================= */}
      {mood === 'celebrate' && (
        // Colorful Party Hat with Pom-Pom
        <motion.g
          animate={{ rotate: [-4, 6, -4] }}
          transition={{ repeat: Infinity, duration: 1.0, ease: 'easeInOut' }}
          style={{ transformOrigin: '128px 36px' }}
        >
          <polygon points="128,4 104,40 152,40" fill="#F59E0B" />
          <polygon points="128,4 116,40 140,40" fill="#EF4444" />
          <polygon points="128,4 122,40 134,40" fill="#3B82F6" />
          <circle cx="128" cy="4" r="7" fill="#FBBF24" />
        </motion.g>
      )}

      {mood === 'dance' && (
        // DJ Headphones over head
        <motion.g
          animate={{ scale: [1, 1.05, 1], y: [0, -3, 0] }}
          transition={{ repeat: Infinity, duration: 0.5 }}
          style={{ transformOrigin: '128px 70px' }}
        >
          {/* Headband */}
          <path d="M50 110 C50 40 206 40 206 110" stroke="#1E293B" strokeWidth="12" fill="none" strokeLinecap="round" />
          <path d="M50 110 C50 40 206 40 206 110" stroke="#A855F7" strokeWidth="6" fill="none" strokeLinecap="round" />
          {/* Ear cushions */}
          <rect x="36" y="96" width="22" height="38" rx="10" fill="#1E293B" />
          <rect x="40" y="100" width="14" height="30" rx="6" fill="#A855F7" />
          <rect x="198" y="96" width="22" height="38" rx="10" fill="#1E293B" />
          <rect x="202" y="100" width="14" height="30" rx="6" fill="#A855F7" />
        </motion.g>
      )}

      {mood === 'ninja' && (
        // Red Ninja Warrior Headband
        <g>
          <path d="M42 84 Q128 78 214 84 L214 98 Q128 92 42 98 Z" fill="#DC2626" />
          <circle cx="128" cy="88" r="7" fill="#FEE2E2" />
          <text x="123" y="92" fontSize="9" fontWeight="bold" fill="#DC2626">忍</text>
          {/* Trailing Headband Tails */}
          <motion.path
            animate={{ rotate: [-6, 8, -6] }}
            transition={{ repeat: Infinity, duration: 1 }}
            style={{ transformOrigin: '214px 90px' }}
            d="M214 90 Q240 85 250 105 Q240 100 214 96 Z"
            fill="#DC2626"
          />
        </g>
      )}

      {mood === 'sleeping' && (
        // Cozy Sleepy Nightcap
        <g>
          <path d="M96 38 C128 10 170 12 186 36 C160 38 120 42 96 38 Z" fill="#3B82F6" />
          <path d="M186 36 C210 50 220 85 208 95 C200 95 198 75 186 36 Z" fill="#2563EB" />
          <circle cx="208" cy="98" r="8" fill="#FFFFFF" />
        </g>
      )}

      {/* ======================= LEFT WING ======================= */}
      {mood === 'celebrate' || mood === 'dance' ? (
        // Victory / Party Wing (Raised High & Grooving)
        <motion.path
          animate={{ rotate: [-14, 18, -14] }}
          transition={{ repeat: Infinity, duration: mood === 'dance' ? 0.45 : 0.7, ease: 'easeInOut' }}
          style={{ transformOrigin: '70px 140px' }}
          fill="url(#gkoo_wing)"
          d="M50 140 C14 100 24 50 64 68 C76 96 74 120 70 140 Z"
        />
      ) : mood === 'thinking' ? (
        // Thinking Wing (Hand on Beak/Cheek)
        <path fill="url(#gkoo_wing)" d="M60 140 C52 100 85 110 108 128 C96 142 75 155 60 140 Z" />
      ) : mood === 'eating' ? (
        // Wing holding food
        <path fill="url(#gkoo_wing)" d="M60 136 C45 115 80 125 112 144 C95 152 75 155 60 136 Z" />
      ) : mood === 'sad' ? (
        // Drooping Sad Wing
        <path fill="url(#gkoo_wing)" d="M54 130 C30 145 28 185 64 195 C74 175 78 155 76 132 Z" />
      ) : (
        // Standard / Happy Left Wing
        <motion.path
          animate={mood === 'excited' || mood === 'fire' ? { rotate: [-14, 14, -14] } : { rotate: [-4, 4, -4] }}
          transition={{ repeat: Infinity, duration: mood === 'excited' || mood === 'fire' ? 0.5 : 1.8, ease: 'easeInOut' }}
          style={{ transformOrigin: '65px 130px' }}
          fill="url(#gkoo_wing)"
          d="M54 118 C22 126 20 170 60 182 C74 164 82 146 82 122 Z"
        />
      )}

      {/* ======================= RIGHT WING ======================= */}
      {mood === 'celebrate' || mood === 'dance' ? (
        // Victory / Party Wing (Raised High & Grooving)
        <motion.path
          animate={{ rotate: [14, -18, 14] }}
          transition={{ repeat: Infinity, duration: mood === 'dance' ? 0.45 : 0.7, ease: 'easeInOut' }}
          style={{ transformOrigin: '186px 140px' }}
          fill="url(#gkoo_wing)"
          d="M206 140 C242 100 232 50 192 68 C180 96 182 120 186 140 Z"
        />
      ) : mood === 'waving' ? (
        // Friendly Waving Hand/Wing
        <motion.path
          animate={{ rotate: [-28, 22, -28] }}
          transition={{ repeat: Infinity, duration: 0.75, ease: 'easeInOut' }}
          style={{ transformOrigin: '190px 130px' }}
          fill="url(#gkoo_wing)"
          d="M192 128 C232 90 248 60 215 54 C190 76 182 105 186 128 Z"
        />
      ) : mood === 'sad' ? (
        // Drooping Sad Wing
        <path fill="url(#gkoo_wing)" d="M202 130 C226 145 228 185 192 195 C182 175 178 155 180 132 Z" />
      ) : (
        // Standard Right Wing
        <motion.path
          animate={mood === 'excited' || mood === 'fire' ? { rotate: [14, -14, 14] } : { rotate: [4, -4, 4] }}
          transition={{ repeat: Infinity, duration: mood === 'excited' || mood === 'fire' ? 0.5 : 1.8, ease: 'easeInOut' }}
          style={{ transformOrigin: '191px 130px' }}
          fill="url(#gkoo_wing)"
          d="M202 118 C234 126 236 170 196 182 C182 164 174 146 174 122 Z"
        />
      )}

      {/* ======================= EYES & BROWS ======================= */}
      {mood === 'celebrate' ? (
        // Star Eyes for Victory Celebration (★ ★)
        <g>
          <circle cx="102" cy="104" r="24" fill="#FFF" />
          <circle cx="154" cy="104" r="24" fill="#FFF" />
          <motion.path
            animate={{ rotate: [0, 360], scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: 'linear' }}
            style={{ transformOrigin: '102px 104px' }}
            fill="url(#gold_spark)"
            d="M102 92 L105 101 L114 102 L107 108 L109 117 L102 112 L95 117 L97 108 L90 102 L99 101 Z"
          />
          <motion.path
            animate={{ rotate: [0, 360], scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: 'linear' }}
            style={{ transformOrigin: '154px 104px' }}
            fill="url(#gold_spark)"
            d="M154 92 L157 101 L166 102 L159 108 L161 117 L154 112 L147 117 L149 108 L142 102 L151 101 Z"
          />
          <path d="M80 72 Q102 60 118 70" stroke="#2D3748" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M138 70 Q154 60 176 72" stroke="#2D3748" strokeWidth="6" strokeLinecap="round" fill="none" />
        </g>
      ) : mood === 'petting' ? (
        // Blissful Petting / Purring Closed Eyes (^_^ with sweet blushing smile)
        <g>
          <motion.path
            animate={{ scaleY: [1, 1.15, 1], y: [0, -1, 0] }}
            transition={{ repeat: Infinity, duration: 0.8, ease: 'easeInOut' }}
            d="M84 112 Q102 88 120 112"
            stroke="#111827"
            strokeWidth="6.5"
            strokeLinecap="round"
            fill="none"
          />
          <motion.path
            animate={{ scaleY: [1, 1.15, 1], y: [0, -1, 0] }}
            transition={{ repeat: Infinity, duration: 0.8, ease: 'easeInOut' }}
            d="M136 112 Q154 88 172 112"
            stroke="#111827"
            strokeWidth="6.5"
            strokeLinecap="round"
            fill="none"
          />
          <path d="M82 74 Q102 58 120 70" stroke="#2D3748" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M136 70 Q154 58 174 74" stroke="#2D3748" strokeWidth="6" strokeLinecap="round" fill="none" />
          
          {/* Floating Love Heart above head */}
          <motion.path
            animate={{ y: [-4, -16, -4], scale: [1, 1.25, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
            fill="#E11D48"
            d="M128 28 C128 28 116 18 116 10 C116 4 121 0 126 0 C128 0 128 2 128 2 C128 2 128 0 130 0 C135 0 140 4 140 10 C140 18 128 28 128 28 Z"
          />
        </g>
      ) : mood === 'petting_love' ? (
        // Overwhelmed with Love (Big Heart Eyes 😍)
        <g>
          <circle cx="102" cy="104" r="24" fill="#FFF" />
          <circle cx="154" cy="104" r="24" fill="#FFF" />
          <motion.path
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ repeat: Infinity, duration: 0.6 }}
            style={{ transformOrigin: '102px 104px' }}
            fill="#E11D48"
            d="M102 114 C102 114 88 106 88 98 C88 92 93 88 98 88 C101 88 102 91 102 91 C102 91 103 88 106 88 C111 88 116 92 116 98 C116 106 102 114 102 114 Z"
          />
          <motion.path
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ repeat: Infinity, duration: 0.6 }}
            style={{ transformOrigin: '154px 104px' }}
            fill="#E11D48"
            d="M154 114 C154 114 140 106 140 98 C140 92 145 88 150 88 C153 88 154 91 154 91 C154 91 155 88 158 88 C163 88 168 92 168 98 C168 106 154 114 154 114 Z"
          />
          <path d="M80 68 Q102 54 120 68" stroke="#2D3748" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M136 68 Q154 54 176 68" stroke="#2D3748" strokeWidth="6" strokeLinecap="round" fill="none" />
        </g>
      ) : mood === 'petting_wink' ? (
        // Playful Wink (> ^) with Sparkles
        <g>
          <circle cx="102" cy="104" r="24" fill="#FFF" />
          <circle cx="102" cy="108" r="13" fill="#111827" />
          <circle cx="107" cy="103" r="4.5" fill="#FFF" />
          <path d="M138 108 Q154 90 170 108" stroke="#111827" strokeWidth="7" strokeLinecap="round" fill="none" />
          <path d="M82 74 Q102 62 118 72" stroke="#2D3748" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M138 70 Q154 58 174 72" stroke="#2D3748" strokeWidth="6" strokeLinecap="round" fill="none" />
        </g>
      ) : mood === 'petting_stars' ? (
        // Ecstatic Star Eyes (★ ★)
        <g>
          <circle cx="102" cy="104" r="24" fill="#FFF" />
          <circle cx="154" cy="104" r="24" fill="#FFF" />
          <motion.path
            animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
            style={{ transformOrigin: '102px 104px' }}
            fill="url(#gold_spark)"
            d="M102 92 L105 101 L114 102 L107 108 L109 117 L102 112 L95 117 L97 108 L90 102 L99 101 Z"
          />
          <motion.path
            animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
            style={{ transformOrigin: '154px 104px' }}
            fill="url(#gold_spark)"
            d="M154 92 L157 101 L166 102 L159 108 L161 117 L154 112 L147 117 L149 108 L142 102 L151 101 Z"
          />
          <path d="M80 70 Q102 56 120 68" stroke="#2D3748" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M136 68 Q154 56 176 70" stroke="#2D3748" strokeWidth="6" strokeLinecap="round" fill="none" />
        </g>
      ) : mood === 'petting_tickle' ? (
        // Ticklish Giggling Eyes (> <)
        <g>
          <path d="M86 96 L104 108 L86 120" stroke="#111827" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M170 96 L152 108 L170 120" stroke="#111827" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M82 74 Q102 60 118 72" stroke="#2D3748" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M138 72 Q154 60 174 74" stroke="#2D3748" strokeWidth="6" strokeLinecap="round" fill="none" />
        </g>
      ) : mood === 'petting_snuggle' ? (
        // Cozy Snuggle Sleepy Eyes (˘⌣˘)
        <g>
          <path d="M86 106 Q102 118 118 106" stroke="#111827" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M138 106 Q154 118 170 106" stroke="#111827" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M84 80 Q102 68 118 80" stroke="#2D3748" strokeWidth="5.5" strokeLinecap="round" fill="none" />
          <path d="M138 80 Q154 68 172 80" stroke="#2D3748" strokeWidth="5.5" strokeLinecap="round" fill="none" />
        </g>
      ) : mood === 'love' ? (
        // Heart-Shaped Love Eyes (😍)
        <g>
          <circle cx="102" cy="104" r="24" fill="#FFF" />
          <circle cx="154" cy="104" r="24" fill="#FFF" />
          <motion.path
            animate={{ scale: [1, 1.25, 1] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            style={{ transformOrigin: '102px 104px' }}
            fill="#E11D48"
            d="M102 114 C102 114 88 106 88 98 C88 92 93 88 98 88 C101 88 102 91 102 91 C102 91 103 88 106 88 C111 88 116 92 116 98 C116 106 102 114 102 114 Z"
          />
          <motion.path
            animate={{ scale: [1, 1.25, 1] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            style={{ transformOrigin: '154px 104px' }}
            fill="#E11D48"
            d="M154 114 C154 114 140 106 140 98 C140 92 145 88 150 88 C153 88 154 91 154 91 C154 91 155 88 158 88 C163 88 168 92 168 98 C168 106 154 114 154 114 Z"
          />
        </g>
      ) : mood === 'fire' ? (
        // Flaming Fierce Eyes (🔥)
        <g>
          <circle cx="102" cy="104" r="24" fill="#FFF" />
          <circle cx="154" cy="104" r="24" fill="#FFF" />
          <circle cx="102" cy="104" r="14" fill="#EA580C" />
          <circle cx="154" cy="104" r="14" fill="#EA580C" />
          <circle cx="102" cy="104" r="8" fill="#FBBF24" />
          <circle cx="154" cy="104" r="8" fill="#FBBF24" />
          {/* Intense Warrior Brows */}
          <path d="M80 82 L120 72" stroke="#2D3748" strokeWidth="7" strokeLinecap="round" />
          <path d="M136 72 L176 82" stroke="#2D3748" strokeWidth="7" strokeLinecap="round" />
        </g>
      ) : mood === 'dizzy' ? (
        // Spiral Dizzy Eyes (🌀)
        <g>
          <circle cx="102" cy="104" r="24" fill="#FFF" />
          <circle cx="154" cy="104" r="24" fill="#FFF" />
          <motion.g
            animate={{ rotate: [0, 360] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
            style={{ transformOrigin: '102px 104px' }}
          >
            <path d="M102 104 m-12,0 a12,12 0 1,0 24,0 a12,12 0 1,0 -24,0 m6,0 a6,6 0 1,0 12,0 a6,6 0 1,0 -12,0" stroke="#4F46E5" strokeWidth="3.5" fill="none" />
          </motion.g>
          <motion.g
            animate={{ rotate: [0, -360] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
            style={{ transformOrigin: '154px 104px' }}
          >
            <path d="M154 104 m-12,0 a12,12 0 1,0 24,0 a12,12 0 1,0 -24,0 m6,0 a6,6 0 1,0 12,0 a6,6 0 1,0 -12,0" stroke="#4F46E5" strokeWidth="3.5" fill="none" />
          </motion.g>
        </g>
      ) : mood === 'sleeping' ? (
        // Peaceful Closed Sleepy Eyes (-.-)
        <g>
          <path d="M88 108 Q102 118 116 108" stroke="#334155" strokeWidth="5.5" strokeLinecap="round" fill="none" />
          <path d="M140 108 Q154 118 168 108" stroke="#334155" strokeWidth="5.5" strokeLinecap="round" fill="none" />
        </g>
      ) : mood === 'thinking' ? (
        // Curious / Pondering Eyes (Looking up-right)
        <g>
          <circle cx="102" cy="104" r="24" fill="#FFF" />
          <circle cx="154" cy="104" r="24" fill="#FFF" />
          <circle cx="108" cy="98" r="13" fill="#111827" />
          <circle cx="160" cy="98" r="13" fill="#111827" />
          <circle cx="112" cy="94" r="4" fill="#FFF" />
          <circle cx="164" cy="94" r="4" fill="#FFF" />
          <path d="M82 72 Q102 58 120 68" stroke="#2D3748" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M136 78 Q154 78 174 82" stroke="#2D3748" strokeWidth="6" strokeLinecap="round" fill="none" />
        </g>
      ) : mood === 'sad' ? (
        // Sad / Crying Eyes with Drooping Brows & Teardrop
        <g>
          <circle cx="102" cy="106" r="24" fill="#FFF" />
          <circle cx="154" cy="106" r="24" fill="#FFF" />
          <circle cx="102" cy="112" r="14" fill="#1E293B" />
          <circle cx="154" cy="112" r="14" fill="#1E293B" />
          <circle cx="102" cy="112" r="8" fill="#60A5FA" opacity="0.8" />
          <circle cx="154" cy="112" r="8" fill="#60A5FA" opacity="0.8" />
          <circle cx="98" cy="108" r="4" fill="#FFF" />
          <circle cx="150" cy="108" r="4" fill="#FFF" />
          <path d="M82 82 Q102 72 120 84" stroke="#2D3748" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M136 84 Q154 72 174 82" stroke="#2D3748" strokeWidth="6" strokeLinecap="round" fill="none" />
          <motion.path
            animate={{ y: [0, 16, 32], opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            fill="#38BDF8"
            d="M78 120 C74 126 74 134 80 134 C86 134 86 126 80 120 Z"
          />
        </g>
      ) : mood === 'shocked' ? (
        // Shocked / Wide Open Eyes (O_O)
        <g>
          <circle cx="102" cy="104" r="25" fill="#FFF" />
          <circle cx="154" cy="104" r="25" fill="#FFF" />
          <circle cx="102" cy="104" r="8" fill="#111827" />
          <circle cx="154" cy="104" r="8" fill="#111827" />
          <path d="M80 66 Q102 54 120 66" stroke="#2D3748" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M136 66 Q154 54 176 66" stroke="#2D3748" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path fill="#38BDF8" d="M182 80 C180 86 180 94 186 94 C192 94 192 86 186 80 Z" />
        </g>
      ) : mood === 'excited' ? (
        // Playful Wink (> ^)
        <g>
          <circle cx="102" cy="104" r="24" fill="#FFF" />
          <circle cx="102" cy="108" r="13" fill="#111827" />
          <circle cx="107" cy="103" r="4" fill="#FFF" />
          <path d="M140 108 Q154 94 168 108" stroke="#111827" strokeWidth="7" strokeLinecap="round" fill="none" />
          <path d="M82 76 Q102 66 118 74" stroke="#2D3748" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M138 72 Q154 62 174 74" stroke="#2D3748" strokeWidth="6" strokeLinecap="round" fill="none" />
        </g>
      ) : (
        // Standard Happy / Idle Eyes with Natural Blinking Loop
        <motion.g
          animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
          transition={{ repeat: Infinity, duration: 3.6, times: [0, 0.9, 0.94, 0.98, 1] }}
          style={{ transformOrigin: '128px 104px' }}
        >
          <circle cx="102" cy="104" r="24" fill="#FFF" />
          <circle cx="154" cy="104" r="24" fill="#FFF" />
          <circle cx="102" cy="108" r="13" fill="#111827" />
          <circle cx="154" cy="108" r="13" fill="#111827" />
          <circle cx="107" cy="103" r="4.5" fill="#FFF" />
          <circle cx="159" cy="103" r="4.5" fill="#FFF" />
          <path d="M82 78 Q102 68 118 76" stroke="#2D3748" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M138 76 Q154 68 174 78" stroke="#2D3748" strokeWidth="6" strokeLinecap="round" fill="none" />
        </motion.g>
      )}

      {/* Rosy Cheeks (Blushing) */}
      <ellipse cx="72" cy="138" rx={mood.startsWith('petting') ? 18 : 14} ry={mood.startsWith('petting') ? 12 : 10} fill={mood === 'love' || mood.startsWith('petting') ? '#FDA4AF' : '#FFD89A'} opacity="0.95" />
      <ellipse cx="184" cy="138" rx={mood.startsWith('petting') ? 18 : 14} ry={mood.startsWith('petting') ? 12 : 10} fill={mood === 'love' || mood.startsWith('petting') ? '#FDA4AF' : '#FFD89A'} opacity="0.95" />

      {/* ======================= BEAK / MOUTH ======================= */}
      {mood === 'celebrate' || mood === 'excited' || mood === 'happy' || mood === 'dance' || mood === 'love' || mood.startsWith('petting') ? (
        // Smiling Open Beak with Pink Tongue
        <g>
          <path fill="url(#gkoo_beak)" d="M128 116 L153 130 L128 148 L103 130 Z" />
          <path fill="#991B1B" d="M116 132 Q128 147 140 132 Z" />
          <path fill="#FB7185" d="M122 137 Q128 145 134 137 Z" />
        </g>
      ) : mood === 'sad' ? (
        // Down-turned Sad Beak
        <g>
          <path fill="url(#gkoo_beak)" d="M128 120 L150 134 L128 144 L106 134 Z" />
          <path d="M116 138 Q128 132 140 138" stroke="#B45309" strokeWidth="4" strokeLinecap="round" fill="none" />
        </g>
      ) : mood === 'shocked' ? (
        // Surprised 'O' Beak
        <g>
          <path fill="url(#gkoo_beak)" d="M128 116 L148 130 L128 146 L108 130 Z" />
          <ellipse cx="128" cy="133" rx="8" ry="7" fill="#7C2D12" />
        </g>
      ) : mood === 'eating' ? (
        // Chewing animation
        <motion.g
          animate={{ scaleY: [1, 0.7, 1] }}
          transition={{ repeat: Infinity, duration: 0.35 }}
          style={{ transformOrigin: '128px 132px' }}
        >
          <path fill="url(#gkoo_beak)" d="M128 118 L151 132 L128 146 L105 132 Z" />
          {/* Shiny Diamond Gem being eaten */}
          <polygon points="128,140 138,148 128,158 118,148" fill="#38BDF8" />
          <polygon points="128,140 133,148 128,158 123,148" fill="#BAE6FD" />
        </motion.g>
      ) : (
        // Standard Closed Beak
        <g>
          <path fill="url(#gkoo_beak)" d="M128 118 L151 132 L128 146 L105 132 Z" />
          <path fill="#A53B00" d="M118 133 Q128 144 138 133 Q128 138 118 133 Z" />
        </g>
      )}

      {/* ======================= FLOATING EMOTION PROPS ======================= */}
      {mood === 'celebrate' && (
        <g>
          <motion.text
            x="36"
            y="48"
            fontSize="24"
            animate={{ y: [0, -8, 0], rotate: [-10, 15, -10] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
          >
            ✨
          </motion.text>
          <motion.text
            x="196"
            y="44"
            fontSize="26"
            animate={{ y: [0, -10, 0], rotate: [10, -15, 10] }}
            transition={{ repeat: Infinity, duration: 1.4 }}
          >
            🎉
          </motion.text>
        </g>
      )}

      {mood === 'dance' && (
        <g>
          <motion.text
            x="30"
            y="60"
            fontSize="22"
            animate={{ y: [0, -12, 0], x: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
          >
            🎵
          </motion.text>
          <motion.text
            x="200"
            y="55"
            fontSize="24"
            animate={{ y: [0, -14, 0], x: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 0.9 }}
          >
            🎶
          </motion.text>
        </g>
      )}

      {mood === 'sleeping' && (
        <motion.g
          animate={{ y: [0, -14, -28], opacity: [0, 1, 0], scale: [0.8, 1.2, 1.4] }}
          transition={{ repeat: Infinity, duration: 2.2 }}
        >
          <text x="180" y="55" fontSize="26" fontWeight="bold" fill="#60A5FA">
            Zzz
          </text>
        </motion.g>
      )}

      {mood === 'thinking' && (
        <motion.g
          animate={{ y: [0, -6, 0], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
        >
          <text x="180" y="55" fontSize="28">
            💡
          </text>
        </motion.g>
      )}

      {mood === 'love' && (
        <motion.g
          animate={{ y: [0, -14, 0], scale: [1, 1.3, 1] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
        >
          <text x="188" y="50" fontSize="26">
            💕
          </text>
        </motion.g>
      )}

      {mood === 'excited' && (
        <motion.g
          animate={{ y: [0, -8, 0], scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
        >
          <text x="188" y="50" fontSize="24">
            💖
          </text>
        </motion.g>
      )}

      {mood === 'dizzy' && (
        // Circling orbiting stars
        <motion.g
          animate={{ rotate: [0, 360] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          style={{ transformOrigin: '128px 45px' }}
        >
          <text x="80" y="45" fontSize="18">💫</text>
          <text x="160" y="45" fontSize="18">⭐</text>
        </motion.g>
      )}
    </svg>
  );
};

export const GkooBirdAvatar: React.FC<{
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  mood?: MascotMood;
  className?: string;
}> = ({ size = 'sm', mood = 'happy', className = '' }) => {
  const sizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28',
  };

  return (
    <div className={`relative ${sizes[size]} shrink-0 select-none flex items-center justify-center ${className}`}>
      <GkooBirdSvg mood={mood} />
    </div>
  );
};

export const Mascot: React.FC<MascotProps> = ({
  message,
  size = 'md',
  mood = 'happy',
  interactive = true,
  className = '',
  onClick,
}) => {
  const [currentMood, setCurrentMood] = useState<MascotMood>(mood);

  // Sync mood prop
  React.useEffect(() => {
    setCurrentMood(mood);
  }, [mood]);

  const sizeClasses = {
    xs: 'w-12 h-12',
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-44 h-44',
    '2xl': 'w-52 h-52',
    '3xl': 'w-64 h-64',
  };

  const getAnimation = () => {
    switch (currentMood) {
      case 'celebrate':
        return {
          y: [0, -18, 0, -10, 0],
          rotate: [0, -8, 8, -4, 0],
          scale: [1, 1.06, 0.96, 1],
          transition: { repeat: Infinity, duration: 1.1, ease: 'easeInOut' as const },
        };
      case 'dance':
        return {
          y: [0, -12, 0, -8, 0],
          rotate: [-8, 8, -8],
          scale: [1, 1.04, 0.98, 1],
          transition: { repeat: Infinity, duration: 0.6, ease: 'easeInOut' as const },
        };
      case 'fire':
        return {
          y: [0, -4, 0, -4, 0],
          scale: [1, 1.08, 1.02, 1.08, 1],
          transition: { repeat: Infinity, duration: 0.7 },
        };
      case 'love':
        return {
          scale: [1, 1.1, 1],
          y: [0, -6, 0],
          transition: { repeat: Infinity, duration: 1.2 },
        };
      case 'thinking':
        return {
          rotate: [0, 7, 0, -4, 0],
          y: [0, -4, 0],
          transition: { repeat: Infinity, duration: 2.4, ease: 'easeInOut' as const },
        };
      case 'sad':
        return {
          y: [0, 4, 0],
          rotate: [-2, 2, -2],
          scale: [1, 0.97, 1],
          transition: { repeat: Infinity, duration: 2.0, ease: 'easeInOut' as const },
        };
      case 'shocked':
        return {
          x: [-3, 3, -3, 3, 0],
          scale: [1, 1.08, 1],
          transition: { repeat: Infinity, duration: 0.8 },
        };
      case 'sleeping':
        return {
          scaleY: [1, 1.04, 1],
          scaleX: [1, 0.98, 1],
          transition: { repeat: Infinity, duration: 2.5, ease: 'easeInOut' as const },
        };
      case 'eating':
        return {
          y: [0, 6, 0, 6, 0],
          transition: { repeat: Infinity, duration: 0.6 },
        };
      case 'ninja':
        return {
          x: [-4, 4, 0],
          y: [0, -6, 0],
          transition: { repeat: Infinity, duration: 1.0 },
        };
      case 'dizzy':
        return {
          rotate: [-6, 6, -6],
          y: [0, -3, 0],
          transition: { repeat: Infinity, duration: 1.4 },
        };
      case 'excited':
        return {
          y: [0, -14, 0, -7, 0],
          scale: [1, 1.06, 0.98, 1],
          transition: { repeat: Infinity, duration: 0.85 },
        };
      case 'waving':
        return {
          y: [0, -6, 0],
          rotate: [0, -3, 3, 0],
          transition: { repeat: Infinity, duration: 1.6 },
        };
      case 'happy':
      case 'idle':
      default:
        return {
          y: [0, -8, 0],
          transition: { repeat: Infinity, duration: 2.0, ease: 'easeInOut' as const },
        };
    }
  };

  const handleTapMascot = () => {
    if (!interactive) return;
    triggerHaptic('click');

    // Cycle through exciting random moods without layout shift
    const randomMoods: MascotMood[] = [
      'dance',
      'fire',
      'love',
      'celebrate',
      'excited',
      'waving',
      'ninja',
      'eating',
    ];
    const nextMood = randomMoods[Math.floor(Math.random() * randomMoods.length)];
    setCurrentMood(nextMood);

    playSound('success', true);

    if (onClick) onClick();

    setTimeout(() => {
      setCurrentMood(mood);
    }, 2800);
  };

  return (
    <div className={`flex items-center space-x-3 my-1 ${className}`}>
      {/* Animated G-koo Character SVG */}
      <motion.div
        animate={getAnimation()}
        whileTap={interactive ? { scale: 0.82, rotate: -8 } : {}}
        onClick={handleTapMascot}
        className={`relative ${sizeClasses[size]} shrink-0 select-none cursor-pointer`}
        title="Tap me to play with G-koo! 🦉"
      >
        <GkooBirdSvg mood={currentMood} />
      </motion.div>

      {/* Speech Bubble ONLY when explicitly passed as prop */}
      {message && (
        <AnimatePresence mode="wait">
          <motion.div
            key={message}
            initial={{ opacity: 0, scale: 0.88, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: -6 }}
            className="relative bg-white dark:bg-gray-800 border-2 border-rose-200 dark:border-rose-900/60 p-3 rounded-2xl rounded-tl-none shadow-md max-w-[250px]"
          >
            <p className="text-xs sm:text-sm font-black text-gray-800 dark:text-gray-100 leading-snug">
              {message}
            </p>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};
