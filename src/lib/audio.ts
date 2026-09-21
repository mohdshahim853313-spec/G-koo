import { TextToSpeech } from '@capacitor-community/text-to-speech';

export type SuccessSoundPreset = 'ding' | 'bell' | 'arcade' | 'harp' | 'custom';
export type ErrorSoundPreset = 'thump' | 'wood' | 'chime_down' | 'buzzer' | 'custom';

export const playSyntheticPreset = (audioCtx: AudioContext, type: 'success' | 'error', presetId: string) => {
  const now = audioCtx.currentTime;

  if (type === 'success') {
    if (presetId === 'bell') {
      // Crystal Bell
      [880, 1318.51, 1760].forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);
        gain.gain.setValueAtTime(0.25, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.6);
        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.6);
      });
    } else if (presetId === 'arcade') {
      // 8-bit Arcade Powerup
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'square';
      osc.frequency.setValueAtTime(330, now);
      osc.frequency.setValueAtTime(440, now + 0.05);
      osc.frequency.setValueAtTime(587, now + 0.10);
      osc.frequency.setValueAtTime(880, now + 0.15);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (presetId === 'harp') {
      // Gentle Harp
      [440, 554.37, 659.25, 880, 1108.73].forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.03);
        gain.gain.setValueAtTime(0.2, now + i * 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.03 + 0.5);
        osc.start(now + i * 0.03);
        osc.stop(now + i * 0.03 + 0.5);
      });
    } else {
      // Default 'ding': G-koo uplifting high ding
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.08); // A5
      osc.frequency.setValueAtTime(1174.66, now + 0.16); // D6
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.start(now);
      osc.stop(now + 0.45);
    }
  } else {
    // ERROR SOUNDS
    if (presetId === 'wood') {
      // Organic Wood Block Knock
      [220, 180].forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0.3, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.12);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.12);
      });
    } else if (presetId === 'chime_down') {
      // Gentle Descending Chord
      [440, 392, 349.23].forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.07);
        gain.gain.setValueAtTime(0.2, now + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.3);
        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 0.3);
      });
    } else if (presetId === 'buzzer') {
      // Low Soft Buzzer
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.2);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else {
      // Default 'thump': Satisfying, Warm Game Double-Thump (non-jarring)
      [150, 110].forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.09);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.7, now + idx * 0.09 + 0.15);
        gain.gain.setValueAtTime(0.35, now + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.18);
        osc.start(now + idx * 0.09);
        osc.stop(now + idx * 0.09 + 0.18);
      });
    }
  }
};

// Synthetic Web Audio System & Haptic Feedback for G-koo
export const playSound = (type: 'success' | 'error' | 'combo' | 'complete', isEnabled = true) => {
  if (!isEnabled) return;
  
  try {
    // Check for custom audio override from device
    if (type === 'success') {
      const preset = (localStorage.getItem('gkoo_sound_success_preset') || 'harp') as SuccessSoundPreset;
      const customAudio = localStorage.getItem('gkoo_sound_success_custom');
      if (preset === 'custom' && customAudio) {
        const audio = new Audio(customAudio);
        audio.play().catch(() => {});
        return;
      }
    } else if (type === 'error') {
      const preset = (localStorage.getItem('gkoo_sound_error_preset') || 'chime_down') as ErrorSoundPreset;
      const customAudio = localStorage.getItem('gkoo_sound_error_custom');
      if (preset === 'custom' && customAudio) {
        const audio = new Audio(customAudio);
        audio.play().catch(() => {});
        return;
      }
    }

    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const audioCtx = new AudioContextClass();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    if (type === 'success') {
      const preset = (localStorage.getItem('gkoo_sound_success_preset') || 'harp') as SuccessSoundPreset;
      playSyntheticPreset(audioCtx, 'success', preset);
    } else if (type === 'error') {
      const preset = (localStorage.getItem('gkoo_sound_error_preset') || 'chime_down') as ErrorSoundPreset;
      playSyntheticPreset(audioCtx, 'error', preset);
    } else if (type === 'combo') {
      // Chime chord on combo
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.05);
        gain.gain.setValueAtTime(0.2, now + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.4);
        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.4);
      });
    } else if (type === 'complete') {
      // Fanfare celebration sound
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.3, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.5);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.5);
      });
    }
  } catch (e) {
    // Audio is optional, suppress console spam
  }
};

