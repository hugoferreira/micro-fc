let color = 1
let sprite = 0
let tooltip = ''
let spriteBank = 0

function init() {
    border(1)
}

function doPalette(x, y) {
    const ratio = 6

    rect(x - 1, y - 1, x + ratio + 1, y + 16 * ratio, 0)
    for (let color = 0; color <= 15; color += 1) {
        rectfill(x, y + color * ratio, x + ratio, y + (color + 1) * ratio - 1, color)
    }

    clkgrid(x, y, ratio, 16 * ratio - 1, 1, 16, (r, c) => { color = r; tooltip = `Color:${r}` })

    const y1 = y + color * ratio

    rect(x, y1, x + ratio, y1 + ratio - 1, 0)
    rect(x - 1, y1 - 1, x + ratio + 1, y1 + ratio, 15)
}

function doSpriteCanvas(x, y) {
    const ratio = 12

    rect(x - 1, y - 1, x + 8 * ratio, y + 8 * ratio, 0)
    spr(sprite, x, y, 12, 16, spriteBank)

    clkgrid(x, y, 8 * ratio, 8 * ratio, 8, 8, (r, c) => sset(sprite, c, r, color, spriteBank))

    if (inrect(mouse.x, mouse.y, x, y, x + 8 * ratio - 1, y + 8 * ratio - 1))
        tooltip = `X:${Math.floor((mouse.x - x) / ratio)} Y:${Math.floor((mouse.y - y) / ratio)}`
}

function doSpriteSheet(x, y, cols = 16, rows = 4) {
    for (let r = 0; r < rows; r += 1)
        for (let c = 0; c < cols; c += 1)
            spr(r * cols + c, x + c * 8, y + r * 8, 1, 16, spriteBank)

    const x0 = (sprite % cols) * 8 + x
    const y0 = Math.floor(sprite / cols) * 8 + y
    const x1 = x0 + 7
    const y1 = y0 + 7

    rect(x0 - 1, y0 - 1, x1 + 1, y1 + 1, 15)
    rect(x0 - 2, y0 - 2, x1 + 2, y1 + 2, 0)

    clkgrid(x, y, cols * 8, rows * 8, cols, rows, (r, c) => sprite = r * cols + c)
}

/*
let mask = 0b01101011
function doBitmask(x, y) {
    for (let m = 0; m < 8; m += 1)
        spr((mask >> (7-m)) & 0x1 ? 2 : 1, x + m * 8, y, 1, 5, 0)

    clkgrid(x, y, 64, 8, 8, 1, (_, r) => mask ^= (0b10000000 >> r), 'click')
}
*/

function draw() {
    tooltip = ''
    cls(1)
    
    rectfill(0, 0, width, 9, 12)
    print('Sprite Editor', 1, 1, 15)

    // rectfill(0, 10, width, 85, 5)
    doPalette(1, 16)
    doSpriteCanvas(16, 16)
    doSpriteSheet(0, height - 8 * 5 - 2, cols = 32, rows = 4)

    /* rectfill(4, 49, 37, 55, 1)
    print(sprite.toString().padStart(3, '0'), 19, 50, 15, 1) */

    rectfill(0, height - 8, width, width, 12)
    print(tooltip, 1, height - 7, 4)
}
