/**
 * Audio Sync Controller for Workflow Demo
 *
 * This module syncs audio narration with GSAP animations.
 * It uses word-level timestamps to trigger highlights at the right moment.
 *
 * Usage:
 *   const sync = new AudioSyncController('audio/narration.mp3', 'audio/narration-timing.json');
 *   await sync.init();
 *   sync.play();
 */

class AudioSyncController {
  constructor(audioUrl, timingUrl) {
    this.audioUrl = audioUrl;
    this.timingUrl = timingUrl;
    this.audio = null;
    this.timing = null;
    this.currentSection = null;
    this.highlightedElements = new Set();
    this.isPlaying = false;
    this.onSectionChange = null;
    this.onHighlight = null;
    this.onWordSpoken = null;
  }

  /**
   * Initialize the controller by loading audio and timing data
   */
  async init() {
    // Load timing data
    const response = await fetch(this.timingUrl);
    this.timing = await response.json();

    // Create audio element
    this.audio = new Audio(this.audioUrl);
    this.audio.preload = 'auto';

    // Set up event listeners
    this.audio.addEventListener('timeupdate', () => this.onTimeUpdate());
    this.audio.addEventListener('ended', () => this.onEnded());
    this.audio.addEventListener('play', () => { this.isPlaying = true; });
    this.audio.addEventListener('pause', () => { this.isPlaying = false; });

    // Wait for audio to be ready
    return new Promise((resolve, reject) => {
      this.audio.addEventListener('canplaythrough', () => resolve(), { once: true });
      this.audio.addEventListener('error', (e) => reject(e), { once: true });
    });
  }

  /**
   * Get the current playback time
   */
  get currentTime() {
    return this.audio ? this.audio.currentTime : 0;
  }

  /**
   * Get the total duration
   */
  get duration() {
    return this.audio ? this.audio.duration : 0;
  }

  /**
   * Play the audio
   */
  play() {
    if (this.audio) {
      this.audio.play();
    }
  }

  /**
   * Pause the audio
   */
  pause() {
    if (this.audio) {
      this.audio.pause();
    }
  }

  /**
   * Toggle play/pause
   */
  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  /**
   * Seek to a specific time
   */
  seek(time) {
    if (this.audio) {
      this.audio.currentTime = time;
    }
  }

  /**
   * Seek to a specific section
   */
  seekToSection(sectionId) {
    const section = this.timing.sections.find(s => s.id === sectionId);
    if (section) {
      this.seek(section.timestamp);
    }
  }

  /**
   * Handle time updates from the audio element
   */
  onTimeUpdate() {
    const currentTime = this.audio.currentTime;

    // Check for section changes
    const newSection = this.getCurrentSection(currentTime);
    if (newSection !== this.currentSection) {
      this.currentSection = newSection;
      this.clearHighlights();
      if (this.onSectionChange) {
        this.onSectionChange(newSection);
      }
      // Scroll to section
      this.scrollToSection(newSection);
    }

    // Check for highlights that should be active
    this.updateHighlights(currentTime);

    // Check for words being spoken
    if (this.onWordSpoken) {
      const currentWord = this.getCurrentWord(currentTime);
      if (currentWord) {
        this.onWordSpoken(currentWord);
      }
    }
  }

  /**
   * Get the current section based on time
   */
  getCurrentSection(time) {
    let current = null;
    for (const section of this.timing.sections) {
      if (section.timestamp <= time) {
        current = section.id;
      } else {
        break;
      }
    }
    return current;
  }

  /**
   * Get the current word being spoken
   */
  getCurrentWord(time) {
    for (const word of this.timing.words) {
      if (time >= word.start && time <= word.end) {
        return word;
      }
    }
    return null;
  }

  /**
   * Update highlights based on current time
   */
  updateHighlights(time) {
    // Get highlights that should be active (within 3 seconds of their timestamp)
    const HIGHLIGHT_DURATION = 3; // seconds

    for (const highlight of this.timing.highlights) {
      const isActive = time >= highlight.timestamp &&
                       time < highlight.timestamp + HIGHLIGHT_DURATION;

      const wasHighlighted = this.highlightedElements.has(highlight.selector);

      if (isActive && !wasHighlighted) {
        // Add highlight
        this.applyHighlight(highlight.selector);
        this.highlightedElements.add(highlight.selector);
        if (this.onHighlight) {
          this.onHighlight(highlight.selector, true);
        }
      } else if (!isActive && wasHighlighted) {
        // Remove highlight
        this.removeHighlight(highlight.selector);
        this.highlightedElements.delete(highlight.selector);
        if (this.onHighlight) {
          this.onHighlight(highlight.selector, false);
        }
      }
    }
  }

  /**
   * Apply highlight animation to an element
   */
  applyHighlight(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      // Add highlight class
      el.classList.add('audio-highlighted');

      // Use GSAP for smooth animation if available
      if (typeof gsap !== 'undefined') {
        gsap.to(el, {
          boxShadow: '0 0 30px var(--accent-red-glow), 0 0 60px var(--accent-red-glow)',
          borderColor: 'var(--accent-red)',
          scale: 1.02,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    });
  }

  /**
   * Remove highlight from an element
   */
  removeHighlight(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      el.classList.remove('audio-highlighted');

      if (typeof gsap !== 'undefined') {
        gsap.to(el, {
          boxShadow: 'none',
          borderColor: 'var(--grey)',
          scale: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    });
  }

  /**
   * Clear all highlights
   */
  clearHighlights() {
    for (const selector of this.highlightedElements) {
      this.removeHighlight(selector);
    }
    this.highlightedElements.clear();
  }

  /**
   * Scroll to a section
   */
  scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /**
   * Handle audio ended
   */
  onEnded() {
    this.isPlaying = false;
    this.clearHighlights();
    if (this.onSectionChange) {
      this.onSectionChange(null);
    }
  }

  /**
   * Get all section timestamps for building a progress bar
   */
  getSectionMarkers() {
    return this.timing.sections.map(s => ({
      id: s.id,
      timestamp: s.timestamp,
      percentage: (s.timestamp / this.duration) * 100
    }));
  }
}

// Export for use in browser
if (typeof window !== 'undefined') {
  window.AudioSyncController = AudioSyncController;
}

// Export for Node.js (if needed for testing)
if (typeof module !== 'undefined') {
  module.exports = AudioSyncController;
}
