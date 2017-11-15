const fps = 10
const width = 128
const height = 128
const swidth = 512
const sheight = 512
const canvas = <HTMLCanvasElement> document.getElementById('myCanvas')
const ctx = canvas.getContext('2d')
const image = ctx.createImageData(swidth, sheight)
const texture = image.data
const videomem = Array(width * height).fill(0)
const spritesheet = Array(width * height).fill(0)

let btnstate = Array(6).fill(0)

const pal = [
    [0, 0, 0], [29, 43, 83], [126, 37, 83], [0, 135, 81],
    [171, 82, 54], [95, 87, 79], [194, 195, 199], [255, 241, 232],
    [255, 0, 77], [255, 163, 0], [255, 236, 39], [0, 228, 54],
    [41, 173, 255], [131, 118, 156], [255, 119, 158], [255, 204, 170]
]

let update: () => void

function eventLoop() {
    if (update !== undefined) update()
    refresh()
    verticalsync()
}

function refresh() {
    for (let y = 0; y < swidth; y += 1) {
        for (let x = 0; x < sheight; x += 1) {
            const i1 = (Math.floor(y / 4) * width + Math.floor(x / 4))
            const i2 = (y * swidth + x) * 4
            const color = pal[videomem[i1]]

            texture[i2 + 0] = color[0]
            texture[i2 + 1] = color[1]
            texture[i2 + 2] = color[2]
            texture[i2 + 3] = 255
        }
    }

    ctx.putImageData(image, 0, 0)
}

function verticalsync() {
    btnstate = Array(6).fill(0)
}

function keyHandler(e) {
    if (e.key === 'ArrowLeft')  btnstate[0] = 1
    if (e.key === 'ArrowRight') btnstate[1] = 1
    if (e.key === 'ArrowUp')    btnstate[2] = 1
    if (e.key === 'ArrowDown')  btnstate[3] = 1
}

// API
function rnd(n) {
    return Math.floor(Math.random() * (Math.floor(n) + 1))
}

function pset(x, y, color) {
    videomem[y * width + x] = color
}

function pget(x, y) {
    return videomem[y * width + x]
}

// TODO: DDA Algorithm; update to Bresenham’s ?
function line(x0, y0, x1, y1, color) {
    const dx = x1 - x0
    const dy = y1 - y0
    const steps = (Math.abs(dx) > Math.abs(dy)) ? Math.abs(dx) : Math.abs(dy)
    const xinc = dx / steps
    const yinc = dy / steps
    let x = x0
    let y = y0

    pset(x, y, color)
    for (let v = 0; v < steps; v += 1) {
        x = x + xinc
        y = y + yinc
        pset(Math.round(x), Math.round(y), color)
    }
}

function cls(color) {
    videomem.fill(color)
}

function btn(n) {
    return btnstate[n]
}

// Initialize

window.onload = () => {
    window.addEventListener('keydown', keyHandler, true)
    window.setInterval(() => eventLoop(), 1000 / fps)
}
