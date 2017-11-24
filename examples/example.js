let x = 64, y = 30
let xdir = 1
let ydir = 1

function init() {
}

function update() {
    if (x > 127) { beep(400); xdir = -1 }
    else if (x == 0)  { beep(400); xdir = 1  }

    if (y > 127) { beep(440); ydir = -2 }
    else if (y == 0)  { beep(440); ydir = 2 }

    x += xdir
    y += ydir
}

function draw() {
    cls(1)
    pset(x, y, 15)
}