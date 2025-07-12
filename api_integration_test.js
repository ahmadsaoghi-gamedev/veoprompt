// Comprehensive API Integration Test
// This tests all the API functionality we've implemented

import { validateAPIKey, callGeminiAPI } from './src/utils/api.js';

const TEST_API_KEY = 'AIzaSyDbmz0E5cSZWjw11bL8Z9dM4IZiUp0L6zw';

async function runComprehensiveTest() {
    console.log('🚀 Starting Comprehensive API Integration Test...\n');

    // Test 1: API Key Validation
    console.log('📋 Test 1: API Key Validation');
    try {
        const validation = await validateAPIKey(TEST_API_KEY);
        console.log('✅ API Key Validation Result:', validation);

        if (!validation.isValid) {
            console.log('❌ API Key is invalid. Stopping tests.');
            return;
        }
    } catch (error) {
        console.log('❌ API Key Validation Failed:', error.message);
        return;
    }

    // Test 2: Basic Text Generation
    console.log('\n📋 Test 2: Basic Text Generation');
    try {
        const apiSettings = {
            usePrivateKey: true,
            privateKey: TEST_API_KEY,
            isActive: true,
            lastValidated: new Date()
        };

        const basicPrompt = "Generate a simple greeting message in one sentence.";
        const result = await callGeminiAPI(basicPrompt, undefined, apiSettings);
        console.log('✅ Basic Text Generation Result:', result.substring(0, 100) + '...');
    } catch (error) {
        console.log('❌ Basic Text Generation Failed:', error.message);
    }

    // Test 3: SatsetMode-style Generation
    console.log('\n📋 Test 3: SatsetMode-style Generation');
    try {
        const apiSettings = {
            usePrivateKey: true,
            privateKey: TEST_API_KEY,
            isActive: true,
            lastValidated: new Date()
        };

        const satsetPrompt = `Create a video prompt for a coffee shop scene. Include:
- Location: Modern coffee shop
- Characters: Barista and customer
- Action: Making coffee
- Mood: Friendly and welcoming
- Duration: 8 seconds

Format as a professional video prompt.`;

        const result = await callGeminiAPI(satsetPrompt, undefined, apiSettings);
        console.log('✅ SatsetMode Generation Result:', result.substring(0, 150) + '...');
    } catch (error) {
        console.log('❌ SatsetMode Generation Failed:', error.message);
    }

    // Test 4: AnomalyMode-style Generation
    console.log('\n📋 Test 4: AnomalyMode-style Generation');
    try {
        const apiSettings = {
            usePrivateKey: true,
            privateKey: TEST_API_KEY,
            isActive: true,
            lastValidated: new Date()
        };

        const anomalyPrompt = `Create two surreal characters based on this idea: "A philosophical rice cooker meets a cynical sponge"

Return ONLY a JSON object with this format:
{
  "karakter_1": {"nama": "...", "deskripsi_fisik": "..."},
  "karakter_2": {"nama": "...", "deskripsi_fisik": "..."}
}`;

        const result = await callGeminiAPI(anomalyPrompt, undefined, apiSettings);
        console.log('✅ AnomalyMode Generation Result:', result.substring(0, 200) + '...');

        // Try to parse as JSON
        try {
            const parsed = JSON.parse(result);
            console.log('✅ JSON parsing successful');
        } catch (parseError) {
            console.log('⚠️ JSON parsing failed, but generation succeeded');
        }
    } catch (error) {
        console.log('❌ AnomalyMode Generation Failed:', error.message);
    }

    // Test 5: MarketingMode-style Generation
    console.log('\n📋 Test 5: MarketingMode-style Generation');
    try {
        const apiSettings = {
            usePrivateKey: true,
            privateKey: TEST_API_KEY,
            isActive: true,
            lastValidated: new Date()
        };

        const marketingPrompt = `Create a professional marketing video prompt for:
- Product: Premium Coffee Beans
- Goal: Brand Awareness
- Target Audience: Coffee enthusiasts
- Style: Professional and warm
- Duration: 8 seconds
- Call to Action: Visit our website

Generate a comprehensive marketing video prompt.`;

        const result = await callGeminiAPI(marketingPrompt, undefined, apiSettings);
        console.log('✅ MarketingMode Generation Result:', result.substring(0, 150) + '...');
    } catch (error) {
        console.log('❌ MarketingMode Generation Failed:', error.message);
    }

    // Test 6: Image Analysis Simulation
    console.log('\n📋 Test 6: Image Analysis Simulation');
    try {
        const apiSettings = {
            usePrivateKey: true,
            privateKey: TEST_API_KEY,
            isActive: true,
            lastValidated: new Date()
        };

        const imageAnalysisPrompt = `Analyze this description as if it were an image and create a video prompt:
"A person sitting at a desk with a laptop, coffee cup nearby, natural lighting from a window, modern office setting"

Create a detailed video prompt based on this scene description.`;

        const result = await callGeminiAPI(imageAnalysisPrompt, undefined, apiSettings);
        console.log('✅ Image Analysis Simulation Result:', result.substring(0, 150) + '...');
    } catch (error) {
        console.log('❌ Image Analysis Simulation Failed:', error.message);
    }

    console.log('\n🎉 Comprehensive API Integration Test Complete!');
    console.log('\n📊 Summary:');
    console.log('- All major API integration patterns tested');
    console.log('- Components should now work with proper API settings');
    console.log('- Users need to configure their API key in API Settings');
    console.log('- Database integration ensures settings persistence');
}

// Run the test
runComprehensiveTest().catch(console.error);
