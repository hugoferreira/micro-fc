const fps = 60
const width = 256
const height = 160
const xScale = 3
const yScale = 3
const screenWidth = width * xScale
const screenHeight = height * yScale
const borderSize = 16
const spriteSize = 64
const spritesPerSheet = 128
const spriteSheetSize = spritesPerSheet * spriteSize
const spriteBanks = 8
const videomemLength = width * height
const spriteBanksLength = spriteSheetSize * spriteBanks

const scanvas = <HTMLCanvasElement> document.getElementById('myCanvas')
scanvas.width = screenWidth + borderSize * 2
scanvas.height = screenHeight + borderSize * 2

const bcanvas = <HTMLCanvasElement> document.createElement('canvas')
bcanvas.width = width
bcanvas.height = height

const bctx = bcanvas.getContext('2d')
const sctx = scanvas.getContext('2d')
sctx.scale(xScale, yScale)
sctx.imageSmoothingEnabled = false

const image = bctx.createImageData(width, height)
const videobuffer = new DataView(image.data.buffer)

const mem = new ArrayBuffer(videomemLength + spriteBanksLength)
const videomem = new Uint8Array(mem, 0, videomemLength)
const lastframe = new Uint8Array(videomemLength)
const spriteSheet = new Uint8Array(mem, videomemLength, spriteBanksLength)

const btnstate = new Uint8Array(6)
const mouse = { x: 0, y: 0, down: false, click: false }

let palette: Uint32Array

const drawState = {
    borderColor: 0,
    penColor: 7,
    spriteBank: 1,
    borderChanged: true,
    drawPalette: new Uint8Array(15),
    clipArea: { x0: 0, y0: 0, x1: width - 1, y1: height - 1 }
}

let frame = 0
let updateCall = () => { }
let drawCall = bootscreen

function eventLoop() {
    frame += 1
    updateCall()
    mouse.click = false
}

function refreshBorder() {
    sctx.fillStyle = `#${(palette[drawState.borderColor] >> 8).toString(16)}`
    sctx.fillRect(0, 0, screenWidth, screenHeight)
    drawState.borderChanged = false
}

function refresh() {
    requestAnimationFrame(refresh)
    let dirty = false

    drawCall()
    if (drawState.borderChanged) {
        dirty = true
        refreshBorder()
    }

    for (let i = 0, j = 0; i < videomem.length; i += 1, j += 4) {
        const dst = palette[videomem[i]]
        if (videobuffer.getUint32(j) !== dst) {
            videobuffer.setUint32(j, dst)
            dirty = true
        }
    }

    if (dirty) {
        bctx.putImageData(image, 0, 0)
        sctx.drawImage(bcanvas, borderSize / xScale, borderSize / yScale)
    }
}

// Sprites
function encodeSprite(s: number, bank: number = drawState.spriteBank) {
    const result = new Uint32Array(8)
    for (let y = 0; y < 8; y += 1) {
        let value = 0x00000000
        for (let x = 7; x >= 0; x -= 1)
            value |= sget(s, x, y, bank) << (28 - x * 4)
        result[y] = value
    }
    return result
}

function encodeBank(bank: number = drawState.spriteBank) {
    const result = new Array<number>()
    for (let i = 0; i < spritesPerSheet; i += 1) {
        const encoded = encodeSprite(i, bank)
        encoded.forEach(e => result.push(e)) // `0x${e.toString(16).toUpperCase().padStart(8, '0')}`
    }
    return result
}

function decodeBank(data: number[], bank: number = drawState.spriteBank) {
    for (let i = 0; i < spritesPerSheet; i += 1) {
        const code = data.slice(i * 8, (i + 1) * 8)
        decodeSprite(code, i, bank)
    }
}

