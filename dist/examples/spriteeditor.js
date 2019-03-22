let color = 1
let sprite = 0
let tooltip = ''

function init() {
    decodeSprite([0x00112233, 0x00112233, 0x44556677, 0x44556677,
                  0x8899AABB, 0x8899AABB, 0xCCDDEEFF, 0xCCDDEEFF], 0, 0)
}

function doPalette(x, y) {
    rect(x - 1, y - 1, 32 + x, 32 + y, 0)
    spr(0, x, y, 4, 16, 0)

    const x0 = (color % 4) * 8 + x
    const y0 = Math.floor(color / 4) * 8 + y
    const x1 = x0 + 7
    const y1 = y0 + 7

    rect(x0, y0, x1, y1, 0)
    rect(x0 - 1, y0 - 1, x1 + 1, y1 + 1, 15)

    clkgrid(x, y, 32, 32, 4, 4, (r, c) => color = r * 4 + c)
}

function doSpriteCanvas(x, y) {
    rect(x-1, y-1, x+64, y+64, 0)
    spr(sprite, x, y, 8, -1)

    clkgrid(x, y, 64, 64, 8, 8, (r, c) => sset(sprite, c, r, color))

    if (inrect(mouse.x, mouse.y, x, y, x+63, y+63))
        tooltip = `X:${Math.floor((mouse.x - x) / 8)} Y:${Math.floor((mouse.y - y) / 8)}`
}

function doSpriteSheet(x, y, cols=16, rows=4) {
    for (let r = 0; r < rows; r += 1)
        for (let c = 0; c < cols; c += 1)
            spr(r * cols + c, x + c * 8, y + r * 8)

    const x0 = (sprite % cols) * 8 + x
    const y0 = Math.floor(sprite / cols) * 8 + y
    const x1 = x0 + 7
    const y1 = y0 + 7

    rect(x0 - 1, y0 - 1, x1 + 1, y1 + 1, 15)
    rect(x0 - 2, y0 - 2, x1 + 2, y1 + 2, 0)

    clkgrid(x, y, 127, rows*8, cols, rows, (r, c) => sprite = r * cols + c)
}

function update() {
    tooltip = ''
    cls()
    rectfill(0, 0, 127, 7, 12)
    print('Sprite Editor', 1, 1, 15)

    rectfill(0, 8, 127, 82, 5)
    doPalette(5, 13)
    doSpriteCanvas(59, 13)
    doSpriteSheet(0, 85)

    rectfill(4, 49, 37, 55, 1)
    print(sprite.toString().padStart(3, '0'), 19, 50, 15, 1)

    rectfill(0, 127 - 6, 127, 127, 12)
    print(tooltip, 1, 127-5, 4)
}
