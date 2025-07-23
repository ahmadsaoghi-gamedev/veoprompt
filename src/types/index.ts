export interface Character {
  id: string;
  name: string;
  age: number;
  hairColor: string;
  faceShape: string;
  accessories: string;
  bodyShape: string;
  height: string;
  additionalFeatures: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VideoObject {
  id: string;
  name: string;
  category: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Scene {
  id: string;
  sceneNumber: number;
  visualDescription: string;
  location: string;
  time: string;
  season: string;
  weather: string;
  cinematography: {
    cameraTechniques: string[];
    lighting: string;
    colorPalette: string;
    additionalVisuals: string[];
  };
  audio: {
    dialogue: {
      character: string;
      description: string;
      text: string;
    }[];
    ambientSounds: {
      name: string;
      volume: string;
    }[];
    audioMix: string;
  };
  duration: number;
  characters: string[];
  objects: string[];
}

export interface CaptionSettings {
  enabled: boolean;
  accuracy: 'high' | 'medium' | 'low';
  language: 'match_dialog' | 'indonesian' | 'sundanese' | 'betawi' | 'javanese' | 'minang';
  font: string;
  position: 'bottom' | 'top' | 'middle';
}

export interface LanguageSettings {
  dialog: 'indonesian' | 'sundanese' | 'betawi' | 'javanese' | 'minang';
  monolog: 'indonesian' | 'sundanese' | 'betawi' | 'javanese' | 'minang';
}

export interface VideoPrompt {
  id: string;
  title: string;
  type: 'satset' | 'manual' | 'marketing';
  mainDescription: string;
  scenes: Scene[];
  characters: Character[];
  objects: VideoObject[];
  settings: {
    resolution: '4K' | '1080p' | '720p';
    frameRate: number;
    aspectRatio: string;
    duration: number;
    captions: CaptionSettings;
    languages: LanguageSettings;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface APISettings {
  usePrivateKey: boolean;
  privateKey: string;
  isActive: boolean;
  lastValidated: Date | null;
}

export interface GeneratedVideo {
  id: string;
  promptId: string;
  sceneNumber: number;
  status: 'generating' | 'completed' | 'error';
  videoUrl?: string;
  error?: string;
  createdAt: Date;
}

export interface CharacterPosition {
  character: string;
  position: 'left' | 'center' | 'right';
  speakingColor?: string; // Color when character is speaking (e.g., 'orange', 'blue', 'green')
}

export interface CharacterProfile {
  name: string;
  physicalDescription: string;
  personality: string;
  voiceCharacteristics: string;
  emotionalArc: string;
  clothingDetails: string;
  distinctiveFeatures: string;
  age: number;
  height: string;
  bodyType: string;
}

export interface SceneContinuity {
  previousSceneEndState: string;
  characterPositions: CharacterPosition[];
  emotionalState: Record<string, string>;
  timeProgression: string;
  locationTransition: string;
}

export interface CinematographyDetails {
  shotType: string;
  cameraMovement: string;
  lighting: string;
  colorGrading: string;
  depth: string;
  focusPoints: string[];
  transitionIn: string;
  transitionOut: string;
}

export interface DialogueBeatEnhanced {
  beatNumber: number;
  timing: string;
  character: string;
  action: string;
  dialogue: string;
  camera: string;
  audio: string;
  emotionalTone: string;
  facialExpression: string;
  bodyLanguage: string;
}

export interface AnomalyScenePrompt {
  visual_prompt: string;
  audio_prompt: string;
  dialog_en: string;
  dialog_id_gaul: string;
  narasi: string;
  veo3_optimized_prompt: string;
  characterPositions?: CharacterPosition[];
  // Enhanced fields for professional film structure
  sceneNumber?: number;
  sceneContinuity?: SceneContinuity;
  characterProfiles?: CharacterProfile[];
  cinematography?: CinematographyDetails;
  dialogueBeats?: DialogueBeatEnhanced[];
  sceneSetup?: {
    location: string;
    atmosphere: string;
    timeOfDay: string;
    mood: string;
    weather?: string;
  };
  characters?: {
    name: string;
    age: string;
    clothing: string;
    emotion: string;
    position: string;
  }[];
  beatCount?: number;
  duration?: number;
  language?: string;
}

export interface VideoPromptWithOptimization {
  scenePrompt: string;
  narasi: string;
  dialog_en: string;
  dialog_id: string;
  veo3_optimized_prompt: string; // NEW: Optimized prompt for Veo3
}

export interface DialogueBeat {
  beatNumber: number;
  timing: string;
  character: string;
  action: string;
  dialogue: string;
  camera: string;
  audio: string;
}

export interface FixedDialogue {
  scene: string;
  characters: {
    name: string;
    description: string;
    position: string;
  }[];
  dialogueSequence: DialogueBeat[];
  originalDialogue: string;
}

export interface DialogueFixerSettings {
  sceneDuration: number;
  numberOfCharacters: number;
  includeNarration: boolean;
  language: 'indonesian' | 'english';
  tone: 'dramatic' | 'comedic' | 'neutral' | 'emotional';
}

// Multi-Frame Support Types
export interface Frame {
  id: string;
  imageUrl: string;
  location: string;
  atmosphere: string;
  time: string;
  mood: string;
  visualElements: string[];
  order: number;
}

export interface FrameTransition {
  fromFrameId: string;
  toFrameId: string;
  movement: string;
  duration: number;
  effect: string;
}

export interface CharacterAppearance {
  frameNumber: number;
  frameId: string;
  position: string;
  emotion: string;
  action: string;
}

export interface TrackedCharacter {
  name: string;
  frameAppearances: CharacterAppearance[];
  description: string;
}

export interface MultiFrameAnalysis {
  frames: Frame[];
  transitions: FrameTransition[];
  characters: TrackedCharacter[];
  totalDuration: number;
  language: string;
}

export interface MultiFramePromptResult {
  sequencePrompt: string;
  characterProgression: string;
  dialogueBeats: string;
  veo3OptimizedPrompt: string;
  frameAnalysis: MultiFrameAnalysis;
}
