var x = 64, y = 30, frame = 0

function update() {
    frame += 1

    for (let i = 0; i < 128*128; i += 1)
        poke(i, (i + frame) % 16)

    line(0, 64, 127, 127, 3)
    pset(x, y, 14)

    if (btn(1)) x += 1
    if (btn(0)) x -= 1
    if (btn(2)) y -= 1
    if (btn(3)) y += 1
}