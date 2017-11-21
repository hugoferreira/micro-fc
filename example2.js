var x = 64, y = 30, frame = 0

function update() {
    frame += 1

    /* for (let i = 0; i < 128*128; i += 1)
        poke(i, (i + frame) % 16) */

    pen(7)
    print("Hello World!", 0, 0)

    pen(3)
    line(0, 64, 127, 127)

    pen(1)
    pset(x, y)
    pset(x - 1, y)
    pset(x + 1, y)
    pset(x, y - 1)
    pset(x, y + 1)

    if (btn(1)) x += 1
    if (btn(0)) x -= 1
    if (btn(2)) y -= 1
    if (btn(3)) y += 1
}