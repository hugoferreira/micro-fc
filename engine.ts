const fps = 30
const width = 128
const height = 128
const screenWidth = 384
const screenHeight = 384
const xScale = screenWidth / width
const yScale = screenHeight / height
const borderSize = 48

const canvas = <HTMLCanvasElement> document.getElementById('myCanvas')
const ctx = canvas.getContext('2d')
const image = ctx.createImageData(screenWidth, screenHeight)
const texture = image.data.fill(255)
const videomem = Array(width * height).fill(0)
const spritesheet = Array(width * height).fill(0)

const btnstate = Array(6).fill(0)
const mouse = { x: 0, y: 0, click: false }

const palette = [
    [0, 0, 0], [29, 43, 83], [126, 37, 83], [0, 135, 81],
    [171, 82, 54], [95, 87, 79], [194, 195, 199], [255, 241, 232],
    [255, 0, 77], [255, 163, 0], [255, 236, 39], [0, 228, 54],
    [41, 173, 255], [131, 118, 156], [255, 119, 168], [255, 204, 170]
]

const drawState = {
    borderColor: 0,
    penColor: 7
}

let init: () => void
let update: () => void
let draw: () => void

function eventLoop() {
    if (update !== undefined) update()
    if (draw !== undefined) draw()
    refresh()
}

function refresh() {
    for (let y = 0; y < screenWidth; y += 1) {
        for (let x = 0; x < screenHeight; x += 1) {
            const i1 = (Math.floor(y / yScale) * width + Math.floor(x / xScale))
            const i2 = (y * screenWidth + x) * 4
            const color = palette[videomem[i1]]

            texture[i2 + 0] = color[0]
            texture[i2 + 1] = color[1]
            texture[i2 + 2] = color[2]
        }
    }

    const borderRGB = palette[drawState.borderColor]
    ctx.fillStyle = `rgb(${borderRGB[0]}, ${borderRGB[1]}, ${borderRGB[2]})`
    ctx.fillRect(0, 0, screenWidth + borderSize * 2, screenHeight + borderSize * 2)
    ctx.putImageData(image, borderSize, borderSize)
}

// Text

