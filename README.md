# AI Video Generator - Shabira Prompt Lab

Platform AI untuk menghasilkan prompt video sinematik dari ide, gambar, dan
teks. Mendukung gaya surealis 'Anomaly Brainroot' dan alur kerja
visual-ke-video.

## 🚀 Features

### Multiple Generation Modes

- **SatsetMode**: Auto-generate 7 sequential scenes from main idea
- **AnomalyMode**: Surrealist story generation with custom characters
- **MarketingMode**: Professional marketing video creation
- **ManualMode**: Detailed control over every aspect
- **ImageAnalysis**: Extract character DNA and story context from images

### JSON Response Format

Semua output prompt sekarang mengembalikan format JSON yang konsisten untuk:

- ✅ **Konsistensi**: Semua response dalam format yang sama
- ✅ **Type Safety**: TypeScript interfaces untuk validasi
- ✅ **Error Handling**: Penanganan error yang lebih baik
- ✅ **Extensibility**: Mudah untuk menambah field baru
- ✅ **Integration**: Mudah untuk integrasi dengan sistem lain

## 📋 JSON Response Types

### StandardVideoPromptResponse

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
  "visualStyle": "visual style description"
}
```

### StandardSceneResponse

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

### StandardMarketingResponse

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

## 🛠️ Installation

```bash
npm install
npm run dev
```

## 🔧 API Configuration

1. Buka **API Settings** di aplikasi
2. Masukkan Google Generative Language API key
3. Klik **Validate** untuk memverifikasi
4. Semua mode akan menggunakan API key yang sama

## 📚 Usage

### SatsetMode

```typescript
const result = await callGeminiAPIForJSON(prompt, undefined, apiSettings);
ensureJSONResponse(result, ["title", "mainDescription", "scenes"]);
```

### MarketingMode

```typescript
const result = await callGeminiAPIForJSON(prompt, undefined, apiSettings);
ensureJSONResponse(result, [
  "videoPrompt",
  "marketingMessage",
  "targetAudience",
]);
```

### ManualMode

```typescript
const result = await callGeminiAPIForJSON(prompt, undefined, apiSettings);
ensureJSONResponse(result, [
  "videoPrompt",
  "duration",
  "characters",
  "objects",
]);
```

## 🎯 Key Benefits

1. **Structured Output**: Semua response dalam format JSON yang terstruktur
2. **Type Safety**: TypeScript interfaces untuk validasi tipe data
3. **Error Handling**: Penanganan error yang robust untuk JSON parsing
4. **Consistency**: Format response yang konsisten di semua mode
5. **Extensibility**: Mudah untuk menambah field baru ke response

## 📖 Documentation

Lihat [JSON_RESPONSE_FORMAT.md](./JSON_RESPONSE_FORMAT.md) untuk dokumentasi
lengkap tentang format JSON response.

## 🧪 Testing

```bash
node test_json_response.js
```

## 🔄 Migration Notes

- Semua existing components sudah diupdate untuk menggunakan JSON format
- Backward compatibility tetap terjaga
- Error handling ditingkatkan untuk JSON parsing
- Type safety ditingkatkan dengan TypeScript interfaces
- Model upgraded to Gemini 2.5 Flash to avoid deprecation issues.

## 📄 License

MIT License - lihat file LICENSE untuk detail lengkap.
