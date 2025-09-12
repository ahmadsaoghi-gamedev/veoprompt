// Simple Image Generator Script using Pollinations.ai
import https from 'https';
import fs from 'fs';

const prompt = process.argv[2] || 'A beautiful sunset over mountains';
const outputFile = process.argv[3] || 'generated-image.png';

// Pollinations.ai parameters
const params = new URLSearchParams({
    width: '1024',
    height: '1024',
    seed: Math.floor(Math.random() * 1000000).toString(),
    model: 'flux',
    nologo: 'true'
});

const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${params.toString()}`;

console.log(`🎨 Generating: "${prompt}"`);
console.log(`🌐 Using: Pollinations.ai (Free API)`);
console.log(`💾 Output: ${outputFile}`);
console.log('⏳ Please wait...\n');

const options = {
    hostname: 'image.pollinations.ai',
    port: 443,
    path: `/prompt/${encodeURIComponent(prompt)}?${params.toString()}`,
    method: 'GET',
    headers: {
        'Accept': 'image/*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
};

const req = https.request(options, (res) => {
    let imageData = Buffer.alloc(0);

    res.on('data', (chunk) => {
        imageData = Buffer.concat([imageData, chunk]);
    });

    res.on('end', () => {
        if (res.statusCode === 200) {
            try {
                // Save the image directly
                fs.writeFileSync(outputFile, imageData);

                console.log('✅ Success! Image generated and saved!');
                console.log(`🖼️  Image saved as: ${outputFile}`);
                console.log(`📊 Size: ${Math.round(imageData.length / 1024)} KB`);
                console.log(`📝 Content-Type: ${res.headers['content-type'] || 'image/png'}`);
                console.log(`🔗 Generated with: [Pollinations.ai](https://pollinations.ai/)`);
            } catch (error) {
                console.log('❌ Error saving file:', error.message);
            }
        } else {
            console.log(`❌ Error (${res.statusCode}): ${res.statusMessage}`);
            console.log('📄 Response:', imageData.toString());
        }
    });
});

req.on('error', (error) => {
    console.log('❌ Request error:', error.message);
});

req.end();
