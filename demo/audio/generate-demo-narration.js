#!/usr/bin/env node
/**
 * Generate DEMO narration audio with word-level timestamps using ElevenLabs API
 *
 * This generates audio specifically for the interactive demo section,
 * explaining each phase as it happens in the "See It In Action" demo.
 *
 * Usage: ELEVENLABS_API_KEY=your_key node generate-demo-narration.js [voice]
 *
 * Voice options:
 *   - male (Aidan) - Social media influencer
 *   - female (Bella) - Chatty social media influencer
 *   - santa (Jerry) - Jolly Santa Claus
 *
 * Output:
 *   - demo-narration-{voice}.mp3 - The audio file
 *   - demo-narration-{voice}-timing.json - Scene timestamps
 */

const fs = require('fs');
const path = require('path');

// ElevenLabs API configuration
const API_BASE = 'https://api.elevenlabs.io/v1';
const MODEL_ID = 'eleven_turbo_v2_5'; // Fast, high-quality model

// Voice options
const VOICES = {
  male: { id: 'EOVAuWqgSZN2Oel78Psj', name: 'Aidan' },
  female: { id: '4RZ84U1b4WCqpu57LvIq', name: 'Bella' },
  santa: { id: 'MDLAMJ0jxkpYkjXbmG4t', name: 'Jerry' }
};

// Get voice from command line argument (default: male)
const voiceArg = process.argv[2] || 'male';
const selectedVoice = VOICES[voiceArg];

if (!selectedVoice) {
  console.error(`Unknown voice: ${voiceArg}`);
  console.error('Available voices: male, female, santa');
  process.exit(1);
}

const VOICE_ID = selectedVoice.id;
const VOICE_NAME = voiceArg;

