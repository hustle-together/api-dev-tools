#!/usr/bin/env node
/**
 * Generate full narration audio with word-level timestamps for ALL voices
 *
 * Usage: ELEVENLABS_API_KEY=your_key node generate-all-narrations.js
 *
 * Output:
 *   - narration-adam.mp3 + narration-adam-timing.json
 *   - narration-mark.mp3 + narration-mark-timing.json
 *   - narration-hope.mp3 + narration-hope-timing.json
 *   - narration-creature.mp3 + narration-creature-timing.json
 *   - narration-gaming.mp3 + narration-gaming-timing.json
 */

const fs = require('fs');
const path = require('path');

// ElevenLabs API configuration
const API_BASE = 'https://api.elevenlabs.io/v1';
const MODEL_ID = 'eleven_turbo_v2_5'; // Fast, high-quality model

// Voice configurations - All available voices
const VOICES = [
  {
    id: 'pNInz6obpgDQGcFmaJgB',
    name: 'adam',
    displayName: 'Adam',
    description: 'Deep, professional'
  },
  {
    id: 'UgBBYS2sOqTuMpoF3BR0',
    name: 'mark',
    displayName: 'Mark',
    description: 'Warm, conversational'
  },
  {
    id: 'tnSpp4vdxKPjI9w0GnoV',
    name: 'hope',
    displayName: 'Hope',
    description: 'Bright, energetic'
  },
  {
    id: 'Z7RrOqZFTyLpIlzCgfsp',
    name: 'creature',
    displayName: 'Creature',
    description: 'Unique, character voice'
  },
  {
    id: 'YOq2y2Up4RgXP2HyXjE5',
    name: 'gaming',
    displayName: 'Gaming',
    description: 'Dynamic, enthusiastic'
  }
];

