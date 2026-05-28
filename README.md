# EarBud (Sandbox Edition) 🎤📊

EarBud is a real-time, browser-based vocal note detector and frequency visualizer designed to act as a visual companion for your ears. 

> ⚠️ **Note:** This is an intentional **naive version** of the application. It was built as an educational playground to explore the physics of sound, analyze how the Fourier Transform maps audio, and visualize the relationship between raw frequencies and human pitch perception.

---

## 🎯 Project Purpose

The primary goal of EarBud is learning and experimentation. Rather than jumping straight into complex, black-box pitch detection libraries, this version implements a raw, fundamental approach to audio processing. It serves as a visual sandbox to understand:
1. How digital audio is sliced into mathematical frequency bins.
2. The massive difference between a **linear scale** (how computers see sound) and a **logarithmic scale** (how humans hear sound).
3. Why tracking a human voice is incredibly challenging due to natural vocal acoustics (harmonics and overtones).

---

## 🚀 Features

* **Live Microphone Pitch Analysis:** Captures and analyzes real-time user audio without audio playback feedback loop issues.
* **Logarithmic Visualizer Canvas:** Stretches and compresses frequency bins so that the physical screen distance between octaves remains perfectly uniform.
* **Chromatic Note Legend:** A dynamic, color-coded reference bar mapping the 12 semi-tones of the chromatic scale directly to the visualizer bars.
* **Target Note Anchors:** Permanent visual background markers (`🎯 A2` to `🎯 A5`) anchored to standard instrument tuning pitches (like $A_4 = 440\text{ Hz}$).
* **Smart Noise Thresholding:** Filters out low-volume ambient background static to prevent the UI from flickering when you aren't singing.

---

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3 (Flexbox & Responsive Layouts)
* **Audio Processing:** Web Audio API (`AudioContext`, `AnalyserNode`, `MediaStreamAudioSourceNode`)
* **Graphics:** HTML5 Canvas API (Real-time render loop via `requestAnimationFrame`)
* **Languages:** JavaScript (ES6 Modules)

---

## 📂 Project Structure

```text
├── index.html        # Main application structure & control layout
├── style.css         # Application styling, dark theme, and canvas layout
├── main.js          # Core audio routing, canvas animation loop, and UI logic
└── utils.js         # Mathematical utility algorithms (frequency-to-note mapping)