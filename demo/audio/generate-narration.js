#!/usr/bin/env node
/**
 * Generate narration audio with word-level timestamps using ElevenLabs API
 *
 * Usage: ELEVENLABS_API_KEY=your_key node generate-narration.js
 *
 * Output:
 *   - narration.mp3 - The audio file
 *   - narration-timing.json - Word timestamps with highlight triggers
 */

const fs = require('fs');
const path = require('path');

// ElevenLabs API configuration
const API_BASE = 'https://api.elevenlabs.io/v1';
const VOICE_ID = 'pNInz6obpgDQGcFmaJgB'; // Adam - deep, professional voice
const MODEL_ID = 'eleven_turbo_v2_5'; // Fast, high-quality model

// The narration script with section markers and highlight triggers
// Format: [SECTION:id] marks a new section, [HIGHLIGHT:element-selector] marks what to highlight
const NARRATION_SCRIPT = `
[SECTION:intro]
Welcome to Hustle API Dev Tools.

[HIGHLIGHT:#hustleBrand]
This package enforces a structured workflow for AI-assisted API development.

[HIGHLIGHT:[data-phase="research"]]
First, you research. No assumptions. No training data. Real documentation.

[HIGHLIGHT:[data-phase="interview"]]
Then you interview. The AI asks YOU questions with structured options based on what it learned.

[HIGHLIGHT:[data-phase="test"]]
Next, you write tests first. Red, green, refactor. No implementation without a failing test.

[HIGHLIGHT:[data-phase="code"]]
Only then do you write code. Minimal. Just enough to pass the tests.

[HIGHLIGHT:[data-phase="docs"]]
Finally, documentation. Every endpoint documented with real examples and schemas.

The philosophy is simple: Hustle together. Share resources. Build stronger.

[SECTION:problems]
[HIGHLIGHT:#problems h2]
Let's talk about the problem. What goes wrong when AI builds APIs without structure?

[HIGHLIGHT:.gap-item:nth-child(1)]
Gap one: AI doesn't use your exact words. You say Vercel AI Gateway but it searches for Vercel AI SDK. Wrong library. Wrong documentation. Wrong code.

[HIGHLIGHT:.gap-item:nth-child(2)]
Gap two: AI claims files are updated without proof. It says I've updated the file but there's no git diff. No verification. You're trusting on faith.

[HIGHLIGHT:.gap-item:nth-child(3)]
Gap three: Skipped tests are accepted. The AI runs tests, some fail, and it moves on. We can fix those later. Those later fixes never come.

[HIGHLIGHT:.gap-item:nth-child(4)]
Gap four: Tasks marked complete without verification. The AI says Done but the feature doesn't work. No one actually checked.

[HIGHLIGHT:.gap-item:nth-child(5)]
Gap five: Environment variable mismatch. Tests pass locally but fail in production. The AI used different values than what's actually deployed.

These gaps compound. One wrong assumption leads to another. By the time you notice, you've built on a broken foundation.

[SECTION:solution]
[HIGHLIGHT:#solution h2]
The solution is enforcement. Python hooks that intercept every tool call.

[HIGHLIGHT:.hook-box:nth-child(1)]
PreToolUse hooks run before Claude can write or edit any file. They check: Did you research first? Did you interview the user? Did you write a failing test?

[HIGHLIGHT:.hook-box:nth-child(2)]
PostToolUse hooks run after research and interviews. They track what was learned. They log every query. They build a paper trail.

[HIGHLIGHT:.hook-box:nth-child(3)]
The Stop hook runs when Claude tries to mark a task complete. It checks: Are all phases done? Did tests pass? Is documentation updated? If not, blocked.

This isn't about limiting AI. It's about holding it to the same standards we hold ourselves.

[SECTION:workflow]
[HIGHLIGHT:#workflow h2]
The workflow has ten phases. Let's walk through each one.

[HIGHLIGHT:.workflow-phase:nth-child(1)]
Phase one: Scope. Define what you're building. What's the endpoint? What does it do?

[HIGHLIGHT:.workflow-phase:nth-child(2)]
Phase two: Initial research. Use Context7 or web search. Find the real documentation. No guessing.

[HIGHLIGHT:.workflow-phase:nth-child(3)]
Phase three: Interview. Ask the user questions with multiple choice options. What provider? What format? What error handling?

[HIGHLIGHT:.workflow-phase:nth-child(4)]
Phase four: Deep research. Based on interview answers, research specific APIs and SDKs.

[HIGHLIGHT:.workflow-phase:nth-child(5)]
Phase five: Schema design. Define request and response schemas with Zod. Types before code.

[HIGHLIGHT:.workflow-phase:nth-child(6)]
Phase six: Environment setup. Check API keys. Verify environment variables. Test connectivity.

[HIGHLIGHT:.workflow-phase:nth-child(7)]
Phase seven: Red. Write a failing test. Define what success looks like before writing any implementation.

[HIGHLIGHT:.workflow-phase:nth-child(8)]
Phase eight: Green. Write minimal code to pass the test. No extra features. No premature optimization.

[HIGHLIGHT:.workflow-phase:nth-child(9)]
Phase nine: Refactor. Clean up the code. Extract utilities. Improve readability. Tests stay green.

[HIGHLIGHT:.workflow-phase:nth-child(10)]
Phase ten: Documentation. Update OpenAPI spec. Add to test manifest. Include real examples.

Only when all ten phases are complete can the workflow finish.

[SECTION:installation]
[HIGHLIGHT:#installation h2]
Installation takes one command.

[HIGHLIGHT:.install-command]
Run npx @hustle-together/api-dev-tools. That's it.

The CLI copies slash commands to your .claude/commands folder. Red, green, refactor, cycle, and the API development commands.

It copies Python hooks to .claude/hooks. These are the enforcers. The gatekeepers.

It merges settings into your settings.json. Hooks are registered. Permissions are configured.

And it offers to add the Context7 MCP server for live documentation lookup.

Your project is now enforced. Every API you build follows the workflow.

[SECTION:credits]
[HIGHLIGHT:#credits h2]
This project builds on the work of others.

The TDD workflow commands are based on @wbern/claude-instructions by William Bernmalm. The red, green, refactor pattern that makes AI development rigorous.

The interview methodology is inspired by Anthropic's Interviewer approach. Structured discovery before implementation.

And Context7 provides live documentation lookup. Current docs, not stale training data.

Thank you to the Claude Code community. Together, we're making AI development better.

[SECTION:outro]
[HIGHLIGHT:#intro]
Hustle API Dev Tools. Research first. Interview second. Test before code. Document everything.

Build together. Share resources. Grow stronger.

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
    const highlightMatch = line.match(/\[HIGHLIGHT:([^\]]+)\]/);
    if (highlightMatch) {
      markers.push({
        type: 'highlight',
        selector: highlightMatch[1],
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
    console.error('Usage: ELEVENLABS_API_KEY=your_key node generate-narration.js');
    process.exit(1);
  }

  const outputDir = __dirname;
  const audioPath = path.join(outputDir, 'narration.mp3');
  const timingPath = path.join(outputDir, 'narration-timing.json');

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
