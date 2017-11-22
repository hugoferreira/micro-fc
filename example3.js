let color = 1
let sprite = 0
let tooltip = ''

function init() {
    bank(0)
    for (let r = 0; r < 4; r += 1)
        for (let c = 0; c < 4; c += 1)
            sset(0, c, r, r * 4 + c)
    bank(1)
}

function doPalette(x, y) {
    rect(x - 1, y - 1, 32 + x, 32 + y, 0)

    clip(x, y, x + 31, y + 31)
    spr(0, x, y, 8, 16, 0)
    clip()

    const x0 = (color % 4) * 8 + x
    const y0 = Math.floor(color / 4) * 8 + y
    const x1 = x0 + 7
    const y1 = y0 + 7

    rect(x0, y0, x1, y1, 0)
    rect(x0 - 1, y0 - 1, x1 + 1, y1 + 1, 7)

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

    rect(x0 - 1, y0 - 1, x1 + 1, y1 + 1, 7)
    rect(x0 - 2, y0 - 2, x1 + 2, y1 + 2, 0)

    clkgrid(x, y, 127, 24, cols, rows, (r, c) => sprite = r * cols + c)
}

function doToolTip(x, y) {
   print(tooltip, x, y)
}

function update() {
    tooltip = ''
    cls()
    rectfill(0, 0, 127, 7, 8)
    rectfill(0, 127 - 6, 127, 127, 8)
    rectfill(0, 8, 127, 82, 15)
    pen(7)
    print('Sprite Editor', 1, 1)
    doPalette(5, 13)
    doSpriteCanvas(59, 13)
    doSpriteSheet(0, 85)
    doToolTip(1, 127-5)
}