// The demo narration script - explains each scene in the interactive demo
// Format: [SCENE:id] marks a new scene (matches demoScenes[].id in workflow-demo.html)
const DEMO_NARRATION_SCRIPT = `
[SCENE:1]
Phase zero: Disambiguation. The workflow starts with a critical question.

When you type /api-create brandfetch, Claude doesn't immediately start researching. First, it asks: what exactly does "brandfetch" mean?

This matters because "brandfetch" could refer to three different things. The Brandfetch REST API at brand.dev. The official npm SDK. Or maybe you want custom brand fetching logic.

The enforce-disambiguation hook blocks all research until this is clarified. Claude presents numbered options and waits for your choice.

Why does this matter? Because researching the wrong library wastes time and produces incorrect implementations. Disambiguation ensures Claude investigates exactly what you need.

[SCENE:2]
Now watch what happens when Claude tries to skip the workflow.

The error demo. Exit code two enforcement.

Claude gets impatient and tries to write route.ts without doing research first. Watch what happens.

Blocked. The enforce-research hook returns exit code two. This isn't just a warning. Exit code two creates a hard block. Claude cannot ignore it.

Look at the error message. Research phase incomplete. Sources consulted: zero. Minimum required: two. Use Context7 or WebSearch first.

Claude must respond to this error. It cannot proceed until it completes research. This is the enforcement mechanism that makes the entire workflow possible.

Exit code two equals mandatory compliance.

[SCENE:3]
Phase one: Scope confirmation.

Before researching, Claude confirms it understands what you want. This prevents wasted research on the wrong use case.

Claude summarizes: Purpose is to fetch brand assets by domain. Input is a domain name like github.com. Output is brand data including logos, colors, and fonts.

The enforce-scope hook requires explicit user confirmation. Claude asks: Is this correct? You respond: Yes.

Only then does Claude proceed to research. Scope confirmation ensures alignment before investment.

[SCENE:4]
Phase two: Initial research. This is where the magic happens.

The enforce-research hook has been blocking Write and Edit operations. Now Claude earns the right to implement by fetching current documentation.

Watch the MCP calls. First, Context7 resolve-library-id to find the correct library. Found: /brandfetch/brandfetch-api.

Then Context7 get-library-docs. Retrieved twenty-three endpoints and forty-seven parameters. That's real data, not training memory.

Finally, a WebSearch for Brandfetch API authentication 2024. Found: Bearer token authentication required.

Two sources consulted. Minimum requirement met. Research complete. The hook now allows implementation to proceed.

Why two sources? Because a single source might be outdated or incomplete. Cross-referencing ensures accuracy.

[SCENE:5]
Phase three: Structured interview.

Here's what makes this different from generic AI assistants. These questions come FROM the research findings. Not from templates.

Question one: Logo formats? The research discovered SVG, PNG, and JPG are available. Claude presents numbered options based on what actually exists.

You choose option three: Both SVG and PNG. Claude records this decision.

Question two: Cache duration? Options range from no caching to seven days. You choose twenty-four hours as recommended.

The enforce-interview hook requires AskUserQuestion with numbered options. It detects self-answering and blocks until human confirmation.

When you confirm the final question, phase_exit_confirmed is set to true. This prevents Claude from accidentally re-asking or overwriting your decisions.

[SCENE:6]
Phase four: Deep research.

Based on your interview answers, Claude proposes targeted follow-up searches. This isn't random. It's specific to your choices.

You chose SVG and PNG formats. So Claude searches for Brandfetch SVG PNG format parameter. Discovered: format query parameter accepts comma-separated values.

You chose twenty-four hour caching. So Claude searches for Brandfetch cache headers CDN. Discovered: supports Cache-Control and ETag headers.

The enforce-deep-research hook ensures these targeted searches happen. Your requirements drive the investigation.

[SCENE:7]
Phase five: Schema creation.

Now Claude has real data AND your preferences. Time to define the contract.

Zod schemas are created from research plus interview. The BrandfetchRequestSchema includes domain and format parameters. The BrandfetchResponseSchema defines the structure of logos and colors arrays.

The enforce-schema hook requires schemas before implementation. This becomes the contract that tests verify and implementation fulfills.

Every discovered parameter is typed. Every interview decision is encoded. The schema is the source of truth.

[SCENE:8]
Phase six: Environment check.

Before writing tests, Claude verifies required API keys exist. This prevents the classic "tests pass locally but fail in CI" problem.

Checking BRANDFETCH_API_KEY. Present in .env.local. Format is valid.

The enforce-environment hook blocks tests until environment is confirmed. No surprises during implementation.

[SCENE:9]
Phase seven: TDD Red. Write failing tests first.

This is test-driven development. Define success before writing implementation.

Claude writes tests to brandfetch.test.ts. Then runs pnpm test. Watch the failures.

Fail: returns brand data for valid domain. Fail: returns SVG and PNG formats. That's from your interview. Fail: respects twenty-four hour cache. Also from your interview. Fail: returns 401 without API key.

Four tests failing. Zero passing. This is exactly correct. Red phase complete.

The enforce-tdd-red hook verifies tests exist AND fail before allowing implementation. No code until tests define the requirements.

[SCENE:10]
Phase eight: TDD Green. Make tests pass.

Now Claude writes minimal implementation. Just enough code to pass the tests.

Writing route.ts. Running pnpm test.

Pass: returns brand data for valid domain. Pass: returns SVG and PNG formats. Pass: respects twenty-four hour cache. Pass: returns 401 without API key.

Four tests passing. Green phase complete.

But wait! Watch what happens automatically. The verify-after-green hook fires.

Hook triggered. Tests passed. Auto-triggering verification. This is Phase nine happening automatically. The workflow enforces itself.

[SCENE:11]
Phase nine: Verification. Re-research and compare.

This catches memory-based drift. Even if Claude researched correctly, implementation might not match.

Claude re-fetches documentation via Context7. Then builds a comparison table.

Auth method. Docs say: Bearer token. Implementation: Match. Logo formats. Docs say: SVG, PNG, JPG. Implementation: Match. Cache header. Docs say: Cache-Control. Implementation: twenty-four hours. Match.

Implementation matches documentation. Verification passes.

If there were mismatches, the workflow would loop back to Phase seven. Write tests for missing features, then re-implement. Continuous verification until correct.

[SCENE:12]
Phase ten: TDD Refactor. Clean up while tests stay green.

Now that tests pass and verification confirms correctness, Claude can improve the code.

Extracting a fetchBrandData helper function. Adding JSDoc comments for documentation.

Running pnpm test. Four tests passing. Refactor complete.

The enforce-refactor hook allows refactoring only when tests pass. Every change is verified by the existing test suite.

[SCENE:13]
Phase eleven: Documentation.

Claude updates the research cache and API manifest. Writing to .claude/research/brandfetch/CURRENT.md. Research cached with seven-day freshness.

Editing api-tests-manifest.json. API manifest updated.

The enforce-documentation hook requires documentation before completion. Future developers, including future Claude sessions, will benefit from this cached knowledge.

[SCENE:14]
Phase twelve: Completion. The final verification.

The api-workflow-check hook runs at Stop time. It verifies all twelve phases completed successfully.

Check: Disambiguation complete. Scope complete. Initial research complete. Interview complete. Deep research complete. Schema creation complete. Environment complete. TDD Red complete. TDD Green complete. Verification complete. TDD Refactor complete. Documentation complete.

Files created: route.ts, brandfetch.test.ts, schema.ts.

Workflow complete. All twelve phases verified.

This is the API Dev Tools workflow. Research first. Interview from findings. Test before code. Verify after green. Document always.

Every step enforced by hooks. Every decision tracked in state. Every phase verified before proceeding.

Twelve phases. Loop-back architecture. Continuous verification.

Hustle together. Build stronger.
`.trim();

