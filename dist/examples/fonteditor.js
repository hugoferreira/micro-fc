let color = 1
let sprite = 0
let tooltip = ''
let spriteBank = 0

function init() {
    border(1)
}

function doPalette(x, y) {
    rect(x - 1, y - 1, 32 + x, 32 + y, 0)
    spr(0, x, y, 4, 16, 0)

    const x0 = ((color % 4) * 8 + x)
    const y0 = ((color >> 2) * 8 + y)
    const x1 = x0 + 7
    const y1 = y0 + 7

    rect(x0, y0, x1, y1, 0)
    rect(x0 - 1, y0 - 1, x1 + 1, y1 + 1, 15)

    clkgrid(x, y, 32, 32, 4, 4, (r, c) => color = r * 4 + c)
}

function doSpriteCanvas(x, y) {
    rect(x - 1, y - 1, x + 64, y + 64, 0)
    spr(sprite, x, y, 8, 16, spriteBank)

    clkgrid(x, y, 64, 64, 8, 8, (r, c) => sset(sprite, c, r, color, spriteBank))

    if (inrect(mouse.x, mouse.y, x, y, x + 63, y + 63))
        tooltip = `X:${Math.floor((mouse.x - x) / 8)} Y:${Math.floor((mouse.y - y) / 8)}`
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
    cls()
    rectfill(0, 0, width, 9, 12)
    print('Sprite Editor', 1, 1, 15)

    rectfill(0, 10, width, 85, 5)
    doPalette(5, 12)
    doSpriteCanvas(59, 12)
    doSpriteSheet(0, 88, cols = 16, rows = 8)

    rectfill(4, 49, 37, 55, 1)
    print(sprite.toString().padStart(3, '0'), 19, 50, 15, 1)

    rectfill(0, height - 8, width, width, 12)
    print(tooltip, 1, height - 7, 4)
}
