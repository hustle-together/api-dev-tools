#!/usr/bin/env node
/**
 * Generate voice preview clips with different ElevenLabs voices
 *
 * Usage: ELEVENLABS_API_KEY=your_key node generate-voice-previews.js
 *
 * Output: Creates preview MP3 files in ./previews/ directory
 */

const fs = require('fs');
const path = require('path');

// ElevenLabs API configuration
const API_BASE = 'https://api.elevenlabs.io/v1';
const MODEL_ID = 'eleven_turbo_v2_5'; // Fast, high-quality model

// Voice configurations
const VOICES = [
  {
    id: 'UgBBYS2sOqTuMpoF3BR0',
    name: 'mark',
    displayName: 'Mark'
  },
  {
    id: 'tnSpp4vdxKPjI9w0GnoV',
    name: 'hope',
    displayName: 'Hope'
  },
  {
    id: 'Z7RrOqZFTyLpIlzCgfsp',
    name: 'creature',
    displayName: 'Creature'
  },
  {
    id: 'YOq2y2Up4RgXP2HyXjE5',
    name: 'gaming',
    displayName: 'Gaming'
  }
];

// Preview text - short snippet that showcases the voice
const PREVIEW_TEXT = `Welcome to Hustle API Dev Tools. Build APIs the right way. Research first. Interview second. Test before code. Document everything.`;

/**
 * Generate speech for a single voice
 */
async function generateVoicePreview(voice, text, apiKey) {
  const url = `${API_BASE}/text-to-speech/${voice.id}`;

  console.log(`Generating preview for ${voice.displayName}...`);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg'
    },
    body: JSON.stringify({
      text,
      model_id: MODEL_ID,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.3,
        use_speaker_boost: true
      }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs API error for ${voice.name}: ${response.status} - ${error}`);
  }

  // Get audio as buffer
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Main function
 */
async function main() {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    console.error('Error: ELEVENLABS_API_KEY environment variable is required');
    console.error('Usage: ELEVENLABS_API_KEY=your_key node generate-voice-previews.js');
    process.exit(1);
  }

  const outputDir = path.join(__dirname, 'previews');

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Generating voice previews...');
  console.log(`Text: "${PREVIEW_TEXT}"`);
  console.log('');

  const results = [];

  for (const voice of VOICES) {
    try {
      const audioBuffer = await generateVoicePreview(voice, PREVIEW_TEXT, apiKey);
      const outputPath = path.join(outputDir, `preview-${voice.name}.mp3`);
      fs.writeFileSync(outputPath, audioBuffer);

      const sizeMB = (audioBuffer.length / 1024 / 1024).toFixed(2);
      console.log(`  ✓ ${voice.displayName}: ${outputPath} (${sizeMB} MB)`);

      results.push({
        voice: voice.displayName,
        id: voice.id,
        file: `preview-${voice.name}.mp3`,
        size: audioBuffer.length
      });
    } catch (error) {
      console.error(`  ✗ ${voice.displayName}: ${error.message}`);
    }
  }

  // Write manifest
  const manifestPath = path.join(outputDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify({
    generated: new Date().toISOString(),
    text: PREVIEW_TEXT,
    voices: results
  }, null, 2));

  console.log('');
  console.log(`=== Done ===`);
  console.log(`Generated ${results.length}/${VOICES.length} voice previews`);
  console.log(`Manifest: ${manifestPath}`);
}

main();
