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
                x: x0 + c * sw,
                y: y0 + r * sh,
                x1: x0 + c * sw + sw - 1,
                y1: y0 + r * sh + sh - 1,
                color: r * 4 + c
            })
}

function inbound(x, y, x0, y0, x1, y1) {
    return (x >= x0 && x <= x1 && y >= y0 && y <= y1)
}

function drawPalette() {
    swatches.forEach(s => rectfill(s.x, s.y, s.x1, s.y1, s.color))
    if (mouse.click) {
        const sw = swatches.find(s => inbound(mouse.x, mouse.y, s.x, s.y, s.x1, s.y1))
        if (sw !== undefined) color = sw.color
    }

    const sel = swatches.find(s => s.color == color)
    rect(sel.x, sel.y, sel.x1, sel.y1, 0)
    rect(sel.x - 1, sel.y - 1, sel.x1 + 1, sel.y1 + 1, 7)
}

function update() {
    cls()
    rectfill(0, 0, 127, 7, 8)
    print("Mouse: " + mouse.x + ", " + mouse.y + " (" + (mouse.click?"1":"0") + ")", 1, 1, 7)
    drawPalette()
    print("Color: " + color, 0, 64, 7)
}
