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

export interface AnomalyScenePrompt {
  visual_prompt: string;
  audio_prompt: string;
  dialog_en: string;
  dialog_id_gaul: string;
  narasi: string;
  veo3_optimized_prompt: string; // NEW: Optimized prompt for Veo3
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
