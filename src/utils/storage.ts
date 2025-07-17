// Fallback to localStorage if IndexedDB fails
export function saveToLocalStorage(key: string, data: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

export function getFromLocalStorage<T>(key: string): T | null {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to get from localStorage:', error);
    return null;
  }
}

export function removeFromLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to remove from localStorage:', error);
  }
}

export function exportData(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importData<T = unknown>(file: File): Promise<T> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as T;
        resolve(data);
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError);
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

// Function to fetch brain prompt from public/brain directory
export async function fetchBrainPrompt(styleName: string): Promise<string> {
  try {
    // Map style names to file names
    const styleFileMap: Record<string, string> = {
      'larva_tuba': 'style_larva_tuba_animation.txt',
      'pixar': 'style_pixar.txt',
      'coraline': 'style_coraline_animation.txt',
      'dragon_quest': 'style_dragon_quest_animation.txt',
      'illumination': 'style_illumination.txt',
      'japanese_3d_anime': 'style_japanese_3D_Anime.txt',
      'lionking_realistic': 'style_lionking_realistic.txt',
      'love_death_robots': 'style_Love_Death_Robots_animation.txt',
      'lovecraftian_horror': 'style_lovecraftian_horror.txt',
      'stand_by_me_doraemon': 'style_stand_by_me_doraemon_animation.txt',
      'lord_of_the_rings': 'style_the_lord_of_the_ring_3danimation.txt',
      'vfx_3d': 'style_vfx_3d_animation.txt',
      'videoclip_song': 'style_videoclip_song.txt',
      'effect_shader': 'style_effect_shader_animation.txt',
      'acak_prompt': 'acak_prompt_style.txt',
      'dialog_daerah': 'dialog_daerah.txt',
      'dialog_inggris': 'dialog_inggris.txt',
      'dialogue_formal': 'dialogue_formal.txt',
      'dialogue_tongkrongan': 'dialogue_tongkrongan.txt'
    };

    const fileName = styleFileMap[styleName] || `${styleName}.txt`;
    const response = await fetch(`/brain/${fileName}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch brain prompt: ${response.statusText}`);
    }
    
    const content = await response.text();
    return content.trim();
  } catch (error) {
    console.error('Error fetching brain prompt:', error);
    // Return a default prompt if fetching fails
    return 'A high-quality 3D animation with detailed character modeling, cinematic lighting, and smooth animation.';
  }
}

// Function to get available brain prompt styles
export function getAvailableBrainStyles(): Array<{ value: string; label: string }> {
  return [
    { value: 'larva_tuba', label: 'Larva TUBA Animation' },
    { value: 'pixar', label: 'Pixar Style' },
    { value: 'coraline', label: 'Coraline Animation' },
    { value: 'dragon_quest', label: 'Dragon Quest Animation' },
    { value: 'illumination', label: 'Illumination Style' },
    { value: 'japanese_3d_anime', label: 'Japanese 3D Anime' },
    { value: 'lionking_realistic', label: 'Lion King Realistic' },
    { value: 'love_death_robots', label: 'Love Death + Robots' },
    { value: 'lovecraftian_horror', label: 'Lovecraftian Horror' },
    { value: 'stand_by_me_doraemon', label: 'Stand By Me Doraemon' },
    { value: 'lord_of_the_rings', label: 'Lord of the Rings 3D' },
    { value: 'vfx_3d', label: 'VFX 3D Animation' },
    { value: 'videoclip_song', label: 'Video Clip Song Style' },
    { value: 'effect_shader', label: 'Effect Shader Animation' }
  ];
}
