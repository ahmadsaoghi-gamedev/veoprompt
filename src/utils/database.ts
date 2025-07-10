import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Character, VideoObject, VideoPrompt, APISettings, GeneratedVideo } from '../types';

interface VideoCreatorDB extends DBSchema {
  characters: {
    key: string;
    value: Character;
  };
  objects: {
    key: string;
    value: VideoObject;
  };
  prompts: {
    key: string;
    value: VideoPrompt;
    indexes: { 'by-type': string; 'by-date': Date };
  };
  settings: {
    key: string;
    value: APISettings;
  };
  videos: {
    key: string;
    value: GeneratedVideo;
    indexes: { 'by-prompt': string; 'by-date': Date };
  };
}

let db: IDBPDatabase<VideoCreatorDB>;

export async function initDB(): Promise<IDBPDatabase<VideoCreatorDB>> {
  if (db) return db;
  
  db = await openDB<VideoCreatorDB>('video-creator-db', 1, {
    upgrade(db) {
      // Characters store
      const charactersStore = db.createObjectStore('characters', { keyPath: 'id' });
      
      // Objects store
      const objectsStore = db.createObjectStore('objects', { keyPath: 'id' });
      
      // Prompts store
      const promptsStore = db.createObjectStore('prompts', { keyPath: 'id' });
      promptsStore.createIndex('by-type', 'type');
      promptsStore.createIndex('by-date', 'createdAt');
      
      // Settings store
      const settingsStore = db.createObjectStore('settings', { keyPath: 'id' });
      
      // Videos store
      const videosStore = db.createObjectStore('videos', { keyPath: 'id' });
      videosStore.createIndex('by-prompt', 'promptId');
      videosStore.createIndex('by-date', 'createdAt');
    },
  });
  
  return db;
}

// Character operations
export async function saveCharacter(character: Character): Promise<void> {
  const database = await initDB();
  await database.put('characters', character);
}

export async function getCharacters(): Promise<Character[]> {
  const database = await initDB();
  return database.getAll('characters');
}

export async function deleteCharacter(id: string): Promise<void> {
  const database = await initDB();
  await database.delete('characters', id);
}

// Object operations
export async function saveObject(object: VideoObject): Promise<void> {
  const database = await initDB();
  await database.put('objects', object);
}

export async function getObjects(): Promise<VideoObject[]> {
  const database = await initDB();
  return database.getAll('objects');
}

export async function deleteObject(id: string): Promise<void> {
  const database = await initDB();
  await database.delete('objects', id);
}

// Prompt operations
export async function savePrompt(prompt: VideoPrompt): Promise<void> {
  const database = await initDB();
  await database.put('prompts', prompt);
}

export async function getPrompts(type?: string): Promise<VideoPrompt[]> {
  const database = await initDB();
  if (type) {
    return database.getAllFromIndex('prompts', 'by-type', type);
  }
  return database.getAll('prompts');
}

export async function deletePrompt(id: string): Promise<void> {
  const database = await initDB();
  await database.delete('prompts', id);
}

// Settings operations
export async function saveSettings(settings: APISettings): Promise<void> {
  const database = await initDB();
  await database.put('settings', { ...settings, id: 'api-settings' });
}

export async function getSettings(): Promise<APISettings | null> {
  const database = await initDB();
  return database.get('settings', 'api-settings') || null;
}

// Video operations
export async function saveVideo(video: GeneratedVideo): Promise<void> {
  const database = await initDB();
  await database.put('videos', video);
}

export async function getVideos(promptId?: string): Promise<GeneratedVideo[]> {
  const database = await initDB();
  if (promptId) {
    return database.getAllFromIndex('videos', 'by-prompt', promptId);
  }
  return database.getAll('videos');
}