# JSON Response Format Documentation

## Overview

Semua output prompt dalam aplikasi AI Video Generator sekarang mengembalikan
format JSON yang konsisten untuk memudahkan integrasi dan pemrosesan data.

## Standard Response Types

### 1. StandardVideoPromptResponse

Digunakan untuk single video prompt generation (ManualMode, MarketingMode).

```json
{
  "videoPrompt": "Complete detailed video production prompt",
  "sceneType": "scene type description",
  "duration": 8,
  "characters": ["character 1", "character 2"],
  "objects": ["object 1", "object 2"],
  "location": "scene location",
  "timeOfDay": "time of day",
  "weather": "weather condition",
  "cameraWork": "camera work description",
  "lighting": "lighting description",
  "audioElements": ["audio element 1", "audio element 2"],
  "visualStyle": "visual style description",
  "metadata": {
    "additionalData": "any additional information"
  }
}
```

### 2. StandardSceneResponse

Digunakan untuk multi-scene generation (SatsetMode).

```json
{
  "title": "Video Title",
  "mainDescription": "Overall video description",
  "scenes": [
    {
      "sceneNumber": 1,
      "prompt": "Detailed English prompt for scene 1",
      "duration": 8,
      "characters": ["character names"],
      "objects": ["object names"]
    }
  ]
}
```

### 3. StandardMarketingResponse

Digunakan untuk marketing video generation (MarketingMode).

```json
{
  "videoPrompt": "Complete detailed video production prompt",
  "marketingMessage": "Clear marketing message",
  "targetAudience": "Target audience description",
  "callToAction": "Call to action statement",
  "visualElements": ["visual element 1", "visual element 2"],
  "audioElements": ["audio element 1", "audio element 2"],
  "duration": 8,
  "style": "marketing style description",
  "tone": "visual tone description"
}
```

### 4. AnomalyScenePrompt

Digunakan untuk anomaly mode generation (AnomalyMode).

```json
{
  "visual_prompt": "Visual description",
  "audio_prompt": "Audio description",
  "dialog_en": "English dialogue",
  "dialog_id_gaul": "Indonesian dialogue",
  "narasi": "Narration text",
  "veo3_optimized_prompt": "Optimized prompt for Veo3",
  "sceneSetup": {
    "location": "Scene location",
    "atmosphere": "Scene atmosphere",
    "timeOfDay": "Time of day",
    "mood": "Scene mood",
    "weather": "Weather condition"
  },
  "characters": [
    {
      "name": "Character name",
      "age": "Character age",
      "clothing": "Clothing description",
      "emotion": "Character emotion",
      "position": "Character position"
    }
  ],
  "beatCount": 3,
  "duration": 8,
  "language": "Language used"
}
```

### 5. ImageAnalysisResponse

Digunakan untuk image analysis generation (ImageAnalysis).

```json
{
  "scenePrompt": "Complete scene prompt",
  "characterDNA": "Character descriptions",
  "storyContext": "Story context",
  "dialogueHistory": ["dialogue line 1", "dialogue line 2"],
  "sceneEndingSummary": "Scene ending summary"
}
```

## API Functions

### callGeminiAPIForJSON()

Function khusus untuk mendapatkan response dalam format JSON.

```typescript
const result = await callGeminiAPIForJSON(prompt, imageBase64, apiSettings);
```

### ensureJSONResponse()

Helper function untuk memvalidasi response JSON.

```typescript
ensureJSONResponse(result, ["videoPrompt", "duration", "characters"]);
```

## Error Handling

Jika response tidak dalam format JSON yang valid, sistem akan:

1. Mencoba mengekstrak JSON dari response
2. Menampilkan error yang informatif
3. Meminta user untuk mencoba lagi

## Benefits

1. **Konsistensi**: Semua response dalam format yang sama
2. **Type Safety**: TypeScript interfaces untuk validasi
3. **Error Handling**: Penanganan error yang lebih baik
4. **Extensibility**: Mudah untuk menambah field baru
5. **Integration**: Mudah untuk integrasi dengan sistem lain

## Migration Notes

- Semua existing components sudah diupdate untuk menggunakan JSON format
- Backward compatibility tetap terjaga
- Error handling ditingkatkan untuk JSON parsing
- Type safety ditingkatkan dengan TypeScript interfaces
