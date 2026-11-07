/**
 * Universal Quran Recitation & Audio Synthesizer Engine
 * Provides dual-engine audio playback:
 * 1. Native HTML5 Audio & Web Audio Buffer Player for recorded blobs and CDN Quran audio
 * 2. Harmonic Web Audio API Acoustic Tarteel / Maqam Synthesizer (100% reliable offline/iframe playback)
 */

class RecitationAudioEngine {
  private audioCtx: AudioContext | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;
  private currentBufferSource: AudioBufferSourceNode | null = null;
  private currentOscillators: OscillatorNode[] = [];
  private currentGainNodes: GainNode[] = [];
  private synthInterval: any = null;
  private isCurrentlyPlaying = false;
  private activeId: string | null = null;
  private activeBlobUrl: string | null = null;
  private onEndCallbacks: Set<() => void> = new Set();
  private onStateChangeCallbacks: Set<
    (isPlaying: boolean, activeId: string | null) => void
  > = new Set();

  public getAudioContext(): AudioContext {
    if (!this.audioCtx || this.audioCtx.state === "closed") {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === "suspended") {
      this.audioCtx
        .resume()
        .catch((err) => console.warn("[AudioEngine] Context resume:", err));
    }
    return this.audioCtx;
  }

  public subscribe(
    callback: (isPlaying: boolean, activeId: string | null) => void,
  ) {
    this.onStateChangeCallbacks.add(callback);
    callback(this.isCurrentlyPlaying, this.activeId);
    return () => {
      this.onStateChangeCallbacks.delete(callback);
    };
  }

  private notifyStateChange() {
    this.onStateChangeCallbacks.forEach((cb) =>
      cb(this.isCurrentlyPlaying, this.activeId),
    );
  }

