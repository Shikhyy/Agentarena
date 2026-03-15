/**
 * AgentArena — Audio Store (Zustand 5)
 * Manages background music, SFX, voice narration via Howler.js.
 */

import { create } from "zustand";

export type AudioCategory = "music" | "sfx" | "voice";

interface AudioState {
  // Volume levels (0-1)
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  voiceVolume: number;

  // Mute states
  muted: boolean;
  musicMuted: boolean;
  sfxMuted: boolean;
  voiceMuted: boolean;

  // Currently playing
  currentTrack: string | null;
  isPlaying: boolean;

  // Actions
  setMasterVolume: (v: number) => void;
  setVolume: (category: AudioCategory, v: number) => void;
  toggleMute: () => void;
  toggleCategoryMute: (category: AudioCategory) => void;
  setCurrentTrack: (track: string | null) => void;
  setIsPlaying: (v: boolean) => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  masterVolume: 0.7,
  musicVolume: 0.5,
  sfxVolume: 0.8,
  voiceVolume: 1.0,

  muted: false,
  musicMuted: false,
  sfxMuted: false,
  voiceMuted: false,

  currentTrack: null,
  isPlaying: false,

  setMasterVolume: (v) => set({ masterVolume: Math.max(0, Math.min(1, v)) }),

  setVolume: (category, v) => {
    const clamped = Math.max(0, Math.min(1, v));
    switch (category) {
      case "music":
        set({ musicVolume: clamped });
        break;
      case "sfx":
        set({ sfxVolume: clamped });
        break;
      case "voice":
        set({ voiceVolume: clamped });
        break;
    }
  },

  toggleMute: () => set((s) => ({ muted: !s.muted })),

  toggleCategoryMute: (category) => {
    switch (category) {
      case "music":
        set((s) => ({ musicMuted: !s.musicMuted }));
        break;
      case "sfx":
        set((s) => ({ sfxMuted: !s.sfxMuted }));
        break;
      case "voice":
        set((s) => ({ voiceMuted: !s.voiceMuted }));
        break;
    }
  },

  setCurrentTrack: (track) => set({ currentTrack: track }),
  setIsPlaying: (v) => set({ isPlaying: v }),
}));
