let x = 64, y = 30
let xdir = 1
let ydir = 1

function init() {
    border(1)
    cls(1)

    sset(0, 2, 3, 15)
    sset(0, 3, 3, 15)
    sset(0, 4, 3, 15)
    sset(0, 3, 2, 15)
    sset(0, 3, 4, 15)
}

function update() {
    if (x > 128 - 13) { beep(400); xdir = -1 }
    else if (x == 0)  { beep(400); xdir = 1  }

    if (y > 128 - 13) { beep(440); ydir = -1 }
    else if (y == 0)  { beep(440); ydir = 1 }

    x += xdir
    y += ydir
}

function draw() {
    rectfill(20, 20, 80, 80, 12)
    spr(0, x, y)
}