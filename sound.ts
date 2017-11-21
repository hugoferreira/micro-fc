const audioContext = new (window.AudioContext || window.webkitAudioContext)()
const frequencyOffset = 0
const oscillator = audioContext.createOscillator()

oscillator.type = 'triangle'

const gainNode = audioContext.createGain()
oscillator.connect(gainNode)
gainNode.connect(audioContext.destination)

gainNode.gain.value = 0
oscillator.frequency.value = 400
oscillator.start(0)

function beep(freq = 400) {
    oscillator.frequency.value = freq
    gainNode.gain.value = 0.5
    setTimeout(() => { gainNode.gain.value = 0 }, 100)
}
