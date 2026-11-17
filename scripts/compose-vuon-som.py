"""Render the game's original 16-bar instrumental loop with NumPy and FFmpeg."""

from pathlib import Path
from math import ceil
from subprocess import run
import wave
import numpy as np


ROOT = Path(__file__).resolve().parents[1]
RATE, BEAT = 44100, 60 / 72
CHORDS = [
    (50, 57, 64), (47, 54, 62), (43, 50, 57), (45, 52, 59),
    (50, 57, 66), (47, 54, 62), (43, 55, 62), (45, 52, 64),
    (43, 50, 62), (45, 52, 64), (47, 54, 66), (50, 57, 64),
    (43, 50, 62), (45, 52, 62), (45, 52, 59), (50, 57, 64),
]
MELODY = [
    ((.5, 69), (2, 66), (3.25, 64)), ((1, 62), (2.5, 66)),
    ((0, 67), (1.5, 69), (3, 71)), ((.5, 69), (2, 64)),
    ((0, 66), (1.5, 69), (2.5, 74)), ((.5, 73), (2, 69), (3, 66)),
    ((.5, 67), (2, 66)), ((0, 64), (2, 62)),
    ((1, 71), (2, 74), (3.25, 76)), ((.5, 73), (2, 69)),
    ((0, 66), (1.5, 69), (3, 71)), ((.5, 69), (2, 66)),
    ((0, 67), (2, 71)), ((1, 69), (2.5, 67)),
    ((0, 64), (1.5, 66), (3, 69)), ((0, 62), (2, 64)),
]


def tone(note, seconds, kind):
    t = np.arange(ceil(seconds * RATE)) / RATE
    f = 440 * 2 ** ((note - 69) / 12)
    phase = 2 * np.pi * f * t
    if kind == "pad":
        envelope = np.sin(np.pi * np.minimum(t / seconds, 1)) ** 1.6
        return envelope * (.84 * np.sin(phase) + .16 * np.sin(phase * 2.003))
    attack = 1 - np.exp(-t / .018)
    decay = np.exp(-t / (.55 if kind == "lead" else .78))
    release = np.clip((seconds - t) / .24, 0, 1)
    harmonics = np.sin(phase) + .28 * np.sin(phase * 2.001) * np.exp(-t / .34)
    harmonics += .11 * np.sin(phase * 3.008) * np.exp(-t / .13)
    return attack * decay * release * harmonics


def main():
    samples = round(len(CHORDS) * 4 * BEAT * RATE)
    mix = np.zeros((samples, 2))

    def play(note, beat, seconds, kind, level, pan):
        signal = tone(note, seconds, kind) * level
        index = (round(beat * BEAT * RATE) + np.arange(len(signal))) % samples
        mix[index] += signal[:, None] * np.array([1 - pan, pan])

    for bar, ((root, fifth, colour), melody) in enumerate(zip(CHORDS, MELODY)):
        start = bar * 4
        play(root, start, 3.15, "pluck", .26, .48)
        play(fifth, start + .75, 2, "pluck", .105, .34)
        play(colour, start + 1.75, 2, "pluck", .118, .62)
        play(fifth + 12, start + 3.35, 1.6, "pluck", .072, .41)
        play(root + 12, start - .25, 4.05, "pad", .073, .64)
        play(fifth, start - .15, 4.0, "pad", .049, .24)
        for step, note in melody:
            play(note, start + step, 2.3, "lead", .18, .53)

    dry = mix.copy()
    for delay, level in ((.11, .085), (.18, .07), (.29, .036), (.39, .024)):
        mix += np.roll(dry[:, ::-1], round(delay * RATE), axis=0) * level
    mix *= .63 / np.max(np.abs(mix))
    pcm = (mix * 32767).astype("<i2")
    destination = ROOT / "public/audio"
    destination.mkdir(parents=True, exist_ok=True)
    wav = destination / "vuon-som.wav"
    with wave.open(str(wav), "wb") as handle:
        handle.setparams((2, 2, RATE, samples, "NONE", "not compressed"))
        handle.writeframes(pcm.tobytes())
    try:
        run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(wav), "-codec:a", "libmp3lame",
             "-b:a", "80k", "-metadata", "title=Vuon Som", str(destination / "vuon-som.mp3")], check=True)
    finally:
        wav.unlink()


if __name__ == "__main__":
    main()