// The narration script with section markers and highlight triggers
// Format: [SECTION:id] marks a new section, [HIGHLIGHT:element-selector] marks what to highlight
const NARRATION_SCRIPT = `
[SECTION:intro]
Welcome to Hustle API Dev Tools, version three point oh.

[HIGHLIGHT:#hustleBrand]
This package enforces a structured, twelve-phase workflow for AI-assisted API development.

[HIGHLIGHT:[data-phase="research"]]
Research first. No assumptions. No training data. Real documentation from Context7 and web search.

[HIGHLIGHT:[data-phase="interview"]]
Interview second. The AI asks YOU questions with structured options based on what it actually found.

[HIGHLIGHT:[data-phase="test"]]
Test before code. Red, green, refactor. No implementation without a failing test.

[HIGHLIGHT:[data-phase="docs"]]
Document everything. Every endpoint documented with real examples and schemas.

The philosophy is simple: Hustle together. Share resources. Build stronger.

[SECTION:problems]
[HIGHLIGHT:#problems h2]
Let's talk about the problem. What goes wrong when AI builds APIs without structure?

[HIGHLIGHT:.gap-item:nth-child(1)]
Gap one: AI doesn't use your exact words. You say Brandfetch API but it searches for something else. Wrong library. Wrong documentation.

[HIGHLIGHT:.gap-item:nth-child(2)]
Gap two: Generic questions. Without research first, the AI asks template questions instead of specific ones based on actual API capabilities.

[HIGHLIGHT:.gap-item:nth-child(3)]
Gap three: Memory-based implementation. After research, the AI forgets what it learned and implements from training data instead.

[HIGHLIGHT:.gap-item:nth-child(4)]
Gap four: No verification after tests pass. The AI writes code that passes tests but doesn't match the actual documentation.

[HIGHLIGHT:.gap-item:nth-child(5)]
Gap five: Context dilution. After many turns, the AI forgets project structure, documentation locations, and workflow requirements.

These gaps compound. Version three solves all of them with loop-back architecture and continuous re-grounding.

[SECTION:solution]
[HIGHLIGHT:#solution h2]
The solution is enforcement. Python hooks that intercept every tool call.

[HIGHLIGHT:.hook-box:nth-child(1)]
PreToolUse hooks run before Claude writes any file. They inject interview decisions as reminders and block writes without research.

[HIGHLIGHT:.hook-box:nth-child(2)]
PostToolUse hooks track tool usage and trigger verification. After tests pass, they force Phase nine: re-read the documentation.

[HIGHLIGHT:.hook-box:nth-child(3)]
The Stop hook blocks completion if any phase is incomplete. No more premature "done" declarations.

[HIGHLIGHT:.hook-box:nth-child(4)]
SessionStart and periodic hooks re-inject context every seven turns to prevent dilution in long sessions.

This isn't about limiting AI. It's about holding it to the same standards we hold ourselves.

[SECTION:phases]
[HIGHLIGHT:#phases h2]
The workflow now has twelve phases. Two new ones in version three.

[HIGHLIGHT:[data-phase="0"]]
Phase zero: Disambiguation. When you say Vercel AI, do you mean the SDK or the Gateway? We clarify before researching.

[HIGHLIGHT:[data-phase="1"]]
Phase one: Scope. Confirm we understand what you want to build.

[HIGHLIGHT:[data-phase="2"]]
Phase two: Initial research. Context7 and web search. Find the real documentation.

[HIGHLIGHT:[data-phase="3"]]
Phase three: Interview. Questions generated FROM research findings. Not generic templates.

[HIGHLIGHT:[data-phase="4"]]
Phase four: Deep research. Based on your interview answers, we propose targeted follow-up searches. Adaptive, not shotgun.

[HIGHLIGHT:[data-phase="5"]]
Phase five: Schema. Define Zod schemas based on research plus interview decisions.

[HIGHLIGHT:[data-phase="6"]]
Phase six: Environment. Verify API keys exist before writing code.

[HIGHLIGHT:[data-phase="7"]]
Phase seven: TDD Red. Write failing tests. Define success before implementation.

[HIGHLIGHT:[data-phase="8"]]
Phase eight: TDD Green. Minimal code to pass tests. Interview decisions injected by hooks.

[HIGHLIGHT:[data-phase="9"]]
Phase nine: Verify. This is new. Re-read the original documentation and compare to implementation. Find gaps. Loop back if needed.

[HIGHLIGHT:[data-phase="10"]]
Phase ten: Refactor. Clean up code while tests stay green.

[HIGHLIGHT:[data-phase="11"]]
Phase eleven: Documentation. Update OpenAPI spec and test manifest.

[HIGHLIGHT:[data-phase="12"]]
Phase twelve: Complete. Final verification by the Stop hook.

Every phase can loop back. If verification finds gaps, we return to Red and write tests for missing features.

[SECTION:demo]
[HIGHLIGHT:#demo h2]
Let's watch a real example. Creating a Brandfetch API endpoint.

[HIGHLIGHT:[data-step="0"]]
The user types /api-create brandfetch. The twelve-phase workflow begins.

[HIGHLIGHT:[data-step="1"]]
Claude confirms scope. We're building an endpoint to fetch brand assets by domain.

[HIGHLIGHT:[data-step="2"]]
Initial research. Claude uses Context7 to find the SDK documentation. WebSearch finds rate limits and response formats.

[HIGHLIGHT:[data-step="3"]]
Interview begins. But notice: the questions are specific to what Claude actually found. What's the primary purpose? Options come from the documentation.

[HIGHLIGHT:[data-step="4"]]
User selects: Full brand kit with logos, colors, and fonts.

[HIGHLIGHT:[data-step="5"]]
More questions. How should API keys be handled? User selects server environment variables only.

[HIGHLIGHT:[data-step="7"]]
Deep research. Based on your selections, Claude proposes specific searches for the full brand response format.

[HIGHLIGHT:[data-step="8"]]
Schema created. Zod types based on research plus interview decisions.

[HIGHLIGHT:[data-step="9"]]
Environment check. The hook verifies BRANDFETCH_API_KEY exists.

[HIGHLIGHT:[data-step="10"]]
TDD Red. Claude writes twelve failing test cases.

[HIGHLIGHT:[data-step="11"]]
TDD Green. Implementation begins. Watch the hook inject interview decisions.

[HIGHLIGHT:[data-step="12"]]
The hook reminds Claude: Remember user decisions. Purpose: full brand kit. API key handling: server only.

[HIGHLIGHT:[data-step="13"]]
Phase nine: Verify. Claude re-reads the Brandfetch documentation and compares to implementation. All features accounted for.

[HIGHLIGHT:[data-step="14"]]
Refactor. Code cleaned up. Tests still pass.

[HIGHLIGHT:[data-step="15"]]
Documentation updated. API test manifest and OpenAPI spec.

[HIGHLIGHT:[data-step="16"]]
Complete. All twelve phases verified. Four files created. Twelve tests passing.

[SECTION:installation]
[HIGHLIGHT:#installation h2]
Installation takes one command.

[HIGHLIGHT:.install-command]
Run npx @hustle-together/api-dev-tools. That's it.

The CLI copies slash commands, Python hooks, and settings. It creates the research cache folder and updates your CLAUDE.md with workflow documentation.

Version three adds automatic CLAUDE.md updates so Claude understands the workflow in your project.

Your project is now enforced. Every API follows the twelve-phase workflow.

[SECTION:credits]
[HIGHLIGHT:#credits h2]
This project builds on the work of others.

The TDD workflow is based on @wbern/claude-instructions by William Bernmalm.

Context7 provides live documentation lookup. Current docs, not stale training data.

And the interview methodology ensures questions come from research, not templates.

Thank you to the Claude Code community. Together, we're making AI development better.

[SECTION:outro]
[HIGHLIGHT:#intro]
Hustle API Dev Tools version three. Twelve phases. Loop-back architecture. Continuous verification.

Research first. Questions FROM findings. Verify after green. Document always.

Install it now with npx @hustle-together/api-dev-tools.
`.trim();

