import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

const UI_SFX = require('../../../assets/sounds/ui-confirm.wav');

const THROTTLE_MS = 200;
let lastPlayAt = 0;
let loadingPromise: Promise<AudioPlayer | null> | null = null;

async function getPlayer(): Promise<AudioPlayer | null> {
  if (!loadingPromise) {
    loadingPromise = (async () => {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          interruptionMode: 'duckOthers',
          allowsRecording: false,
          shouldPlayInBackground: false,
          shouldRouteThroughEarpiece: false,
        });
        const player = createAudioPlayer(UI_SFX, { downloadFirst: true });
        player.volume = 0.6;
        return player;
      } catch (e) {
        if (__DEV__) {
          console.warn('[SFX] load failed:', e);
        }
        return null;
      }
    })();
  }
  return loadingPromise;
}

/** Krótki dźwięk UI — best-effort, nie rzuca błędów na zewnątrz. */
export async function playUiSfx(): Promise<void> {
  const now = Date.now();
  if (now - lastPlayAt < THROTTLE_MS) return;

  try {
    const player = await getPlayer();
    if (!player) return;

    lastPlayAt = now;
    await player.seekTo(0);
    player.play();
  } catch (e) {
    if (__DEV__) {
      console.warn('[SFX] play failed:', e);
    }
  }
}