/**
 * Extract plain text from the narration script (remove markers)
 */
function extractPlainText(script) {
  return script
    .replace(/\[SCENE:\d+\]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Parse the script to extract scene markers with their positions
 */
function parseSceneMarkers(script) {
  const markers = [];
  const lines = script.split('\n');
  let charPosition = 0;
  let currentScene = 1;

  for (const line of lines) {
    // Check for scene marker
    const sceneMatch = line.match(/\[SCENE:(\d+)\]/);
    if (sceneMatch) {
      currentScene = parseInt(sceneMatch[1]);
      markers.push({
        type: 'scene',
        id: currentScene,
        charPosition
      });
    }

    // Update char position (for plain text, not including markers)
    const plainLine = line.replace(/\[SCENE:\d+\]/g, '');
    if (plainLine.trim()) {
      charPosition += plainLine.length + 1; // +1 for newline
    }
  }

  return markers;
}

/**
 * Convert character-level timestamps to word-level timestamps
 */
function characterToWordTimestamps(alignment) {
  const words = [];
  let currentWord = '';
  let wordStart = null;
  let wordEnd = null;

  for (let i = 0; i < alignment.characters.length; i++) {
    const char = alignment.characters[i];
    const startTime = alignment.character_start_times_seconds[i];
    const endTime = alignment.character_end_times_seconds[i];

    if (char === ' ' || char === '\n') {
      if (currentWord) {
        words.push({
          word: currentWord,
          start: wordStart,
          end: wordEnd,
          charIndex: i - currentWord.length
        });
        currentWord = '';
        wordStart = null;
        wordEnd = null;
      }
    } else {
      if (wordStart === null) {
        wordStart = startTime;
      }
      wordEnd = endTime;
      currentWord += char;
    }
  }

  // Don't forget the last word
  if (currentWord) {
    words.push({
      word: currentWord,
      start: wordStart,
      end: wordEnd,
      charIndex: alignment.characters.length - currentWord.length
    });
  }

  return words;
}

/**
 * Match markers to timestamps based on text position
 */
function matchMarkersToTimestamps(markers, wordTimestamps) {
  const timedMarkers = [];

  for (const marker of markers) {
    // Find the word closest to this marker's position
    let closestWord = wordTimestamps[0];
    let minDiff = Infinity;

    for (const word of wordTimestamps) {
      const diff = Math.abs(word.charIndex - marker.charPosition);
      if (diff < minDiff) {
        minDiff = diff;
        closestWord = word;
      }
    }

    timedMarkers.push({
      ...marker,
      timestamp: closestWord ? closestWord.start : 0
    });
  }

  return timedMarkers;
}

/**
 * Call ElevenLabs API to generate speech with timestamps
 */
async function generateSpeech(text, apiKey) {
  const url = `${API_BASE}/text-to-speech/${VOICE_ID}/with-timestamps`;

  console.log('Calling ElevenLabs API...');
  console.log(`Text length: ${text.length} characters`);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json'
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
    throw new Error(`ElevenLabs API error: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Main function
 */
async function main() {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    console.error('Error: ELEVENLABS_API_KEY environment variable is required');
    console.error('Usage: ELEVENLABS_API_KEY=your_key node generate-demo-narration.js [voice]');
    process.exit(1);
  }

  console.log(`\n=== Generating DEMO narration with ${selectedVoice.name} (${VOICE_NAME}) ===\n`);

  const outputDir = __dirname;
  const audioPath = path.join(outputDir, `demo-narration-${VOICE_NAME}.mp3`);
  const timingPath = path.join(outputDir, `demo-narration-${VOICE_NAME}-timing.json`);

  // Extract plain text for TTS
  const plainText = extractPlainText(DEMO_NARRATION_SCRIPT);
  console.log('Plain text extracted:', plainText.substring(0, 200) + '...');

  // Parse scene markers from script
  const markers = parseSceneMarkers(DEMO_NARRATION_SCRIPT);
  console.log(`Found ${markers.length} scene markers`);

  try {
    // Generate speech with timestamps
    const result = await generateSpeech(plainText, apiKey);

    console.log('Audio generated successfully!');

    // Decode and save audio
    const audioBuffer = Buffer.from(result.audio_base64, 'base64');
    fs.writeFileSync(audioPath, audioBuffer);
    console.log(`Audio saved to: ${audioPath}`);
    console.log(`Audio size: ${(audioBuffer.length / 1024 / 1024).toFixed(2)} MB`);

    // Convert character timestamps to word timestamps
    const wordTimestamps = characterToWordTimestamps(result.alignment);
    console.log(`Extracted ${wordTimestamps.length} word timestamps`);

    // Match markers to timestamps
    const timedMarkers = matchMarkersToTimestamps(markers, wordTimestamps);

    // Calculate duration
    const lastWord = wordTimestamps[wordTimestamps.length - 1];
    const duration = lastWord ? lastWord.end : 0;

    // Build scene timing data
    const scenes = [];
    for (let i = 0; i < timedMarkers.length; i++) {
      const marker = timedMarkers[i];
      const nextMarker = timedMarkers[i + 1];
      scenes.push({
        id: marker.id,
        startTime: marker.timestamp,
        endTime: nextMarker ? nextMarker.timestamp : duration
      });
    }

    // Build timing data
    const timingData = {
      generated: new Date().toISOString(),
      voice: VOICE_NAME,
      duration,
      wordCount: wordTimestamps.length,
      sceneCount: scenes.length,
      scenes,
      words: wordTimestamps.map(w => ({
        word: w.word,
        start: w.start,
        end: w.end
      }))
    };

    // Save timing data
    fs.writeFileSync(timingPath, JSON.stringify(timingData, null, 2));
    console.log(`Timing data saved to: ${timingPath}`);

    console.log('\n=== Summary ===');
    console.log(`Duration: ${Math.floor(duration / 60)}:${(duration % 60).toFixed(0).padStart(2, '0')}`);
    console.log(`Scenes: ${timingData.sceneCount}`);
    console.log(`Words: ${timingData.words.length}`);

    console.log('\n=== Scene Timestamps ===');
    for (const scene of scenes) {
      const startMins = Math.floor(scene.startTime / 60);
      const startSecs = (scene.startTime % 60).toFixed(1);
      const endMins = Math.floor(scene.endTime / 60);
      const endSecs = (scene.endTime % 60).toFixed(1);
      console.log(`  Scene ${scene.id}: ${startMins}:${startSecs.padStart(4, '0')} - ${endMins}:${endSecs.padStart(4, '0')}`);
    }

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
