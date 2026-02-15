// Simple API test in JavaScript
async function callGeminiAPI(prompt, imageBase64, apiSettings) {
    const apiKey = apiSettings?.privateKey;

    if (!apiKey || !apiKey.trim()) {
        throw new Error('API key is required. Please configure your Google Generative Language API key in the API Settings.');
    }

    const parts = [{ text: prompt }];
    if (imageBase64) {
        parts.push({
            inlineData: {
                mimeType: "image/png",
                data: imageBase64.split(',')[1]
            }
        });
    }

    const payload = {
        contents: [{
            role: "user",
            parts: parts
        }],
        generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
        }
    };

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }
    );

    if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error?.message || 'API request failed';

        if (response.status === 400 && errorMessage.includes('API_KEY_INVALID')) {
            throw new Error('Invalid API key. Please check your Google Generative Language API key in the API Settings and ensure it has the correct permissions.');
        }

        if (response.status === 403) {
            if (errorMessage.includes('quota')) {
                throw new Error('API quota exceeded. Please check your Google Cloud Console for usage limits or try again later.');
            }
            if (errorMessage.includes('API key')) {
                throw new Error('API key access denied. Please ensure the Generative Language API is enabled in your Google Cloud Console.');
            }
        }

        if (response.status === 429) {
            throw new Error('Rate limit exceeded. Please wait a moment before making another request.');
        }

        throw new Error(`API Error (${response.status}): ${errorMessage}`);
    }

    const result = await response.json();
    if (result.candidates?.[0]?.content?.parts?.[0]) {
        let text = result.candidates[0].content.parts[0].text;
        // Clean up markdown formatting for clean output
        text = text.replace(/\*\*(.*?)\*\*/g, '$1'); // Remove bold markdown
        text = text.replace(/###\s*(.*?)$/gm, '$1'); // Remove heading markdown
        text = text.replace(/^\s*[-*]\s*/gm, ''); // Remove bullet points
        text = text.replace(/^```json\s*|```\s*$/g, '').trim(); // Remove code blocks
        text = text.replace(/^```\s*|```\s*$/g, '').trim();
        return text;
    } else {
        throw new Error('Unexpected API response format');
    }
}

async function validateAPIKey(apiKey) {
    try {
        if (!apiKey || !apiKey.trim()) {
            return { isValid: false, error: 'API key cannot be empty' };
        }

        // Check if API key format is correct (Google API keys typically start with 'AIza')
        if (!apiKey.startsWith('AIza')) {
            return { isValid: false, error: 'Invalid API key format. Google API keys should start with "AIza"' };
        }

        const testPrompt = "Say 'API key is valid' in one sentence.";
        await callGeminiAPI(testPrompt, undefined, {
            usePrivateKey: true,
            privateKey: apiKey,
            isActive: true,
            lastValidated: null
        });
        return { isValid: true };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown validation error';
        return { isValid: false, error: errorMessage };
    }
}

// Test functions
async function runAPITests() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.log('❌ Missing GEMINI_API_KEY environment variable. Skipping API tests.');
        return;
    }

    console.log('🚀 Starting API Tests...\n');

    // Test 1: API Key Validation
    console.log('📋 Test 1: API Key Validation');
    try {
        const validationResult = await validateAPIKey(apiKey);
        console.log('✅ Result:', validationResult);
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
    console.log('');

    // Test 2: Simple Text Generation
    console.log('📋 Test 2: Simple Text Generation');
    try {
        const response = await callGeminiAPI(
            "Generate a short creative story about a robot learning to paint in exactly 2 sentences.",
            undefined,
            { privateKey: apiKey }
        );
        console.log('✅ Generated Text:', response);
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
    console.log('');

    // Test 3: JSON Response Test
    console.log('📋 Test 3: JSON Response Generation');
    try {
        const jsonPrompt = `Create a JSON object with character information. Return ONLY valid JSON in this format:
    {
      "name": "Character Name",
      "description": "Brief description",
      "power": "Special ability"
    }`;

        const jsonResponse = await callGeminiAPI(jsonPrompt, undefined, { privateKey: apiKey });
        console.log('✅ JSON Response:', jsonResponse);

        // Try to parse the JSON
        try {
            const parsed = JSON.parse(jsonResponse);
            console.log('✅ JSON Parse Success:', parsed);
        } catch (parseError) {
            console.log('⚠️  JSON Parse Warning: Response may not be valid JSON');
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
    console.log('');

    // Test 4: Indonesian Language Test
    console.log('📋 Test 4: Indonesian Language Generation');
    try {
        const indonesianPrompt = "Buatlah cerita pendek dalam bahasa Indonesia tentang seorang chef robot yang belajar memasak rendang. Maksimal 3 kalimat.";
        const indonesianResponse = await callGeminiAPI(indonesianPrompt, undefined, { privateKey: apiKey });
        console.log('✅ Indonesian Response:', indonesianResponse);
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
    console.log('');

    // Test 5: Error Handling Test (Invalid API Key)
    console.log('📋 Test 5: Error Handling (Invalid API Key)');
    try {
        const invalidResult = await validateAPIKey('invalid-key-123');
        console.log('✅ Invalid Key Test Result:', invalidResult);
    } catch (error) {
        console.log('❌ Unexpected Error:', error.message);
    }

    console.log('\n🎉 API Tests Completed!');
}

// Run the tests
runAPITests().catch(console.error);
