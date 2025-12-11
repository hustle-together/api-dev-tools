#!/usr/bin/env node
/**
 * Generate individual audio clips for each demo phase using ElevenLabs API
 *
 * This creates separate audio files for each phase, making the demo more
 * responsive and allowing users to jump between phases without audio cutoff issues.
 *
 * Usage: ELEVENLABS_API_KEY=your_key node generate-phase-clips.js
 *
 * Output:
 *   - demo-intro.mp3 - Introduction explaining the demo
 *   - demo-phase-0.mp3 through demo-phase-12.mp3 - Individual phase clips
 *   - demo-clips-manifest.json - Metadata about all clips
 */

const fs = require('fs');
const path = require('path');

// ElevenLabs API configuration
const API_BASE = 'https://api.elevenlabs.io/v1';
const MODEL_ID = 'eleven_turbo_v2_5';

// Use Aidan (male) voice
const VOICE_ID = 'EOVAuWqgSZN2Oel78Psj';
const VOICE_NAME = 'aidan';

// Individual narration scripts for each phase
// These are written from a user-focused, tutorial perspective
const PHASE_SCRIPTS = {
  intro: `
Welcome to the API Dev Tools demo.

In this example, we're building an API endpoint that integrates with Brandfetch - a service that returns brand assets like logos, colors, and fonts for any domain.

Watch the terminal on the left. You'll see exactly what Claude does at each step - and more importantly, what the hooks PREVENT Claude from doing wrong.

This is real enforcement, not suggestions. When you see "Exit code 2", that means the hook blocked Claude's action completely. Claude cannot continue until it fixes the problem.

Tap any phase in the list to jump there, or use the Auto-play button to watch the whole workflow. Let's begin.
`.trim(),

  phase0: `
Phase 0: Disambiguation.

Right now, Claude doesn't know exactly what "Brandfetch" means. Is it the REST API? The npm SDK? Some custom code?

If Claude guesses wrong and starts researching the wrong thing, you'll waste an hour before realizing the mistake.

Watch the terminal. The enforce-disambiguation hook requires Claude to ask YOU which approach you want before doing ANY research. Claude presents numbered options. You pick one. Five seconds of clarification saves an hour of wasted work.
`.trim(),

  phase1: `
Phase 1: Scope Confirmation.

Before Claude spends time researching, it needs to confirm it understands what you want.

Look at the terminal. Claude summarizes the request: "Fetch brand assets by domain. Input: domain name. Output: logos, colors, fonts."

If that's wrong, you correct it now - not after Claude has already built the wrong thing. If it's right, you confirm and move forward.
`.trim(),

  phase2: `
Phase 2: Initial Research.

Claude's training data could be months or years old. APIs change. Endpoints get deprecated.

Watch the MCP calls in the terminal. Context7 finds the Brandfetch library and retrieves the current documentation - 23 endpoints, 47 parameters. That's live data, not memory.

Then WebSearch confirms the authentication method. Two sources, cross-referenced. Now Claude has accurate, current information.
`.trim(),

  phase3: `
Phase 3: Structured Interview.

Notice something important here. Claude isn't asking generic template questions like "what format do you want?"

The questions come FROM the research. Claude discovered SVG, PNG, and JPG are available in the Brandfetch API. So those are the options it presents to you.

You choose "Both SVG and PNG." Claude records this decision. The enforce-interview hook prevents Claude from answering its own questions - it must wait for YOUR input.
`.trim(),

  phase4: `
Phase 4: Deep Research.

Your specific choices might need deeper investigation.

Watch the terminal. Based on your interview answers, Claude proposes targeted follow-up searches. You chose SVG and PNG? Claude searches for "Brandfetch format parameter." You chose 24-hour caching? Claude searches for cache headers.

Your requirements drive the research - not generic exploration.
`.trim(),

  phase5: `
Phase 5: Schema Creation.

Without a contract between tests and implementation, they can drift apart.

Watch Claude create Zod schemas. BrandfetchRequestSchema defines the domain and format fields. BrandfetchResponseSchema defines the logos and colors arrays.

Every parameter from the research is typed. Every choice from your interview is encoded. This schema becomes the source of truth that tests verify and implementation must match.
`.trim(),

  phase6: `
Phase 6: Environment Check.

Ever had tests pass locally but fail in CI because of a missing API key? The enforce-environment hook prevents this.

Watch the terminal. Before writing any tests, Claude checks: Is BRANDFETCH_API_KEY present? Is the format valid?

If the environment isn't ready, the hook blocks test creation. No surprises later.
`.trim(),

  phase7: `
Phase 7: TDD Red.

Without tests, you don't know if your code works. The Red phase means writing failing tests FIRST.

Watch the test output. Four tests, all failing: Returns brand data? Fail. Returns SVG and PNG? Fail. Respects 24-hour cache? Fail. Returns 401 without API key? Fail.

This is correct. We now know exactly what success looks like before writing any implementation code.
`.trim(),

  phase8: `
Phase 8: TDD Green.

Now Claude writes just enough code to pass the tests. Not more.

Watch the test output change. Four tests, all passing. Brand data? Pass. Formats? Pass. Cache? Pass. Error handling? Pass.

But notice what happens automatically - the verify-after-green hook triggers the next phase. No manual intervention needed.
`.trim(),

  phase9: `
Phase 9: Verification.

Even after researching, Claude might implement from memory. It forgets details. It makes assumptions.

Watch Claude re-fetch the documentation and build a verification table. Auth method? Docs say Bearer token. Implementation uses Bearer token. Match.

If there's a mismatch, the workflow loops back - write tests for missing features, re-implement, verify again. Continuous correction until correct.
`.trim(),

  phase10: `
Phase 10: TDD Refactor.

First implementations are often messy. But cleaning up code might break things.

Watch Claude refactor while keeping tests green. Extract a helper? Run tests. Add documentation? Run tests. If anything breaks, you know immediately.

Four tests still passing. Refactor complete.
`.trim(),

  phase11: `
Phase 11: Documentation.

Knowledge gets lost. The next developer - or the next Claude session - starts from scratch.

Watch the terminal. Research findings go into the cache with a 7-day freshness timer. The API manifest gets updated with endpoint details.

Future sessions can skip research if the cache is fresh. Your work today benefits tomorrow's work.
`.trim(),

  phase12: `
Phase 12: Completion.

How do you know everything is actually done?

The api-workflow-check hook verifies all 12 phases completed successfully. Watch the terminal show each phase checking off: Disambiguation, Scope, Research, Interview, all the way through Documentation.

All twelve phases verified. Files created. Tests passing. Documentation updated.

That's the API Dev Tools workflow - research first, questions from findings, test before code, verify after green, document always. Every step enforced by hooks.
`.trim()
};