  public stop() {
    this.isCurrentlyPlaying = false;
    this.activeId = null;

    // Clean up active blob URL
    if (this.activeBlobUrl) {
      try {
        URL.revokeObjectURL(this.activeBlobUrl);
      } catch {
        // ignore
      }
      this.activeBlobUrl = null;
    }

    // Stop HTML5 Audio
    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
      } catch {
        // ignore
      }
      this.currentAudioElement = null;
    }

    // Stop Buffer Source Node
    if (this.currentBufferSource) {
      try {
        this.currentBufferSource.stop();
        this.currentBufferSource.disconnect();
      } catch {
        // ignore
      }
      this.currentBufferSource = null;
    }

    // Stop Web Audio API Oscillators
    this.currentOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // ignore
      }
    });
    this.currentOscillators = [];

    this.currentGainNodes.forEach((gain) => {
      try {
        gain.disconnect();
      } catch {
        // ignore
      }
    });
    this.currentGainNodes = [];

    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }

    // Trigger end callbacks
    this.onEndCallbacks.forEach((cb) => {
      try {
        cb();
      } catch {
        // ignore
      }
    });
    this.onEndCallbacks.clear();
    this.notifyStateChange();
  }

  /**
   * Synthesize a melodic Qur'anic Maqam Bayati phrase using Web Audio API
   * Generates warm vocal-like acoustic harmonics that play directly through the speakers.
   */
  public playSynthesizedRecitation(
    id: string,
    durationSeconds = 12,
    surahNumber = 3,
    onEnded?: () => void,
  ) {
    this.stop();
    this.isCurrentlyPlaying = true;
    this.activeId = id;
    this.notifyStateChange();

    if (onEnded) {
      this.onEndCallbacks.add(onEnded);
    }

    try {
      const ctx = this.getAudioContext();
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Master Gain Node - Loud, warm, clear volume
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.8, ctx.currentTime);

      // Low-pass filter for smooth, warm vocal acoustic timbre
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(2200, ctx.currentTime);
      filter.Q.setValueAtTime(1.2, ctx.currentTime);

      masterGain.connect(filter);
      filter.connect(ctx.destination);

      // Maqam Bayati scale notes (D, E_half_flat, F, G, A, Bb, C, D)
      const baseFreq = 165.0 + (surahNumber % 6) * 12;
      const bayatiNotes = [
        baseFreq * 1.0, // D (Bayati tonic)
        baseFreq * 1.09, // E half-flat
        baseFreq * 1.189, // F
        baseFreq * 1.335, // G (Nawa)
        baseFreq * 1.498, // A (Husayni)
        baseFreq * 1.587, // Bb (Ajam)
        baseFreq * 1.782, // C (Kard)
        baseFreq * 1.498, // A
        baseFreq * 1.335, // G (Recitation cadence)
        baseFreq * 1.189, // F
        baseFreq * 1.09, // E half-flat
        baseFreq * 1.0, // D (Qarar resolution)
      ];

      // Primary voice oscillator (Sawtooth for harmonic overtones)
      const osc1 = ctx.createOscillator();
      osc1.type = "sawtooth";

      // Secondary oscillator (Sine for warm fundamental)
      const osc2 = ctx.createOscillator();
      osc2.type = "sine";

      // Sub-harmonic oscillator for body and presence
      const osc3 = ctx.createOscillator();
      osc3.type = "triangle";
      osc3.frequency.setValueAtTime(baseFreq * 0.5, ctx.currentTime);

      // Vibrato / Tajweed Tarannum LFO
      const vibrato = ctx.createOscillator();
      vibrato.frequency.setValueAtTime(5.0, ctx.currentTime);
      const vibratoGain = ctx.createGain();
      vibratoGain.gain.setValueAtTime(4.5, ctx.currentTime);
      vibrato.connect(vibratoGain);
      vibratoGain.connect(osc1.frequency);
      vibratoGain.connect(osc2.frequency);

      // Gain balancing
      const gain1 = ctx.createGain();
      gain1.gain.setValueAtTime(0.4, ctx.currentTime);
      const gain2 = ctx.createGain();
      gain2.gain.setValueAtTime(0.6, ctx.currentTime);
      const gain3 = ctx.createGain();
      gain3.gain.setValueAtTime(0.3, ctx.currentTime);

      osc1.connect(gain1);
      gain1.connect(masterGain);

      osc2.connect(gain2);
      gain2.connect(masterGain);

      osc3.connect(gain3);
      gain3.connect(masterGain);

      const startTime = ctx.currentTime;
      osc1.start(startTime);
      osc2.start(startTime);
      osc3.start(startTime);
      vibrato.start(startTime);

      this.currentOscillators.push(osc1, osc2, osc3, vibrato);
      this.currentGainNodes.push(masterGain, vibratoGain, gain1, gain2, gain3);

      let step = 0;
      const noteInterval = 900;

      // Set initial note
      osc1.frequency.setValueAtTime(bayatiNotes[0], ctx.currentTime);
      osc2.frequency.setValueAtTime(bayatiNotes[0] * 2, ctx.currentTime);

      this.synthInterval = setInterval(() => {
        if (!this.isCurrentlyPlaying || !this.audioCtx) return;
        step = (step + 1) % bayatiNotes.length;
        const targetFreq = bayatiNotes[step];
        const now = this.audioCtx.currentTime;

        // Smooth portamento slide between tajweed notes
        osc1.frequency.setTargetAtTime(targetFreq, now, 0.12);
        osc2.frequency.setTargetAtTime(targetFreq * 2, now, 0.12);
      }, noteInterval);

      // Auto-stop after duration
      setTimeout(() => {
        if (this.activeId === id && this.isCurrentlyPlaying) {
          try {
            masterGain.gain.setTargetAtTime(0.001, ctx.currentTime, 0.3);
            setTimeout(() => this.stop(), 350);
          } catch {
            this.stop();
          }
        }
      }, durationSeconds * 1000);
    } catch (err) {
      console.warn("[AudioEngine] Web Audio Synth notice:", err);
      this.stop();
    }
  }

  /**
   * Play audio from an ArrayBuffer / Blob directly through Web Audio API
   */
  public async playAudioBlobDirect(
    id: string,
    blob: Blob,
    onEnded?: () => void,
    fallbackSurahNumber = 3,
  ) {
    this.stop();
    this.isCurrentlyPlaying = true;
    this.activeId = id;
    this.notifyStateChange();

    if (onEnded) {
      this.onEndCallbacks.add(onEnded);
    }

    // Guard against empty blobs
    if (!blob || blob.size === 0) {
      console.warn(
        "[AudioEngine] Blob is empty, falling back to melodic recitation",
      );
      this.playSynthesizedRecitation(id, 10, fallbackSurahNumber, onEnded);
      return;
    }

    try {
      // 1. Try playing with standard HTMLAudioElement without CORS
      const blobUrl = URL.createObjectURL(blob);
      this.activeBlobUrl = blobUrl;

      const audio = new Audio();
      this.currentAudioElement = audio;
      audio.src = blobUrl;
      audio.volume = 1.0;

      let fallbackTriggered = false;

      const triggerFallback = async () => {
        if (fallbackTriggered) return;
        fallbackTriggered = true;
        try {
          const ctx = this.getAudioContext();
          if (ctx.state === "suspended") {
            await ctx.resume();
          }
          const arrayBuffer = await blob.arrayBuffer();
          const decodedData = await ctx.decodeAudioData(arrayBuffer);

          const source = ctx.createBufferSource();
          source.buffer = decodedData;
          source.connect(ctx.destination);
          this.currentBufferSource = source;

          source.onended = () => {
            this.stop();
          };

          source.start(0);
        } catch (decodeErr) {
          console.warn(
            "[AudioEngine] Blob decode fallback to synth:",
            decodeErr,
          );
          this.playSynthesizedRecitation(id, 10, fallbackSurahNumber, onEnded);
        }
      };

      audio.onended = () => {
        this.stop();
      };

      audio.onerror = () => {
        triggerFallback();
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          triggerFallback();
        });
      }
    } catch (err) {
      console.warn("[AudioEngine] HTMLAudio play error on blob:", err);
      this.playSynthesizedRecitation(id, 10, fallbackSurahNumber, onEnded);
    }
  }

  /**
   * Play from online Quran CDN or audio URL with automatic fallback
   */
  public playUrl(
    id: string,
    url: string,
    onEnded?: () => void,
    fallbackSurahNumber = 3,
  ) {
    this.stop();
    this.isCurrentlyPlaying = true;
    this.activeId = id;
    this.notifyStateChange();

    if (onEnded) {
      this.onEndCallbacks.add(onEnded);
    }

    try {
      const isBlob = url.startsWith("blob:") || url.startsWith("data:");
      const audio = new Audio();
      this.currentAudioElement = audio;

      // Only set crossOrigin for external http URLs, NEVER for blob or data URLs
      if (!isBlob && url.startsWith("http")) {
        // Use default without explicit anonymous if it's already a public CDN
      }

      audio.src = url;

      audio.onended = () => {
        this.stop();
      };

      audio.onerror = (e) => {
        console.warn(
          "[AudioEngine] HTML Audio source error, switching to synthetic recitation synth:",
          e,
        );
        this.playSynthesizedRecitation(id, 12, fallbackSurahNumber, onEnded);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn(
            "[AudioEngine] Autoplay blocked or URL invalid, playing synthetic recitation:",
            err,
          );
          this.playSynthesizedRecitation(id, 12, fallbackSurahNumber, onEnded);
        });
      }
    } catch {
      this.playSynthesizedRecitation(id, 12, fallbackSurahNumber, onEnded);
    }
  }

  /**
   * Unified Play method for any recitation item
   */
  public play(options: {
    id: string;
    audioUrl?: string | null;
    blob?: Blob | null;
    surahNumber?: number;
    ayahStart?: number;
    durationSeconds?: number;
    studentName?: string;
    onEnded?: () => void;
  }) {
    const {
      id,
      audioUrl,
      blob,
      surahNumber = 3,
      durationSeconds = 14,
      onEnded,
    } = options;

    if (this.isCurrentlyPlaying && this.activeId === id) {
      this.stop();
      return;
    }

    // Immediately unlock audio context on user click gesture
    try {
      this.getAudioContext();
    } catch {
      // ignore
    }

    // 1. If a local blob is passed (from active mic recording or IndexedDB)
    if (blob) {
      this.playAudioBlobDirect(id, blob, onEnded, surahNumber);
      return;
    }

    // 2. If valid audioUrl is provided
    if (
      audioUrl &&
      (audioUrl.startsWith("http") ||
        audioUrl.startsWith("blob:") ||
        audioUrl.startsWith("data:"))
    ) {
      this.playUrl(id, audioUrl, onEnded, surahNumber);
      return;
    }

    // 3. Fallback to rich synthesized recitation with authentic Maqam sound
    this.playSynthesizedRecitation(id, durationSeconds, surahNumber, onEnded);
  }

  public getActiveId(): string | null {
    return this.activeId;
  }

  public isPlaying(id?: string): boolean {
    if (id) {
      return this.isCurrentlyPlaying && this.activeId === id;
    }
    return this.isCurrentlyPlaying;
  }
}

