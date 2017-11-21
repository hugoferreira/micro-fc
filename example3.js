let x = 64, y = 30, frame = 0
let swatches = []
let color = 1

function init() {
    const sw = 10
    const sh = 9
    const x0 = 0
    const y0 = 9

    for (let r = 0; r < 4; r += 1)
        for (let c = 0; c < 4; c += 1)
            swatches.push({
                x0: x0 + c * sw,
                y0: y0 + r * sh,
                x1: x0 + c * sw + sw - 1,
                y1: y0 + r * sh + sh - 1,
                color: r * 4 + c
            })
}

function gridMouse(x0, y0, width, height, hslices, vslices) {
    return inrect(mouse.x, mouse.y, x0, y0, x0 + width, y0 + width) ? {
        x: Math.max(Math.floor((mouse.x - x0) / (width / hslices)), 0),
        y: Math.max(Math.floor((mouse.y - y0) / (height / vslices)), 0)
    } : undefined
}

function onClickSpriteEditor(x0, y0) {
    if (mouse.click) {
        const clickSpot = gridMouse(x0, y0, 64, 64, 8, 8)
        if (clickSpot !== undefined)
            sprite[clickSpot.y * 8 + clickSpot.x] = color
    }
}
function drawPalette() {
    swatches.forEach(s =>
        rectfill(s.x0, s.y0, s.x1, s.y1, s.color)
    )

    const sel = swatches.find(s => s.color == color)
    rect(sel.x0, sel.y0, sel.x1, sel.y1, 0)
    rect(sel.x0 - 1, sel.y0 - 1, sel.x1 + 1, sel.y1 + 1, 7)
}

function onPaletteClick() {
    if (mouse.click) {
        const sw = swatches.find(s => inrect(mouse.x, mouse.y, s.x0, s.y0, s.x1, s.y1))
        if (sw !== undefined) color = sw.color
    }
}

function update() {
    cls()
    rectfill(0, 0, 127, 7, 8)
    pen(7)
    print(`Mouse: ${mouse.x}, ${mouse.y} ${mouse.click?'*':''}`, 1, 1)
    drawPalette()
    spr(64, 9, 8)
    onPaletteClick()
    onClickSpriteEditor(64, 9)
    print(`Color: ${color}`, 0, 64)
}
