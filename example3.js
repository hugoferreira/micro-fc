let x = 64, y = 30, frame = 0
let swatches = []
let color = 1

function init() {
    bank(0)
    for (let r = 0; r < 4; r += 1)
        for (let c = 0; c < 4; c += 1)
            sset(0, c, r, r * 4 + c)
    bank(1)
}

function drawPalette(x, y) {
    rectfill(x - 1, y - 1, 32 + x, 32 + y, 0)

    clip(x, y, x + 31, y + 31)
    spr(0, x, y, 8, 16, 0)
    clip()

    const row = Math.floor(color / 4)
    const col = color % 4
    const x0 = col * 8 + x
    const y0 = row * 8 + y
    const x1 = x0 + 7
    const y1 = y0 + 7

    rect(x0, y0, x1, y1, 0)
    rect(x0 - 1, y0 - 1, x1 + 1, y1 + 1, 7)
}

function onSpriteEditorClick(x0, y0) {
    if (mouse.click) {
        const clickSpot = posgrid(mouse.x, mouse.y, x0, y0, 64, 64, 8, 8)
        if (clickSpot !== undefined) sset(0, clickSpot.x, clickSpot.y, color)
    }
}

function onPaletteClick(x0, y0) {
    if (mouse.click) {
        const clickSpot = posgrid(mouse.x, mouse.y, x0, y0, 32, 32, 4, 4)
        if (clickSpot !== undefined) color = clickSpot.y * 4 + clickSpot.x
    }
}

function update() {
    cls()
    rectfill(0, 0, 127, 7, 8)
    rectfill(0, 9, 127, 76, 15)
    pen(7)
    print(`Mouse: ${mouse.x}, ${mouse.y} ${mouse.click?'*':''}`, 1, 1)
    drawPalette(2, 11)

    rectfill(61, 10, 126, 75, 0)
    spr(0, 62, 11, 8, -1)

    onPaletteClick(0, 9)
    onSpriteEditorClick(64, 9)
}
