let x = 64, y = 30, frame = 0
let xdir = 1
let ydir = 1

function init() {
    border(1)
    cls(1)
}

function update() {
    frame += 1

    if (x > 128 - fontWidth - 1) xdir = -1
    else if (x == 0) xdir = 1

    if (y > 128 - fontHeight) ydir = -1
    else if (y == 0) ydir = 1

    x += xdir
    y += ydir

    if (mouse.click) pset(mouse.x, mouse.y, 15)
}

function draw() {
    rectfill(20, 20, 80, 80, 12)
    print("o", x, y, frame % 16)
}