function decodeSprite(code: number[], s: number, bank: number = drawState.spriteBank) {
    for (let y = 0; y < 8; y += 1)
        for (let x = 7; x >= 0; x -= 1)
            sset(s, x, y, (code[y] >> (28 - x * 4)) & 0xF, bank)
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

function pset(x: number, y: number, color: number = drawState.penColor) {
    const c = drawState.clipArea
    if (inrect(x, y, c.x0, c.y0, c.x1, c.y1))
        videomem[y * width + x] = drawState.drawPalette[color]
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

function unsaferectfill(x0: number, y0: number, x1: number, y1: number, color: number) {
    for (let y = y0 * width; y <= y1 * width; y += width)
        videomem.fill(color, y + x0, y + x1 + 1)
}

function rectfill(x0: number, y0: number, x1: number, y1: number, color: number = drawState.penColor) {
    unsaferectfill(Math.max(drawState.clipArea.x0, x0),
                   Math.max(drawState.clipArea.y0, y0),
                   Math.min(drawState.clipArea.x1, x1),
                   Math.min(drawState.clipArea.y1, y1),
                   drawState.drawPalette[color])
}

function inrect(x: number, y: number, x0: number, y0: number, x1: number, y1: number) {
    return (x >= x0 && x <= x1 && y >= y0 && y <= y1)
}

function clip(x0 = 0, y0 = 0, x1 = width - 1, y1 = height - 1) {
    drawState.clipArea = { x0, y0, x1, y1 }
}

function posgrid(currentX: number, currentY: number, x0: number, y0: number, width: number, height: number, hslices: number, vslices: number) {
    return inrect(currentX, currentY, x0, y0, x0 + width, y0 + height) ? {
        x: clamp(Math.floor((currentX - x0) / (width / hslices)), hslices - 1, 0),
        y: clamp(Math.floor((currentY - y0) / (height / vslices)), vslices - 1, 0)
    } : undefined
}

function cls(color: number = 0) {
    videomem.fill(color)
}

function btn(n: number) {
    return btnstate[n]
}

// @ts-ignore
function print() { } 

function printc(str: string, x: number, y: number, pen?: number, paper?: number) {
    print(str, x - (str.length * fontWidth) / 2, y, pen, paper)
}

function printr(str: string, x: number, y: number, pen?: number, paper?: number) {
    print(str, x - (str.length * fontWidth), y, pen, paper)
}

// @ts-ignore
function print(str: string, x: number, y: number, pen?: number = drawState.penColor, paper?: number, wrap = true) {
    if (pen !== undefined) pal(15, pen)
    if (paper !== undefined) pal(0, paper)

    for (let i = 0, x0 = x, y0 = y; i < str.length; i += 1, x0 += fontWidth) {
        if (wrap && (width - x0) < fontWidth) { y0 += fontHeight; x0 = 0}
        spr(str.charCodeAt(i), x0, y0, 1, (paper === undefined) ? 0 : 16, 0)
    }

    if (pen !== undefined || paper !== undefined) pal()
} 

function pen(color: number) {
    drawState.penColor = color
}

function border(color: number) {
    drawState.borderColor = color
    drawState.borderChanged = true
}

function bank(value: number) {
    drawState.spriteBank = value
}

function spr(s: number, x0: number, y0: number, scale = 1, transparentColor = 0, bank: number = drawState.spriteBank) {
    const offset = spriteSheetSize * bank + s * spriteSize
    for (let p = 0; p < spriteSize; p += 1) {
        const color = spriteSheet[offset + p]
        if (color !== transparentColor) {
            const x = (p % 8) * scale + x0
            const y = Math.floor(p / 8) * scale + y0
            if (scale > 1) rectfill(x, y, x + (scale - 1), y + (scale - 1), color)
            else pset(x, y, color)
        }
    }
}

function sset(s: number, x: number, y: number, color: number = drawState.penColor, bank: number = drawState.spriteBank) {
    const offset = spriteSheetSize * bank + s * spriteSize
    spriteSheet[offset + y * 8 + x] = color
}

function sget(s: number, x: number, y: number, bank: number = drawState.spriteBank) {
    const offset = spriteSheetSize * bank + s * spriteSize
    return spriteSheet[offset + y * 8 + x]
}

function clkgrid(x0: number, y0: number, width: number, height: number, hslices: number, vslices: number, callback: (r, c) => void, mouseevt = 'down') {
    if (mouse[mouseevt]) {
        const clickSpot = posgrid(mouse.x, mouse.y, x0, y0, width, height, hslices, vslices)
        if (clickSpot !== undefined) callback(clickSpot.y, clickSpot.x)
    }
}

function overgrid(x0: number, y0: number, width: number, height: number, hslices: number, vslices: number, callback: (r, c) => void, mouseevt = 'down') {
    if (inrect(mouse.x, mouse.y, x0, y0, x0 + width, y0 + height)) {
        const pos = posgrid(mouse.x, mouse.y, x0, y0, width, height, hslices, vslices)
        if (pos !== undefined) callback(pos.y, pos.x)
    }
}

function setpal(values: number[]) {
    palette = new Uint32Array(values.map(v => (v << 8) | 0xFF))
}

function pal(src?: number, dst?: number) {
    if (src !== undefined && dst !== undefined)
        drawState.drawPalette[src] = dst
    else
        drawState.drawPalette = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])
}