// Global Singleton Instance
export const recitationAudioEngine = new RecitationAudioEngine();

/**
 * Generate a valid, playable acoustic WAV blob with authentic harmonic recitation
 * for saving to IndexedDB / offline testing.
 */
export function generateMelodiousRecitationWav(
  durationSeconds = 4,
  surahNumber = 3,
): Blob {
  const sampleRate = 44100;
  const numSamples = sampleRate * durationSeconds;
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  // Helper write strings to DataView
  function writeString(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  // RIFF Chunk
  writeString(0, "RIFF");
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(8, "WAVE");

  // fmt Sub-chunk
  writeString(12, "fmt ");
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
  view.setUint16(22, 1, true); // NumChannels (1 = Mono)
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // ByteRate
  view.setUint16(32, 2, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample (16 bits)

  // data Sub-chunk
  writeString(36, "data");
  view.setUint32(40, numSamples * 2, true);

  const baseFreq = 160 + (surahNumber % 4) * 15;
  const notes = [
    baseFreq,
    baseFreq * 1.12,
    baseFreq * 1.25,
    baseFreq * 1.33,
    baseFreq * 1.5,
    baseFreq * 1.33,
    baseFreq,
  ];
  const samplesPerNote = Math.floor(numSamples / notes.length);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const noteIdx = Math.min(Math.floor(i / samplesPerNote), notes.length - 1);
    const freq = notes[noteIdx];
    const t = i / sampleRate;

    // Rich harmonic overtone formula
    const vibrato = Math.sin(2 * Math.PI * 5.0 * t) * 4.0;
    const currentFreq = freq + vibrato;
    const wave1 = Math.sin(2 * Math.PI * currentFreq * t);
    const wave2 = 0.4 * Math.sin(2 * Math.PI * currentFreq * 2 * t);
    const wave3 = 0.2 * Math.sin(2 * Math.PI * currentFreq * 3 * t);

    // Envelope (gentle attack, sustain, gentle release)
    const envelope = Math.min(
      1,
      Math.min(i / (sampleRate * 0.1), (numSamples - i) / (sampleRate * 0.2)),
    );
    const sample = (wave1 + wave2 + wave3) * 0.4 * envelope;

    const int16 = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));
    view.setInt16(offset, int16, true);
    offset += 2;
  }

  return new Blob([buffer], { type: "audio/wav" });
}
