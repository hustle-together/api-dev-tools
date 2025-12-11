#!/usr/bin/env node
/**
 * Generate narration audio with word-level timestamps using ElevenLabs API
 *
 * Usage: ELEVENLABS_API_KEY=your_key node generate-narration.js [voice]
 *
 * Voice options:
 *   - male (Aidan) - Social media influencer
 *   - female (Bella) - Chatty social media influencer
 *   - santa (Jerry) - Jolly Santa Claus
 *
 * Output:
 *   - narration-{voice}.mp3 - The audio file
 *   - narration-{voice}-timing.json - Word timestamps with highlight triggers
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

// The narration script with section markers and highlight triggers
// Format: [SECTION:id] marks a new section, [HIGHLIGHT:element-selector] marks what to highlight
// Section IDs must match HTML page section IDs: hero, problem, solution, grounding, hooks, phases, demo, state, install
const NARRATION_SCRIPT = `
[SECTION:hero]
Welcome to API Dev Tools, version one point oh.

[HIGHLIGHT:.hero-badge]
This is an interview-driven, research-first workflow for Claude Code.

[HIGHLIGHT:.hero-tagline]
Continuous verification loops ensure the AI never falls back to outdated training data.

[HIGHLIGHT:.hero-terminal]
One command installs everything. npx @hustle-together/api-dev-tools.

The philosophy is simple: Research first. Interview second. Test before code. Document always.

[SECTION:problem]
[HIGHLIGHT:#problem h2]
Let's talk about the problem. Six failure modes break AI-assisted API development.

[HIGHLIGHT:.problem-card:nth-child(1)]
Problem one: Outdated documentation. AI training data can be months or years old. APIs change constantly with new endpoints and deprecated parameters. Your implementation breaks on day one.

[HIGHLIGHT:.problem-card:nth-child(2)]
Problem two: Memory-based implementation. Even after researching current docs, the AI forgets by implementation time. It falls back to training patterns that don't match what it just read.

[HIGHLIGHT:.problem-card:nth-child(3)]
Problem three: Self-answering questions. The AI asks "What format do you want?" then immediately answers itself. Your actual requirements never get captured.

[HIGHLIGHT:.problem-card:nth-child(4)]
Problem four: Context dilution. In long sessions, early decisions fade from the context window. Turn forty-seven doesn't remember turn three.

[HIGHLIGHT:.problem-card:nth-child(5)]
Problem five: Skipped verification. The AI claims done without checking if implementation matches documentation. Memory-based errors slip through uncaught.

[HIGHLIGHT:.problem-card:nth-child(6)]
Problem six: No enforcement mechanism. Nothing forces the AI to follow the workflow. It can skip steps whenever convenient.

These problems compound. Each failure leads to the next.

[SECTION:solution]
[HIGHLIGHT:#solution h2]
The solution: Six fixes that directly address each problem. Python hooks that BLOCK progress.

[HIGHLIGHT:.solution-card:nth-child(1)]
Fix one: Research-first enforcement. Blocks ALL implementation until Context7 or WebSearch fetches current documentation. No cached code allowed.

[HIGHLIGHT:.solution-card:nth-child(2)]
Fix two: Verification loops. Re-fetches documentation AFTER tests pass and compares to implementation. Catches memory-based drift.

[HIGHLIGHT:.solution-card:nth-child(3)]
Fix three: Interview enforcement. Requires the AskUserQuestion tool with structured numbered options. Detects self-answers and blocks until human confirmation.

[HIGHLIGHT:.solution-card:nth-child(4)]
Fix four: Periodic re-grounding. Re-injects interview decisions and current phase every seven turns. Uses phase_exit_confirmed to track explicit user approval.

[HIGHLIGHT:.solution-card:nth-child(5)]
Fix five: Automatic re-research. Triggers when tests pass. Re-fetches docs, builds comparison table, loops back if implementation doesn't match.

[HIGHLIGHT:.solution-card:nth-child(6)]
Fix six: Exit code two blocking. Hooks return exit code two to block actions and show errors to Claude. Cannot proceed until workflow requirements are met.

[SECTION:grounding]
[HIGHLIGHT:#grounding h2]
Research grounding. Current documentation, not stale training data.

[HIGHLIGHT:.grounding-tools]
Two MCP tools provide live research. Context7 for library documentation. WebSearch for official API docs.

[HIGHLIGHT:.grounding-example]
The enforce-research hook blocks all Write and Edit operations until research is complete. No documentation equals no implementation.

This isn't about slowing down. It's about getting it right the first time.

[SECTION:hooks]
[HIGHLIGHT:#hooks h2]
Workflow enforcement. The problem: AI can skip steps. The solution: hooks that block progress.

[HIGHLIGHT:.hook-types]
Eighteen Python hooks intercept Claude's actions. PreToolUse hooks run before file writes. PostToolUse hooks run after tool execution. Stop hooks run when Claude tries to end.

[HIGHLIGHT:.exit-code-callout]
Exit code two is the magic. When a hook returns exit code two, it blocks the action AND sends an error message to Claude. Claude sees the error and must respond. It cannot ignore it.

[HIGHLIGHT:.exit-code-demo]
Example: Claude tries to write route.ts. The enforce-research hook blocks with exit code two. Claude sees: Research required before implementation. Current phase incomplete. Required actions: Use Context7, use WebSearch, document findings.

Claude must fix the issue before continuing.

[SECTION:phases]
[HIGHLIGHT:#phases h2]
The twelve phases. Each phase must complete before proceeding.

[HIGHLIGHT:.phase-card:nth-child(1)]
Phase zero: Disambiguation. When you say Vercel AI, do you mean the SDK or the Gateway? We clarify before researching.

[HIGHLIGHT:.phase-card:nth-child(2)]
Phase one: Scope confirmation. Confirm understanding of what the endpoint should do.

[HIGHLIGHT:.phase-card:nth-child(3)]
Phase two: Initial research. Fetch documentation via Context7 or WebSearch.

[HIGHLIGHT:.phase-card:nth-child(4)]
Phase three: Interview. Questions generated FROM research findings. Not generic templates.

[HIGHLIGHT:.phase-card:nth-child(5)]
Phase four: Deep research. Based on your answers, propose targeted follow-up searches.

[HIGHLIGHT:.phase-card:nth-child(6)]
Phase five: Schema. Define Zod schemas based on research plus interview decisions.

[HIGHLIGHT:.phase-card:nth-child(7)]
Phase six: Environment. Verify API keys exist before writing code.

[HIGHLIGHT:.phase-card:nth-child(8)]
Phase seven: TDD Red. Write failing tests. Define success before implementation.

[HIGHLIGHT:.phase-card:nth-child(9)]
Phase eight: TDD Green. Minimal code to pass tests.

[HIGHLIGHT:.phase-card:nth-child(10)]
Phase nine: Verify. Re-read original documentation and compare to implementation.

[HIGHLIGHT:.phase-card:nth-child(11)]
Phase ten: Refactor. Clean up code while tests stay green.

[HIGHLIGHT:.phase-card:nth-child(12)]
Phase eleven: Documentation. Update OpenAPI spec and test manifest.

Every phase can loop back. If verification finds gaps, we return to Red and write tests for missing features.

[SECTION:demo]
[HIGHLIGHT:#demo h2]
See it in action. Watch the interactive workflow demo.

[HIGHLIGHT:.demo-terminal]
The demo shows a real example: creating a Brandfetch API endpoint.

[HIGHLIGHT:.demo-controls]
Use the auto-play button to watch the full workflow. Or step through manually with Next and Previous.

[HIGHLIGHT:.phase-progress-bar]
Watch the progress bar fill as each phase completes. The explanation panel shows what's happening at each step.

[HIGHLIGHT:.demo-explanation]
Every action is explained. When hooks block, you'll see exactly why and what's required to continue.

Click auto-play to watch Claude build an API from research to completion.

[SECTION:state]
[HIGHLIGHT:#state h2]
Persistent memory. Two problems with AI memory. Two solutions built into state tracking.

[HIGHLIGHT:.state-highlight-box:nth-child(1)]
Problem: Self-answering. The AI asks a question then immediately answers itself. Solution: phase_exit_confirmed. State tracking detects when Claude asks an exit question AND the user responds affirmatively.

[HIGHLIGHT:.state-highlight-box:nth-child(2)]
Problem: Context dilution. Early decisions fade from context. Solution: Periodic re-grounding. Every seven turns, periodic-reground.py injects a context reminder with current phase, interview decisions, and turn count.

[HIGHLIGHT:.state-code]
Everything is tracked in a JSON state file. Phases, interview decisions, files created, turn count. Hooks check this state before allowing operations.

Your decisions are actively re-injected into context. Claude never forgets what you agreed on.

[SECTION:install]
[HIGHLIGHT:#install h2]
Get started. Built specifically for Claude Code. Install in under sixty seconds.

[HIGHLIGHT:.install-command]
npx @hustle-together/api-dev-tools. That's the command.

[HIGHLIGHT:.claude-features]
The CLI installs eighteen enforcement hooks, twenty-four slash commands, and templates into your .claude directory. Works with any existing Claude Code project.

[HIGHLIGHT:.install-links]
Find the project on GitHub and npm. Star the repo, report issues, contribute improvements.

API Dev Tools version one. Twelve phases. Loop-back architecture. Continuous verification.

Research first. Questions from findings. Verify after green. Document always.

Hustle together. Build stronger.
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
    console.error('Usage: ELEVENLABS_API_KEY=your_key node generate-narration.js [voice]');
    process.exit(1);
  }

  console.log(`\n=== Generating narration with ${selectedVoice.name} (${VOICE_NAME}) ===\n`);

  const outputDir = __dirname;
  const audioPath = path.join(outputDir, `narration-${VOICE_NAME}.mp3`);
  const timingPath = path.join(outputDir, `narration-${VOICE_NAME}-timing.json`);

  // Extract plain text for TTS
  const plainText = extractPlainText(NARRATION_SCRIPT);
  console.log('Plain text extracted:', plainText.substring(0, 200) + '...');

  // Parse markers from script
  const markers = parseMarkers(NARRATION_SCRIPT);
  console.log(`Found ${markers.length} markers`);

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
    const timedMarkers = matchMarkersToTimestamps(markers, wordTimestamps, plainText);

    // Calculate duration
    const lastWord = wordTimestamps[wordTimestamps.length - 1];
    const duration = lastWord ? lastWord.end : 0;

    // Build timing data
    const timingData = {
      generated: new Date().toISOString(),
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
    console.log(`Timing data saved to: ${timingPath}`);

    console.log('\n=== Summary ===');
    console.log(`Duration: ${duration.toFixed(1)} seconds`);
    console.log(`Sections: ${timingData.sections.length}`);
    console.log(`Highlights: ${timingData.highlights.length}`);
    console.log(`Words: ${timingData.words.length}`);

    console.log('\n=== Section Timestamps ===');
    for (const section of timingData.sections) {
      const mins = Math.floor(section.timestamp / 60);
      const secs = (section.timestamp % 60).toFixed(1);
      console.log(`  ${section.id}: ${mins}:${secs.padStart(4, '0')}`);
    }

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
