import { getNoteFromFreq } from "./utils.js";

const audioContext = new AudioContext();
const analyserNode = audioContext.createAnalyser();

// Higher FFT size gives better frequency resolution for low notes
analyserNode.fftSize = 4096; 
const bufferLength = analyserNode.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

let stream = null;
let micSource = null;

const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// Distinct colors for each of the 12 chromatic notes so octaves share colors!
const noteColors = [
    "#FF3333", "#FF8033", "#FFAA33", "#FFD433", 
    "#D4FF33", "#33FF33", "#33FFAA", "#33D4FF", 
    "#3355FF", "#8033FF", "#D433FF", "#FF33AA"
];

// DOM Elements
const micButton = document.querySelector(".mic");
const noteDisplay = document.getElementById("note");
const octaveDisplay = document.getElementById("octave");
const canvas = document.getElementById("visualizer");
const canvasCtx = canvas.getContext("2d");

// Handle canvas resizing for crisp displays
function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = 400;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function animate() {
    requestAnimationFrame(animate);

    // Clear Canvas
    canvasCtx.fillStyle = "#1e1e1e";
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

    analyserNode.getByteFrequencyData(dataArray);

    const SAMPLE_RATE = audioContext.sampleRate;
    const BIN_WIDTH = SAMPLE_RATE / analyserNode.fftSize;

    const MIN_FREQ = 60;
    const MAX_FREQ = 1200;

    // Log spacing formula
    const getXCoord = (freq) => {
        const minLog = Math.log10(MIN_FREQ);
        const maxLog = Math.log10(MAX_FREQ);
        const currentLog = Math.log10(freq);
        return ((currentLog - minLog) / (maxLog - minLog)) * canvas.width;
    };

    let loudestBinIndex = 0;
    let maxVal = 0;
    let pointsToDraw = [];

    // --- STEP 1: PRE-DRAW THE "A" NOTE ANCHORS IN THE BACKGROUND ---
    // Standard frequencies for 'A' notes in our visible range
    const aNoteFrequencies = [
        { note: "A2", freq: 110.00 },
        { note: "A3", freq: 220.00 },
        { note: "A4", freq: 440.00 },
        { note: "A5", freq: 880.00 }
    ];

    aNoteFrequencies.forEach(aNote => {
        if (aNote.freq >= MIN_FREQ && aNote.freq <= MAX_FREQ) {
            let aX = getXCoord(aNote.freq);

            // Draw a subtle, dashed grid line behind everything
            canvasCtx.strokeStyle = "rgba(255, 255, 255, 0.15)";
            canvasCtx.lineWidth = 1;
            canvasCtx.setLineDash([5, 5]); // Makes it a dashed line
            canvasCtx.beginPath();
            canvasCtx.moveTo(aX, 0);
            canvasCtx.lineTo(aX, canvas.height - 40);
            canvasCtx.stroke();
            canvasCtx.setLineDash([]); // Reset line dash for other drawings

            // Add an "A" target label at the very top of the graph
            canvasCtx.fillStyle = "#8033FF"; // Purple color assigned to 'A'
            canvasCtx.font = "bold 11px sans-serif";
            canvasCtx.fillText(`🎯 ${aNote.note}`, aX - 15, 15);
        }
    });

    // --- STEP 2: LOOP THROUGH FFT BINS AND PLOT BARS ---
    for (let i = 0; i < bufferLength; i++) {
        let frequency = i * BIN_WIDTH;
        
        if (frequency < MIN_FREQ || frequency > MAX_FREQ) continue;

        let volume = dataArray[i];
        if (volume > maxVal) {
            maxVal = volume;
            loudestBinIndex = i;
        }

        let noteIndex = getNoteFromFreq(frequency);
        let noteName = noteNames[noteIndex % 12];
        let color = noteColors[noteIndex % 12];
        let x = getXCoord(frequency);
        
        let barHeight = (volume / 255) * (canvas.height - 80);

        // Draw the energy bar
        canvasCtx.fillStyle = color;
        
        // Custom Highlight: If this bin belongs to an "A" note, make it pop out more!
        if (noteName === "A") {
            canvasCtx.globalAlpha = volume > 40 ? 1.0 : 0.4; 
        } else {
            canvasCtx.globalAlpha = volume > 40 ? 0.7 : 0.15; 
        }
        
        canvasCtx.fillRect(x, canvas.height - 40 - barHeight, 2, barHeight);
        
        if (i % 4 === 0) {
            pointsToDraw.push({ x, frequency, noteName, noteIndex });
        }
    }
    canvasCtx.globalAlpha = 1.0;

    // --- STEP 3: DRAW BOTTOM LABELS ---
    pointsToDraw.forEach((p, index) => {
        if (index % 6 === 0) {
            let octave = Math.floor(p.noteIndex / 12) - 1;
            canvasCtx.fillStyle = "#888888";
            canvasCtx.font = "10px sans-serif";
            
            canvasCtx.fillRect(p.x, canvas.height - 38, 1, 5);
            
            canvasCtx.fillStyle = noteColors[p.noteIndex % 12];
            canvasCtx.fillText(`${p.noteName}${octave}`, p.x - 7, canvas.height - 22);
            
            canvasCtx.fillStyle = "#666";
            canvasCtx.fillText(`${Math.round(p.frequency)}Hz`, p.x - 10, canvas.height - 8);
        }
    });

    // --- STEP 4: TRACK PITCH OVERLAY IF LOUD ENOUGH ---
    if (maxVal > 40) {
        let loudestFrequency = BIN_WIDTH * loudestBinIndex;
        if (loudestFrequency > 20) {
            let noteIndex = getNoteFromFreq(loudestFrequency);
            noteDisplay.innerText = noteNames[noteIndex % 12];
            octaveDisplay.innerText = Math.floor(noteIndex / 12) - 1;
            
            let peakX = getXCoord(loudestFrequency);
            canvasCtx.strokeStyle = "#FFFFFF";
            canvasCtx.lineWidth = 2;
            canvasCtx.beginPath();
            canvasCtx.moveTo(peakX, 0);
            canvasCtx.lineTo(peakX, canvas.height - 40);
            canvasCtx.stroke();
        }
    } else {
        noteDisplay.innerText = "-";
        octaveDisplay.innerText = "";
    }
}

// --- DYNAMIC LEGEND GENERATION ---
function buildLegend() {
    const legendContainer = document.getElementById("legend");
    
    noteNames.forEach((name, index) => {
        const badge = document.createElement("div");
        badge.classList.add("legend-badge");
        badge.innerText = name;
        badge.style.backgroundColor = noteColors[index];
        
        legendContainer.appendChild(badge);
    });
}

// Call the function to display the legend layout on screen load
buildLegend();


// Mic initialization toggles
micButton.addEventListener("click", async () => {
  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  if (micButton.dataset.recording === "false") {
      try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          micSource = audioContext.createMediaStreamSource(stream);
          micSource.connect(analyserNode);
          
          micButton.dataset.recording = "true";
          micButton.textContent = "🛑";
          console.log("Analyzing stream inputs...");
      } catch (err) {
          console.error("Microphone denied", err);
      }
  } else {
    micButton.dataset.recording = "false";
    micButton.textContent = "🎤";
    if (micSource) micSource.disconnect();
    if (stream) stream.getTracks().forEach(track => track.stop());
}
});

animate();