function bootscreen() {
    decodeSprite([0x11111111, 0x11111111, 0x11111111, 0x11111111, 0x11111111, 0x11111111, 0x11111111, 0x11111111], 0)
    decodeSprite([0x10101010, 0x01010101, 0x10101010, 0x01010101, 0x10101010, 0x01010101, 0x10101010, 0x01010101], 1)

    cls()
    pal()

    for (let y = 0; y < height / 8; y += 1)
        for (let x = 0; x < width / 8; x += 1) {
            pal(1, x % 16)
            spr(0, x * 8, y * 8)
            pal(1, y % 16)
            spr(1, x * 8, y * 8)
        }
}

// BIOS
const fontWidth = 8
const fontHeight = 8
const sysBank = [0x00112233,0x00112233,0x44556677,0x44556677,0x8899AABB,0x8899AABB,0xCCDDEEFF,0xCCDDEEFF,0x50005555,0x01120555,0x01110555,0x01110555,0x50005555,0x55555555,0x55555555,0x55555555,0x50005555,0x0DDB0555,0x0DDD0555,0x0DDD0555,0x50005555,0x55555555,0x55555555,0x55555555,0x0FFFFF00,0xFFFFFFF0,0x0F0F0F00,0x0F0F0F00,0x0F0F0F00,0x0F0F0F00,0x0FFFFF00,0x00000000,0xF0F0F0F0,0x00000000,0xF00000F0,0x00000000,0xF00000F0,0x00000000,0xF0F0F0F0,0x00000000,0x0000F000,0x00000F00,0x000000F0,0x0FFFFFFF,0xF0FFFFF0,0xF00FFF00,0xF000F000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x000FF000,0x0000FF00,0x0FFFFFF0,0x0000FF00,0x000FF000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00FF0000,0x00FF0000,0x00FF0000,0x00000000,0x00FF0000,0x00000000,0x00000000,0x00000000,0x0F0F0000,0x0F0F0000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x0FF00FF0,0xFFFFFFFF,0x0FF00FF0,0x0FF00FF0,0xFFFFFFFF,0x0FF00FF0,0x00000000,0x00000000,0x0FFFF000,0xF0F00000,0x0FFF0000,0x00F0F000,0xFFFF0000,0x00000000,0x00000000,0x00000000,0xF000F000,0x000F0000,0x00F00000,0x0F000000,0xF000F000,0x00000000,0x00000000,0x00000000,0x0F000000,0xF0F00000,0x0FF0F000,0xF00F0000,0x0FF0F000,0x00000000,0x00000000,0x00000000,0x00F00000,0x0F000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00F00000,0x0F000000,0x0F000000,0x0F000000,0x00F00000,0x00000000,0x00000000,0x00000000,0x0F000000,0x00F00000,0x00F00000,0x00F00000,0x0F000000,0x00000000,0x00000000,0x00000000,0x00F00000,0xF0F0F000,0x0FFF0000,0xF0F0F000,0x00F00000,0x00000000,0x00000000,0x00000000,0x00000000,0x00F00000,0x0FFF0000,0x00F00000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x0FF00000,0x00F00000,0x0F000000,0x00000000,0x00000000,0x00000000,0x00000000,0x0FFF0000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x0FF00000,0x0FF00000,0x00000000,0x00000000,0x00000000,0x0000F000,0x000F0000,0x00F00000,0x0F000000,0xF0000000,0x00000000,0x00000000,0x00000000,0x0FFFF000,0xFF00FF00,0xFF0FFF00,0xFFF0FF00,0xFF00FF00,0x0FFFF000,0x00000000,0x00000000,0x00FF0000,0x0FFF0000,0x00FF0000,0x00FF0000,0x00FF0000,0xFFFFFF00,0x00000000,0x00000000,0x0FFFF000,0xFF00FF00,0x000FF000,0x00FF0000,0x0FF00000,0xFFFFFF00,0x00000000,0x00000000,0xFFFFFF00,0x000FF000,0x00FF0000,0x000FF000,0xFF00FF00,0x0FFFF000,0x00000000,0x00000000,0x000FF000,0x00FFF000,0x0FFFF000,0xFF0FF000,0xFFFFFF00,0x000FF000,0x00000000,0x00000000,0xFFFFFF00,0xFF000000,0xFFFFF000,0x0000FF00,0xFF00FF00,0x0FFFF000,0x00000000,0x00000000,0x0FFFF000,0xFF000000,0xFFFFF000,0xFF00FF00,0xFF00FF00,0x0FFFF000,0x00000000,0x00000000,0xFFFFFF00,0x0000FF00,0x000FF000,0x00FF0000,0x0FF00000,0x0FF00000,0x00000000,0x00000000,0x0FFFF000,0xFF00FF00,0x0FFFF000,0xFF00FF00,0xFF00FF00,0x0FFFF000,0x00000000,0x00000000,0x0FFFF000,0xFF00FF00,0x0FFFFF00,0x0000FF00,0x000FF000,0x0FFF0000,0x00000000,0x00000000,0x00000000,0x00FF0000,0x00FF0000,0x00000000,0x00FF0000,0x00FF0000,0x00000000,0x00000000,0x00000000,0x00FF0000,0x00FF0000,0x00000000,0x00FF0000,0x00FF0000,0x0FF00000,0x00000000,0x0000FF00,0x000FF000,0x00FF0000,0x0FF00000,0x00FF0000,0x000FF000,0x0000FF00,0x00000000,0x00000000,0x00000000,0xFFFFFF00,0x00000000,0x00000000,0xFFFFFF00,0x00000000,0x00000000,0xFF000000,0x0FF00000,0x00FF0000,0x000FF000,0x00FF0000,0x0FF00000,0xFF000000,0x00000000,0x00000000,0x0FFFF000,0xFF00FF00,0x000FF000,0x00FF0000,0x00000000,0x00FF0000,0x00000000,0x0FFF0000,0xF0F0F000,0xF0FFF000,0xF0000000,0x0FFF0000,0x00000000,0x00000000,0x00000000,0x00FF0000,0x0FFFF000,0xFF00FF00,0xFF00FF00,0xFFFFFF00,0xFF00FF00,0x00000000,0x00000000,0xFFFFF000,0xFF00FF00,0xFFFFF000,0xFF00FF00,0xFF00FF00,0xFFFFF000,0x00000000,0x00000000,0x0FFFF000,0xFF00FF00,0xFF000000,0xFF000000,0xFF00FF00,0x0FFFF000,0x00000000,0x00000000,0xFFFF0000,0xFF0FF000,0xFF00FF00,0xFF00FF00,0xFF0FF000,0xFFFF0000,0x00000000,0x00000000,0xFFFFFF00,0xFF000000,0xFFFF0000,0xFF000000,0xFF000000,0xFFFFFF00,0x00000000,0x00000000,0xFFFFFF00,0xFF000000,0xFFFFF000,0xFF000000,0xFF000000,0xFF000000,0x00000000,0x00000000,0x0FFFFF00,0xFF000000,0xFF000000,0xFF0FFF00,0xFF00FF00,0x0FFFFF00,0x00000000,0x00000000,0xFF00FF00,0xFF00FF00,0xFFFFFF00,0xFF00FF00,0xFF00FF00,0xFF00FF00,0x00000000,0x00000000,0xFFFFFF00,0x00FF0000,0x00FF0000,0x00FF0000,0x00FF0000,0xFFFFFF00,0x00000000,0x00000000,0x0000FF00,0x0000FF00,0x0000FF00,0x0000FF00,0xFF00FF00,0x0FFFF000,0x00000000,0x00000000,0xFF00FF00,0xFF0FF000,0xFFFF0000,0xFFFF0000,0xFF0FF000,0xFF00FF00,0x00000000,0x00000000,0xFF000000,0xFF000000,0xFF000000,0xFF000000,0xFF000000,0xFFFFFF00,0x00000000,0x00000000,0xFF000FF0,0xFFF0FFF0,0xFFFFFFF0,0xFF0F0FF0,0xFF000FF0,0xFF000FF0,0x00000000,0x00000000,0xFF00FF00,0xFFF0FF00,0xFFFFFF00,0xFFFFFF00,0xFF0FFF00,0xFF00FF00,0x00000000,0x00000000,0x0FFFF000,0xFF00FF00,0xFF00FF00,0xFF00FF00,0xFF00FF00,0x0FFFF000,0x00000000,0x00000000,0xFFFFF000,0xFF00FF00,0xFF00FF00,0xFFFF0000,0xFF000000,0xFF000000,0x00000000,0x00000000,0x0FFFF000,0xFF00FF00,0xFF00FF00,0xFF00FF00,0xFF0FF000,0x0FF0FF00,0x00000000,0x00000000,0xFFFFF000,0xFF00FF00,0xFF00FF00,0xFFFFF000,0xFF0FF000,0xFF00FF00,0x00000000,0x00000000,0x0FFFF000,0xFFF00000,0x0FFFF000,0x0000FF00,0x0000FF00,0x0FFFF000,0x00000000,0x00000000,0xFFFFFF00,0x00FF0000,0x00FF0000,0x00FF0000,0x00FF0000,0x00FF0000,0x00000000,0x00000000,0xFF00FF00,0xFF00FF00,0xFF00FF00,0xFF00FF00,0xFF00FF00,0xFFFFFF00,0x00000000,0x00000000,0xFF00FF00,0xFF00FF00,0xFF00FF00,0xFF00FF00,0x0FFFF000,0x00FF0000,0x00000000,0x00000000,0xFF000FF0,0xFF000FF0,0xFF0F0FF0,0xFFFFFFF0,0xFFF0FFF0,0xFF000FF0,0x00000000,0x00000000,0xFF00FF00,0xFF00FF00,0x0FFFF000,0x0FFFF000,0xFF00FF00,0xFF00FF00,0x00000000,0x00000000,0x0FF00FF0,0x0FF00FF0,0x00FFFF00,0x000FF000,0x000FF000,0x000FF000,0x00000000,0x00000000,0xFFFFFF00,0x000FF000,0x00FF0000,0x0FF00000,0xFF000000,0xFFFFFF00,0x00000000,0x00000000,0x00FFFF00,0x00FF0000,0x00FF0000,0x00FF0000,0x00FF0000,0x00FFFF00,0x00000000,0x00000000,0xF0000000,0xFF000000,0x0FF00000,0x00FF0000,0x000FF000,0x0000FF00,0x00000000,0x00000000,0xFFFF0000,0x00FF0000,0x00FF0000,0x00FF0000,0x00FF0000,0xFFFF0000,0x00000000,0x00000000,0x000F0000,0x00FFF000,0x0FF0FF00,0xFF000FF0,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0xFFFFFFF0,0x00000000,0x00000000,0x0F000000,0x00F00000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x0FFFF000,0x0000FF00,0x0FFFFF00,0xF000FF00,0x0FFFFF00,0x00000000,0x00000000,0xFF000000,0xFF000000,0xFFFFF000,0xFF00FF00,0xFF00FF00,0xFFFFF000,0x00000000,0x00000000,0x00000000,0x0FFFF000,0xFF000000,0xFF000000,0xFF000000,0x0FFFF000,0x00000000,0x00000000,0x0000FF00,0x0000FF00,0x0FFFFF00,0xFF00FF00,0xFF00FF00,0x0FFFFF00,0x00000000,0x00000000,0x00000000,0x0FFFF000,0xFF00FF00,0xFFFFFF00,0xFF000000,0x0FFFF000,0x00000000,0x00000000,0x00FFF000,0x0FF00000,0xFFFFF000,0x0FF00000,0x0FF00000,0x0FF00000,0x00000000,0x00000000,0x00000000,0x0FFFF000,0xFF00FF00,0xFF00FF00,0x0FFFFF00,0x0000FF00,0xFFFFF000,0x00000000,0xFF000000,0xFF000000,0xFFFFF000,0xFF00FF00,0xFF00FF00,0xFF00FF00,0x00000000,0x00000000,0x00FF0000,0x00000000,0x0FFF0000,0x00FF0000,0x00FF0000,0x0FFFF000,0x00000000,0x00000000,0x0000FF00,0x00000000,0x0000FF00,0x0000FF00,0x0000FF00,0x0000FF00,0x0FFFF000,0x00000000,0xFF000000,0xFF000000,0xFF0FF000,0xFFFF0000,0xFF0FF000,0xFF00FF00,0x00000000,0x00000000,0x0FFF0000,0x00FF0000,0x00FF0000,0x00FF0000,0x00FF0000,0x0FFFF000,0x00000000,0x00000000,0x00000000,0xFF00FF00,0xFFFFFFF0,0xFF0F0FF0,0xFF000FF0,0xFF000FF0,0x00000000,0x00000000,0x00000000,0xFFFFF000,0xFF00FF00,0xFF00FF00,0xFF00FF00,0xFF00FF00,0x00000000,0x00000000,0x00000000,0x0FFFF000,0xFF00FF00,0xFF00FF00,0xFF00FF00,0x0FFFF000,0x00000000,0x00000000,0x00000000,0xFFFFF000,0xFF00FF00,0xFF00FF00,0xFFFFF000,0xFF000000,0xFF000000,0x00000000,0x00000000,0x0FFFFF00,0xFF00FF00,0xFF00FF00,0x0FFFFF00,0x0000FF00,0x0000FF00,0x00000000,0x00000000,0xFFFFF000,0xFF00FF00,0xFF000000,0xFF000000,0xFF000000,0x00000000,0x00000000,0x00000000,0x0FFFFF00,0xFF000000,0x0FFFF000,0x0000FF00,0xFFFFF000,0x00000000,0x00000000,0x00FF0000,0xFFFFFF00,0x00FF0000,0x00FF0000,0x00FF0000,0x00FFFF00,0x00000000,0x00000000,0x00000000,0xFF00FF00,0xFF00FF00,0xFF00FF00,0xFF00FF00,0x0FFFFF00,0x00000000,0x00000000,0x00000000,0xFF00FF00,0xFF00FF00,0xFF00FF00,0x0FFFF000,0x00FF0000,0x00000000,0x00000000,0x00000000,0xFF000FF0,0xFF0F0FF0,0xFFFFFFF0,0x0FFFFF00,0x0FF0FF00,0x00000000,0x00000000,0x00000000,0xFF00FF00,0x0FFFF000,0x00FF0000,0x0FFFF000,0xFF00FF00,0x00000000,0x00000000,0x00000000,0xFF00FF00,0xFF00FF00,0xFF00FF00,0x0FFFFF00,0x000FF000,0xFFFF0000,0x00000000,0x00000000,0xFFFFFF00,0x000FF000,0x00FF0000,0x0FF00000,0xFFFFFF00,0x00000000,0x00000000,0x00FFFF00,0x00FF0000,0x0FFF0000,0x0FFF0000,0x00FF0000,0x00FFFF00,0x00000000,0x00000000,0x00FF0000,0x00FF0000,0x00FF0000,0x00FF0000,0x00FF0000,0x00FF0000,0x00000000,0x00000000,0xFFFF0000,0x00FF0000,0x00FFF000,0x00FFF000,0x00FF0000,0xFFFF0000,0x00000000,0x00000000,0x00000000,0x00F0F000,0x0F0F0000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000,0x00000000]
const sysPal = [0x000000, 0x143563, 0x386C9C, 0x118840,
                0x60305F, 0x505050, 0x60E0FF, 0x14E01F,
                0x9D4040, 0xFF8ABF, 0xACACAC, 0xFFF210,
                0xED1D25, 0xFF903C, 0xFFCCBC, 0xFFFFFF]
                