/**
 * Call ElevenLabs API to generate speech
 */
async function generateSpeech(text, apiKey) {
  const url = `${API_BASE}/text-to-speech/${VOICE_ID}`;

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
    throw new Error(`ElevenLabs API error: ${response.status} - ${error}`);
  }

  return response.arrayBuffer();
}

/**
 * Main function
 */
async function main() {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    console.error('Error: ELEVENLABS_API_KEY environment variable is required');
    console.error('Usage: ELEVENLABS_API_KEY=your_key node generate-phase-clips.js');
    process.exit(1);
  }

  console.log(`\n=== Generating individual phase audio clips ===\n`);

  const outputDir = __dirname;
  const manifest = {
    generated: new Date().toISOString(),
    voice: VOICE_NAME,
    clips: []
  };

  // Generate each clip
  const phases = Object.entries(PHASE_SCRIPTS);
  for (let i = 0; i < phases.length; i++) {
    const [phaseKey, script] = phases[i];

    // Determine filename
    let filename;
    if (phaseKey === 'intro') {
      filename = 'demo-intro.mp3';
    } else {
      const phaseNum = phaseKey.replace('phase', '');
      filename = `demo-phase-${phaseNum}.mp3`;
    }

    const filepath = path.join(outputDir, filename);

    console.log(`[${i + 1}/${phases.length}] Generating ${phaseKey}...`);
    console.log(`  Script length: ${script.length} characters`);

    try {
      const audioBuffer = await generateSpeech(script, apiKey);
      const buffer = Buffer.from(audioBuffer);

      fs.writeFileSync(filepath, buffer);
      console.log(`  Saved: ${filename} (${(buffer.length / 1024).toFixed(1)} KB)`);

      manifest.clips.push({
        phase: phaseKey,
        filename,
        size: buffer.length,
        scriptLength: script.length
      });

      // Small delay to avoid rate limiting
      if (i < phases.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error(`  Error generating ${phaseKey}:`, error.message);
    }
  }

  // Save manifest
  const manifestPath = path.join(outputDir, 'demo-clips-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\nManifest saved: ${manifestPath}`);

  console.log(`\n=== Summary ===`);
  console.log(`Generated ${manifest.clips.length} clips`);
  console.log(`Total size: ${(manifest.clips.reduce((sum, c) => sum + c.size, 0) / 1024 / 1024).toFixed(2)} MB`);
}

main();