export const previewCustomSound = (type: 'success' | 'error', presetId: string, customAudioData?: string) => {
  if (presetId === 'custom' && customAudioData) {
    const audio = new Audio(customAudioData);
    audio.play().catch(() => {});
    return;
  }

  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    playSyntheticPreset(audioCtx, type, presetId);
  } catch (e) {
    // Ignore
  }
};

export const triggerHaptic = (type: 'success' | 'error' | 'click', isEnabled = true) => {
  if (!isEnabled || typeof window === 'undefined' || !navigator.vibrate) return;
  try {
    if (type === 'success') {
      navigator.vibrate([40, 60, 40]);
    } else if (type === 'error') {
      navigator.vibrate([100, 50, 100]);
    } else {
      navigator.vibrate(25);
    }
  } catch (e) {
    // Ignore unsupported devices
  }
};

// -------------------------------------------------------------
// TEXT-TO-SPEECH (TTS) AUDIO SYSTEM FOR QUESTIONS & OPTIONS
// -------------------------------------------------------------
let currentSpeechSessionId = 0;
let speechPendingTimer: ReturnType<typeof setTimeout> | null = null;

export const stopSpeech = () => {
  currentSpeechSessionId++;

  if (speechPendingTimer) {
    clearTimeout(speechPendingTimer);
    speechPendingTimer = null;
  }

  // 1. Immediately cancel Web Speech API synchronously
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      // Ignore
    }
  }

  // 2. Stop Native Android/iOS Capacitor TTS
  try {
    TextToSpeech.stop().catch(() => {});
  } catch (e) {
    // Ignore
  }
};

export const speakText = (
  text: string,
  lang: 'en' | 'hi' = 'en',
  onEnd?: () => void
) => {
  // Always kill any previous audio immediately before starting new speech
  stopSpeech();

  const sessionId = ++currentSpeechSessionId;
  const cleanText = text.replace(/[\*\#\_]/g, '').trim();
  if (!cleanText) {
    if (onEnd) onEnd();
    return;
  }

  // 1. Try Native Android/iOS Capacitor TTS
  TextToSpeech.speak({
    text: cleanText,
    lang: lang === 'hi' ? 'hi-IN' : 'en-US',
    rate: lang === 'hi' ? 0.95 : 1.0,
    pitch: 1.0,
    volume: 1.0,
    category: 'playback',
  })
    .then(() => {
      if (sessionId === currentSpeechSessionId && onEnd) {
        onEnd();
      }
    })
    .catch(() => {
      // Fallback to Web Speech API (Chrome / Edge / Safari / Desktop)
      if (sessionId !== currentSpeechSessionId) return;

      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }

          const utterance = new SpeechSynthesisUtterance(cleanText);
          utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
          utterance.rate = lang === 'hi' ? 0.9 : 0.95;
          utterance.pitch = 1.0;

          const voices = window.speechSynthesis.getVoices();
          if (voices && voices.length > 0) {
            if (lang === 'hi') {
              const hiVoice = voices.find(
                v => v.lang.toLowerCase().startsWith('hi') || v.name.toLowerCase().includes('hindi')
              );
              if (hiVoice) utterance.voice = hiVoice;
            } else {
              const enVoice = voices.find(
                v =>
                  v.lang.toLowerCase().startsWith('en') &&
                  (v.name.includes('Natural') ||
                    v.name.includes('Google') ||
                    v.name.includes('Samantha') ||
                    v.name.includes('US'))
              );
              if (enVoice) utterance.voice = enVoice;
            }
          }

          utterance.onend = () => {
            if (sessionId === currentSpeechSessionId && onEnd) {
              onEnd();
            }
          };

          utterance.onerror = () => {
            if (sessionId === currentSpeechSessionId && onEnd) {
              onEnd();
            }
          };

          speechPendingTimer = setTimeout(() => {
            if (sessionId === currentSpeechSessionId) {
              window.speechSynthesis.speak(utterance);
            }
          }, 20);
        } catch (err) {
          console.warn('TTS speech failed:', err);
          if (onEnd) onEnd();
        }
      } else {
        if (onEnd) onEnd();
      }
    });
};

