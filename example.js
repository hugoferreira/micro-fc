var x = 64, y = 30, frame = 0
var xdir = 1
var ydir = 1

function update() {
    frame += 1

    prt("o", x, y, frame % 16)

    if (x > 128 - fontWidth - 1) xdir = -1
    else if (x == 0) xdir = 1

    if (y > 128 - fontHeight) ydir = -1
    else if (y == 0) ydir = 1

    x += xdir
    y += ydir

    if (mouse.click) pset(mouse.x, mouse.y, 15)
}