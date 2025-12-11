#!/usr/bin/env node
/**
 * Generate DEMO narration audio with word-level timestamps using ElevenLabs API
 *
 * This generates audio specifically for the interactive demo section,
 * explaining each phase as it happens in the "See It In Action" demo.
 *
 * Usage: ELEVENLABS_API_KEY=your_key node generate-demo-narration.js
 *
 * Uses Aidan (male) voice only for demo narration.
 *
 * Output:
 *   - demo-narration.mp3 - The audio file
 *   - demo-narration-timing.json - Scene timestamps
 */

const fs = require('fs');
const path = require('path');

// ElevenLabs API configuration
const API_BASE = 'https://api.elevenlabs.io/v1';
const MODEL_ID = 'eleven_turbo_v2_5'; // Fast, high-quality model

// Use Aidan (male) voice for demo narration
const VOICE_ID = 'EOVAuWqgSZN2Oel78Psj';
const VOICE_NAME = 'aidan';

// The demo narration script - explains each scene with Problem → Solution format
// Format: [SCENE:id] marks a new scene (matches demoScenes[].id in workflow-demo.html)
const DEMO_NARRATION_SCRIPT = `
[SCENE:1]
Phase zero: Disambiguation.

Here's the problem. When you say "brandfetch," what do you actually mean? It could be the Brandfetch REST API. Or the npm SDK. Or custom code you want to write.

If Claude guesses wrong, it researches the wrong thing. Then it builds the wrong implementation. You waste an hour before realizing the mistake.

Here's the solution. The enforce-disambiguation hook blocks ALL research until Claude asks you to clarify. Watch the terminal. Claude presents numbered options. You pick one. Now everyone's on the same page.

This takes five seconds. It saves an hour. That's the trade-off.

[SCENE:2]
Now let's see what happens when Claude tries to cheat.

The problem: Claude is impatient. It wants to skip research and start writing code immediately. It thinks it "already knows" the API from training data.

Watch what happens when Claude tries to write route.ts without researching first.

BLOCKED. Exit code two.

This is the key insight. Exit code two is not a warning. It's a hard stop. Claude cannot proceed. It cannot ignore this. It must respond to the error.

Look at the message: "Research phase incomplete. Sources consulted: zero. Required: two."

Claude has no choice. It must do the research. This is enforcement, not suggestion.

[SCENE:3]
Phase one: Scope confirmation.

The problem: Claude might misunderstand what you want. You say "fetch brand assets" but Claude thinks you want a database model.

The solution: Before spending time on research, Claude summarizes its understanding and asks: "Is this correct?"

You see the summary. Purpose: fetch brand assets by domain. Input: domain name. Output: logos, colors, fonts.

If it's wrong, you correct it now. If it's right, you confirm. Either way, you're aligned before any real work begins.

[SCENE:4]
Phase two: Initial research.

The problem: Claude's training data might be months or years old. APIs change. Endpoints get deprecated. Authentication methods evolve. Building from stale knowledge means broken code.

The solution: Claude must fetch CURRENT documentation before writing anything. Watch the MCP calls.

Context7 resolve-library-id finds the right library. Context7 get-library-docs retrieves twenty-three endpoints and forty-seven parameters. That's live data, not memory.

Then WebSearch confirms: Bearer token authentication required.

Two sources. Cross-referenced. Now Claude has accurate, current information.

[SCENE:5]
Phase three: Structured interview.

The problem: Generic AI assistants ask template questions. "What format do you want?" They don't know what formats actually exist.

The solution: Questions come FROM the research findings. Claude discovered SVG, PNG, and JPG are available. So those are the options it presents.

You pick "Both SVG and PNG." Claude records this as a decision.

The enforce-interview hook prevents self-answering. Claude can't ask a question then immediately answer itself. It must wait for YOUR response.

When you confirm, phase_exit_confirmed is set to true. Your decisions are locked in.

[SCENE:6]
Phase four: Deep research.

The problem: Initial research gives you the overview. But your specific choices might need deeper investigation.

The solution: Based on YOUR interview answers, Claude proposes targeted follow-up searches.

You chose SVG and PNG? Claude searches for "Brandfetch format parameter" to learn exactly how to request multiple formats.

You chose 24-hour caching? Claude searches for "Brandfetch cache headers" to implement it correctly.

Your requirements drive the research. Not generic exploration.

[SCENE:7]
Phase five: Schema creation.

The problem: Without a contract, tests and implementation can drift apart. The API might return fields that aren't validated. Or expect fields that aren't typed.

The solution: Zod schemas define the exact shape of requests and responses. BrandfetchRequestSchema specifies domain and format. BrandfetchResponseSchema defines logos and colors arrays.

Every discovered parameter is typed. Every interview decision is encoded. The schema becomes the source of truth that tests verify and implementation must match.

[SCENE:8]
Phase six: Environment check.

The problem: Tests pass locally but fail in CI. Why? Missing API key. You waste thirty minutes debugging before realizing the environment isn't set up.

The solution: Check environment BEFORE writing tests. Is BRANDFETCH_API_KEY present? Is the format valid?

The enforce-environment hook blocks tests until environment is confirmed. No surprises later.

[SCENE:9]
Phase seven: TDD Red.

The problem: Without tests, you don't know if your code works. You ship bugs. You break things in production.

The solution: Write failing tests FIRST. Define what success looks like before writing implementation.

Watch the test output. Four tests. All failing. Returns brand data? Fail. Returns SVG and PNG formats? Fail. Respects 24-hour cache? Fail. Returns 401 without API key? Fail.

This is CORRECT. Red phase means tests exist and fail. Now we know exactly what to build.

[SCENE:10]
Phase eight: TDD Green.

The problem: Developers often write more code than needed. They add features that weren't requested. They over-engineer.

The solution: Write MINIMAL implementation. Just enough to pass the tests. Nothing more.

Watch the test output. Four tests. All passing. Brand data? Pass. Formats? Pass. Cache? Pass. Error handling? Pass.

Green means tests pass. But wait... watch what happens automatically.

The verify-after-green hook triggers Phase nine. No manual intervention needed. The workflow enforces itself.

[SCENE:11]
Phase nine: Verification.

The problem: Even after researching, Claude might implement from memory. It forgets details. It makes assumptions. The implementation drifts from what the docs actually say.

The solution: After tests pass, RE-FETCH the documentation. Compare implementation to current docs. Build a verification table.

Auth method? Docs say Bearer token. Implementation uses Bearer token. Match. Logo formats? Docs list SVG, PNG, JPG. Implementation supports all three. Match.

If there's a mismatch, the workflow loops back. Write tests for missing features. Re-implement. Verify again. Continuous correction until correct.

[SCENE:12]
Phase ten: TDD Refactor.

The problem: First implementations are often messy. But cleaning up code might break things.

The solution: Refactor WHILE tests stay green. Every change is verified by the existing test suite.

Extract a helper function? Run tests. Add documentation? Run tests. If anything breaks, you know immediately.

Four tests still passing. Refactor complete.

[SCENE:13]
Phase eleven: Documentation.

The problem: Knowledge gets lost. The next developer, or the next Claude session, starts from scratch. They make the same mistakes. They ask the same questions.

The solution: Cache everything. Research findings go into .claude/research/brandfetch/CURRENT.md with a seven-day freshness timer. API manifest gets updated with endpoint details.

Future sessions can skip research if the cache is fresh. Your work today benefits tomorrow's work.

[SCENE:14]
Phase twelve: Completion.

The problem: How do you know everything is actually done? Claude might claim it's finished but skip steps.

The solution: The api-workflow-check hook runs at stop time. It verifies all twelve phases completed successfully.

Disambiguation? Complete. Scope? Complete. Initial research? Complete. Interview? Complete. Deep research? Complete. Schema? Complete. Environment? Complete. TDD Red? Complete. TDD Green? Complete. Verification? Complete. Refactor? Complete. Documentation? Complete.

All twelve phases verified. Files created. Tests passing. Documentation updated.

That's the API Dev Tools workflow. Research first. Questions from findings. Test before code. Verify after green. Document always.

Every step enforced by hooks. Every decision tracked in state. Every phase verified before proceeding.

Tap Next Scene to continue, or click any phase in the sidebar to hear its explanation again.
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

  console.log(`\n=== Generating DEMO narration with Aidan (${VOICE_NAME}) ===\n`);

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
