var x = 64, y = 30

function draw() {
    cls()

    pen(7)
    print("Hello World!", 0, 0)

    pen(15)
    line(0, 64, 127, 127)

    pen(14)
    pset(x, y, 0)
    pset(x - 1, y)
    pset(x + 1, y)
    pset(x, y - 1)
    pset(x, y + 1)

    if (btn(1)) x += 1
    if (btn(0)) x -= 1
    if (btn(2)) y -= 1
    if (btn(3)) y += 1
}