const font = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x30, 0x30, 0x30, 0x00, 0x30, 0x00, 0x00, 0x00, 0x50, 0x50, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x50, 0xf8, 0x50, 0xf8, 0x50, 0x00, 0x00, 0x00, 0x78, 0xa0, 0x70, 0x28, 0xf0, 0x00, 0x00, 0x00, 0x88, 0x10, 0x20, 0x40, 0x88, 0x00, 0x00, 0x00, 0x40, 0xa0, 0x68, 0x90, 0x68, 0x00, 0x00, 0x00, 0x20, 0x40, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x20, 0x40, 0x40, 0x40, 0x20, 0x00, 0x00, 0x00, 0x40, 0x20, 0x20, 0x20, 0x40, 0x00, 0x00, 0x00, 0x20, 0xa8, 0x70, 0xa8, 0x20, 0x00, 0x00, 0x00, 0x00, 0x20, 0x70, 0x20, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x60, 0x20, 0x40, 0x00, 0x00, 0x00, 0x00, 0x70, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x60, 0x60, 0x00, 0x00, 0x00, 0x08, 0x10, 0x20, 0x40, 0x80, 0x00, 0x00, 0x00, 0x70, 0xc8, 0xc8, 0xc8, 0x70, 0x00, 0x00, 0x00, 0x30, 0x70, 0x30, 0x30, 0x78, 0x00, 0x00, 0x00, 0xf0, 0x18, 0x70, 0xc0, 0xf8, 0x00, 0x00, 0x00, 0xf8, 0x18, 0x30, 0x98, 0x70, 0x00, 0x00, 0x00, 0x30, 0x70, 0xd0, 0xf8, 0x10, 0x00, 0x00, 0x00, 0xf8, 0xc0, 0xf0, 0x18, 0xf0, 0x00, 0x00, 0x00, 0x70, 0xc0, 0xf0, 0xc8, 0x70, 0x00, 0x00, 0x00, 0xf8, 0x18, 0x30, 0x60, 0xc0, 0x00, 0x00, 0x00, 0x70, 0xc8, 0x70, 0xc8, 0x70, 0x00, 0x00, 0x00, 0x70, 0xc8, 0x78, 0x08, 0x70, 0x00, 0x00, 0x00, 0x60, 0x60, 0x00, 0x60, 0x60, 0x00, 0x00, 0x00, 0x60, 0x60, 0x00, 0x60, 0x20, 0x40, 0x00, 0x00, 0x10, 0x20, 0x40, 0x20, 0x10, 0x00, 0x00, 0x00, 0x00, 0x70, 0x00, 0x70, 0x00, 0x00, 0x00, 0x00, 0x40, 0x20, 0x10, 0x20, 0x40, 0x00, 0x00, 0x00, 0x78, 0x18, 0x30, 0x00, 0x30, 0x00, 0x00, 0x00, 0x70, 0xa8, 0xb8, 0x80, 0x70, 0x00, 0x00, 0x00, 0x70, 0xc8, 0xc8, 0xf8, 0xc8, 0x00, 0x00, 0x00, 0xf0, 0xc8, 0xf0, 0xc8, 0xf0, 0x00, 0x00, 0x00, 0x70, 0xc8, 0xc0, 0xc8, 0x70, 0x00, 0x00, 0x00, 0xf0, 0xc8, 0xc8, 0xc8, 0xf0, 0x00, 0x00, 0x00, 0xf8, 0xc0, 0xf0, 0xc0, 0xf8, 0x00, 0x00, 0x00, 0xf8, 0xc0, 0xf0, 0xc0, 0xc0, 0x00, 0x00, 0x00, 0x78, 0xc0, 0xd8, 0xc8, 0x78, 0x00, 0x00, 0x00, 0xc8, 0xc8, 0xf8, 0xc8, 0xc8, 0x00, 0x00, 0x00, 0x78, 0x30, 0x30, 0x30, 0x78, 0x00, 0x00, 0x00, 0xf8, 0x18, 0x18, 0xd8, 0x70, 0x00, 0x00, 0x00, 0xc8, 0xd0, 0xe0, 0xd0, 0xc8, 0x00, 0x00, 0x00, 0xc0, 0xc0, 0xc0, 0xc0, 0xf8, 0x00, 0x00, 0x00, 0xd8, 0xf8, 0xf8, 0xa8, 0x88, 0x00, 0x00, 0x00, 0xc8, 0xe8, 0xf8, 0xd8, 0xc8, 0x00, 0x00, 0x00, 0x70, 0xc8, 0xc8, 0xc8, 0x70, 0x00, 0x00, 0x00, 0xf0, 0xc8, 0xc8, 0xf0, 0xc0, 0x00, 0x00, 0x00, 0x70, 0xc8, 0xc8, 0xc8, 0x70, 0x08, 0x00, 0x00, 0xf0, 0xc8, 0xc8, 0xf0, 0xc8, 0x00, 0x00, 0x00, 0x78, 0xe0, 0x70, 0x38, 0xf0, 0x00, 0x00, 0x00, 0x78, 0x30, 0x30, 0x30, 0x30, 0x00, 0x00, 0x00, 0xc8, 0xc8, 0xc8, 0xc8, 0x70, 0x00, 0x00, 0x00, 0xc8, 0xc8, 0xc8, 0x70, 0x20, 0x00, 0x00, 0x00, 0x88, 0xa8, 0xf8, 0xf8, 0xd8, 0x00, 0x00, 0x00, 0xc8, 0xc8, 0x70, 0xc8, 0xc8, 0x00, 0x00, 0x00, 0x68, 0x68, 0x78, 0x30, 0x30, 0x00, 0x00, 0x00, 0xf8, 0x30, 0x60, 0xc0, 0xf8, 0x00, 0x00, 0x00, 0x60, 0x40, 0x40, 0x40, 0x60, 0x00, 0x00, 0x00, 0x80, 0x40, 0x20, 0x10, 0x08, 0x00, 0x00, 0x00, 0x60, 0x20, 0x20, 0x20, 0x60, 0x00, 0x00, 0x00, 0x20, 0x50, 0x88, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x78, 0x00, 0x00, 0x00, 0x40, 0x20, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x78, 0x98, 0x98, 0x78, 0x00, 0x00, 0x00, 0xc0, 0xf0, 0xc8, 0xc8, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x78, 0xe0, 0xe0, 0x78, 0x00, 0x00, 0x00, 0x18, 0x78, 0x98, 0x98, 0x78, 0x00, 0x00, 0x00, 0x00, 0x70, 0xd8, 0xe0, 0x70, 0x00, 0x00, 0x00, 0x38, 0x60, 0xf8, 0x60, 0x60, 0x00, 0x00, 0x00, 0x00, 0x70, 0x98, 0xf8, 0x18, 0x70, 0x00, 0x00, 0xc0, 0xf0, 0xc8, 0xc8, 0xc8, 0x00, 0x00, 0x00, 0x30, 0x00, 0x70, 0x30, 0x78, 0x00, 0x00, 0x00, 0x18, 0x00, 0x18, 0x18, 0x98, 0x70, 0x00, 0x00, 0xc0, 0xc8, 0xf0, 0xc8, 0xc8, 0x00, 0x00, 0x00, 0x60, 0x60, 0x60, 0x60, 0x38, 0x00, 0x00, 0x00, 0x00, 0xd0, 0xf8, 0xa8, 0xa8, 0x00, 0x00, 0x00, 0x00, 0xf0, 0xc8, 0xc8, 0xc8, 0x00, 0x00, 0x00, 0x00, 0x70, 0xc8, 0xc8, 0x70, 0x00, 0x00, 0x00, 0x00, 0xf0, 0xc8, 0xc8, 0xf0, 0xc0, 0x00, 0x00, 0x00, 0x78, 0x98, 0x98, 0x78, 0x18, 0x00, 0x00, 0x00, 0xf0, 0xc8, 0xc0, 0xc0, 0x00, 0x00, 0x00, 0x00, 0x78, 0xe0, 0x38, 0xf0, 0x00, 0x00, 0x00, 0x60, 0xf8, 0x60, 0x60, 0x38, 0x00, 0x00, 0x00, 0x00, 0x98, 0x98, 0x98, 0x78, 0x00, 0x00, 0x00, 0x00, 0xc8, 0xc8, 0xd0, 0xe0, 0x00, 0x00, 0x00, 0x00, 0x88, 0xa8, 0xf8, 0xd8, 0x00, 0x00, 0x00, 0x00, 0xd8, 0x70, 0x70, 0xd8, 0x00, 0x00, 0x00, 0x00, 0x98, 0x98, 0x78, 0x18, 0x70, 0x00, 0x00, 0x00, 0xf8, 0x30, 0x60, 0xf8, 0x00, 0x00, 0x00, 0x30, 0x20, 0x60, 0x20, 0x30, 0x00, 0x00, 0x00, 0x20, 0x20, 0x20, 0x20, 0x20, 0x00, 0x00, 0x00, 0x60, 0x20, 0x30, 0x20, 0x60, 0x00, 0x00, 0x00, 0x00, 0x28, 0x50, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]
const fontWidth = 6
const fontHeight = 6
const encodedBits = 8