/**
 * Extract plain text from the narration script (remove markers)
 */
function extractPlainText(script) {
  return script
    .replace(/\[SECTION:[^\]]+\]/g, '')
    .replace(/\[HIGHLIGHT:[^\]]+\]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Parse the script to extract section and highlight markers with their positions
 */
function parseMarkers(script) {
  const markers = [];
  const lines = script.split('\n');
  let charPosition = 0;
  let currentSection = 'intro';

  for (const line of lines) {
    // Check for section marker
    const sectionMatch = line.match(/\[SECTION:([^\]]+)\]/);
    if (sectionMatch) {
      currentSection = sectionMatch[1];
      markers.push({
        type: 'section',
        id: currentSection,
        charPosition
      });
    }

    // Check for highlight marker
    // Use a more robust regex that handles nested brackets like [data-phase="0"]
    const highlightMatch = line.match(/\[HIGHLIGHT:(.+?)\]$/);
    if (highlightMatch) {
      // Extract the selector - handle double brackets for attribute selectors
      let selector = highlightMatch[1];
      // If selector starts with [ but doesn't end with ], add the closing bracket
      if (selector.startsWith('[') && !selector.endsWith(']')) {
        selector = selector + ']';
      }
      markers.push({
        type: 'highlight',
        selector: selector,
        section: currentSection,
        charPosition
      });
    }

    // Update char position (for plain text, not including markers)
    const plainLine = line
      .replace(/\[SECTION:[^\]]+\]/g, '')
      .replace(/\[HIGHLIGHT:[^\]]+\]/g, '');
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
function matchMarkersToTimestamps(markers, wordTimestamps, plainText) {
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
async function generateSpeech(text, voiceId, apiKey) {
  const url = `${API_BASE}/text-to-speech/${voiceId}/with-timestamps`;

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
 * Generate narration for a single voice
 */
async function generateForVoice(voice, plainText, markers, apiKey, outputDir) {
  console.log(`\n=== Generating narration for ${voice.displayName} ===`);
  console.log(`Voice ID: ${voice.id}`);

  const audioPath = path.join(outputDir, `narration-${voice.name}.mp3`);
  const timingPath = path.join(outputDir, `narration-${voice.name}-timing.json`);

  try {
    // Generate speech with timestamps
    const result = await generateSpeech(plainText, voice.id, apiKey);

    console.log(`Audio generated successfully!`);

    // Decode and save audio
    const audioBuffer = Buffer.from(result.audio_base64, 'base64');
    fs.writeFileSync(audioPath, audioBuffer);
    console.log(`Audio saved: ${audioPath}`);
    console.log(`Audio size: ${(audioBuffer.length / 1024 / 1024).toFixed(2)} MB`);

    // Convert character timestamps to word timestamps
    const wordTimestamps = characterToWordTimestamps(result.alignment);
    console.log(`Extracted ${wordTimestamps.length} word timestamps`);

    // Match markers to timestamps
    const timedMarkers = matchMarkersToTimestamps(markers, wordTimestamps, plainText);

    // Calculate duration
    const lastWord = wordTimestamps[wordTimestamps.length - 1];
    const duration = lastWord ? lastWord.end : 0;

    // Build timing data
    const timingData = {
      generated: new Date().toISOString(),
      voice: voice.displayName,
      voiceId: voice.id,
      duration,
      wordCount: wordTimestamps.length,
      sections: [],
      highlights: [],
      words: wordTimestamps.map(w => ({
        word: w.word,
        start: w.start,
        end: w.end
      }))
    };

    // Separate sections and highlights
    for (const marker of timedMarkers) {
      if (marker.type === 'section') {
        timingData.sections.push({
          id: marker.id,
          timestamp: marker.timestamp
        });
      } else if (marker.type === 'highlight') {
        timingData.highlights.push({
          selector: marker.selector,
          section: marker.section,
          timestamp: marker.timestamp
        });
      }
    }

    // Save timing data
    fs.writeFileSync(timingPath, JSON.stringify(timingData, null, 2));
    console.log(`Timing saved: ${timingPath}`);

    console.log(`Duration: ${duration.toFixed(1)} seconds`);
    console.log(`Sections: ${timingData.sections.length}`);
    console.log(`Highlights: ${timingData.highlights.length}`);

    return {
      voice: voice.displayName,
      name: voice.name,
      audioFile: `narration-${voice.name}.mp3`,
      timingFile: `narration-${voice.name}-timing.json`,
      duration,
      wordCount: wordTimestamps.length,
      audioSize: audioBuffer.length
    };

  } catch (error) {
    console.error(`Error generating for ${voice.displayName}: ${error.message}`);
    return null;
  }
}

/**
 * Main function
 */
async function main() {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    console.error('Error: ELEVENLABS_API_KEY environment variable is required');
    console.error('Usage: ELEVENLABS_API_KEY=your_key node generate-all-narrations.js');
    process.exit(1);
  }

  // Parse command line args for specific voice
  const args = process.argv.slice(2);
  const specificVoice = args[0];

  const outputDir = __dirname;

  // Extract plain text for TTS
  const plainText = extractPlainText(NARRATION_SCRIPT);
  console.log('Plain text extracted:', plainText.substring(0, 100) + '...');
  console.log(`Total characters: ${plainText.length}`);

  // Parse markers from script
  const markers = parseMarkers(NARRATION_SCRIPT);
  console.log(`Found ${markers.length} markers`);

  // Filter voices if specific one requested
  let voicesToGenerate = VOICES;
  if (specificVoice) {
    voicesToGenerate = VOICES.filter(v =>
      v.name.toLowerCase() === specificVoice.toLowerCase() ||
      v.displayName.toLowerCase() === specificVoice.toLowerCase()
    );
    if (voicesToGenerate.length === 0) {
      console.error(`Voice "${specificVoice}" not found. Available: ${VOICES.map(v => v.name).join(', ')}`);
      process.exit(1);
    }
  }

  console.log(`\nGenerating ${voicesToGenerate.length} voice narration(s)...`);

  const results = [];

  for (const voice of voicesToGenerate) {
    const result = await generateForVoice(voice, plainText, markers, apiKey, outputDir);
    if (result) {
      results.push(result);
    }

    // Add delay between API calls to avoid rate limiting
    if (voicesToGenerate.indexOf(voice) < voicesToGenerate.length - 1) {
      console.log('\nWaiting 5 seconds before next voice...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  // Write manifest
  const manifestPath = path.join(outputDir, 'voices-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify({
    generated: new Date().toISOString(),
    voices: results
  }, null, 2));

  console.log('\n=== SUMMARY ===');
  console.log(`Generated ${results.length}/${voicesToGenerate.length} voice narrations`);
  console.log(`Manifest: ${manifestPath}`);

  for (const result of results) {
    console.log(`  ${result.voice}: ${result.duration.toFixed(1)}s, ${(result.audioSize / 1024 / 1024).toFixed(2)} MB`);
  }
}

main();
