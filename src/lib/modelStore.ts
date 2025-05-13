import { create } from 'zustand';
import { Vector3 } from 'three';

// Define store state interfaces
interface ModelState {
  highlightedMuscles: Record<string, string>; // muscleName -> color
  animationFrame: number;
  isAnimating: boolean;
  cameraPosition: { x: number; y: number; z: number };
  cameraTarget: { x: number; y: number; z: number };
  
  // Actions that can be triggered
  setHighlightedMuscles: (muscleColors: Record<string, string>) => void;
  toggleHighlightedMuscle: (muscleName: string, color?: string) => void;
  clearHighlightedMuscles: () => void;
  setAnimationFrame: (frame: number) => void;
  toggleAnimation: (isPlaying?: boolean) => void;
  setCameraPosition: (position: { x: number; y: number; z: number }) => void;
  setCameraTarget: (target: { x: number; y: number; z: number }) => void;
  resetCamera: () => void;
}

// Default camera settings
const DEFAULT_CAMERA_POSITION = { x: 0, y: 0, z: 7 };
const DEFAULT_CAMERA_TARGET = { x: 0, y: 0, z: 0 };

// Create the store
export const useModelStore = create<ModelState>((set) => ({
  highlightedMuscles: {},
  animationFrame: 0,
  isAnimating: false,
  cameraPosition: DEFAULT_CAMERA_POSITION,
  cameraTarget: DEFAULT_CAMERA_TARGET,
  
  // Actions
  setHighlightedMuscles: (muscleColors) => set({ highlightedMuscles: muscleColors }),
  toggleHighlightedMuscle: (muscleName, color = '#FFD600') => set((state) => {
    const newMap = { ...state.highlightedMuscles };
    if (newMap[muscleName]) {
      delete newMap[muscleName];
    } else {
      newMap[muscleName] = color;
    }
    return { highlightedMuscles: newMap };
  }),
  clearHighlightedMuscles: () => set({ highlightedMuscles: {} }),
  
  setAnimationFrame: (frame) => set({ animationFrame: frame }),
  
  toggleAnimation: (isPlaying) => set((state) => ({ 
    isAnimating: isPlaying !== undefined ? isPlaying : !state.isAnimating 
  })),
  
  setCameraPosition: (position) => set({ cameraPosition: position }),
  
  setCameraTarget: (target) => set({ cameraTarget: target }),
  
  resetCamera: () => set({
    cameraPosition: DEFAULT_CAMERA_POSITION,
    cameraTarget: DEFAULT_CAMERA_TARGET
  }),
})); 