function drawChar(x0: number, y0: number, symbol: number, pen?: number, paper?: number) {
    const ptr = symbol * 8

    for (let y = 0; y < fontWidth; y += 1)
        for (let x = 0; x < fontHeight; x += 1) {
            const bit = font[ptr + y] & (1 << (encodedBits - 1 - x))
            if (bit !== 0) pset(x + x0, y + y0, pen)
            else if (paper !== undefined) pset(x + x0, y + y0, paper)
        }
}

// API
function clamp(value: number, max = 255, min = 0) {
    return (value > max) ? max : ((value < min) ? min : value)
}

function peek(addr: number) {
    return videomem[addr]
}

function poke(addr: number, value: number) {
    videomem[addr] = value
}

function rnd(n: number) {
    return Math.floor(Math.random() * (Math.floor(n) + 1))
}

function pset(x: number, y: number, color?: number) {
    if (x >= 0 && x < width && y >= 0 && y < height)
        videomem[y * width + x] = (color !== undefined ? color : drawState.penColor)
}

function pget(x: number, y: number) {
    return videomem[y * width + x]
}

// TODO: DDA Algorithm; update to Bresenham’s ?
function line(x0: number, y0: number, x1: number, y1: number, color?: number) {
    const dx = x1 - x0
    const dy = y1 - y0
    const steps = (Math.abs(dx) > Math.abs(dy)) ? Math.abs(dx) : Math.abs(dy)
    const xinc = dx / steps
    const yinc = dy / steps

    for (let v = 0, x = x0, y = y0; v < steps; v += 1, x += xinc, y += yinc)
        pset(Math.round(x), Math.round(y), color)
}

function rect(x0: number, y0: number, x1: number, y1: number, color?: number) {
    line(x0, y0, x1, y0, color)
    line(x1, y0, x1, y1, color)
    line(x1, y1, x0, y1, color)
    line(x0, y1, x0, y0, color)
}

function rectfill(x0: number, y0: number, x1: number, y1: number, color?: number) {
    for (let y = y0; y <= y1; y += 1)
        for (let x = x0; x <= x1; x += 1)
            pset(x, y, color)
}

function cls(color: number = 0) {
    videomem.fill(color)
}

function btn(n: number) {
    return btnstate[n]
}

function print() { } // deactivate the print() function from browser
function print(str: string, x: number, y: number, pen?: number, paper?: number, wrap = true) {
    for (let i = 0, x0 = x, y0 = y; i < str.length; i += 1, x0 += fontWidth) {
        if (wrap && (width - x0) < fontWidth) { y0 += fontHeight; x0 = 0}
        drawChar(x0, y0, str.charCodeAt(i), pen, paper)
    }
}

function pen(color: number) {
    drawState.penColor = color
}

function border(color: number) {
    drawState.borderColor = color
}


// Initialize

window.onload = () => {
    canvas.addEventListener('mousemove', (evt) => {
        const rect = canvas.getBoundingClientRect()
        mouse.x = Math.max(Math.min(Math.floor((evt.clientX - rect.left - borderSize) / xScale), width - 1), 0)
        mouse.y = Math.max(Math.min(Math.floor((evt.clientY - rect.top - borderSize) / yScale), height - 1), 0)
    }, false)

    canvas.addEventListener('mousedown', () => { mouse.click = true }, false)
    canvas.addEventListener('mouseup', () => { mouse.click = false }, false)

    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') btnstate[0] = true
        else if (e.key === 'ArrowRight') btnstate[1] = true
        else if (e.key === 'ArrowUp') btnstate[2] = true
        else if (e.key === 'ArrowDown') btnstate[3] = true
    }, true)

    window.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowLeft') btnstate[0] = false
        else if (e.key === 'ArrowRight') btnstate[1] = false
        else if (e.key === 'ArrowUp') btnstate[2] = false
        else if (e.key === 'ArrowDown') btnstate[3] = false
    }, true)

    if (init !== undefined) init()
    window.setInterval(() => eventLoop(), 1000 / fps)
}
