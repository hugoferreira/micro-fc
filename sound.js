var audioContext = new (window.AudioContext || window.webkitAudioContext)();
var frequencyOffset = 0;
var oscillator = audioContext.createOscillator();
oscillator.type = 'triangle';
var gainNode = audioContext.createGain();
oscillator.connect(gainNode);
gainNode.connect(audioContext.destination);
gainNode.gain.value = 0;
oscillator.frequency.value = 400;
oscillator.start(0);
function beep(freq) {
    if (freq === void 0) { freq = 400; }
    oscillator.frequency.value = freq;
    gainNode.gain.value = 0.5;
    setTimeout(function () { gainNode.gain.value = 0; }, 100);
}
//# sourceMappingURL=sound.js.map