window.onload = () => {
    scanvas.addEventListener('mousemove', (evt) => {
        mouse.x = clamp(Math.floor(evt.offsetX - borderSize) / xScale, width - 1, 0)
        mouse.y = clamp(Math.floor(evt.offsetY - borderSize) / yScale, height - 1, 0)
    }, false)

    scanvas.addEventListener('mousedown', () => { mouse.down = true }, false)
    scanvas.addEventListener('mouseup', () => { mouse.down = false }, false)
    scanvas.addEventListener('click', () => { mouse.click = true }, false)

    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') btnstate[0] = 1
        else if (e.key === 'ArrowRight') btnstate[1] = 1
        else if (e.key === 'ArrowUp') btnstate[2] = 1
        else if (e.key === 'ArrowDown') btnstate[3] = 1
    }, true)

    window.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowLeft') btnstate[0] = 0
        else if (e.key === 'ArrowRight') btnstate[1] = 0
        else if (e.key === 'ArrowUp') btnstate[2] = 0
        else if (e.key === 'ArrowDown') btnstate[3] = 0
    }, true)

    pal()
    setpal(sysPal)
    decodeBank(sysBank, 0)

    window.setInterval(() => eventLoop(), 1000 / fps)
    refresh()

    window.setTimeout(() => {
        if (window['init'] !== undefined) (<any> window).init() 
        if (window['update'] !== undefined) updateCall = (<any> window).update
        if (window['draw'] !== undefined) drawCall = (<any> window).draw
    }, 300)
}
