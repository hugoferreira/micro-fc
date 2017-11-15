var x = 64, y = 64

function update() {
    cls(1)
    line(0, 64, 127, 127, 3)
    pset(x, y, 14)

    if (btn(1)) x += 1
    if (btn(0)) x -= 1
    if (btn(2)) y -= 1
    if (btn(3)) y += 1

    // Rainbow test
    /* for (let y = 0; y < 128; y += 1)
        for (let x = 0; x < 128; x += 1)
            pset(x, y, (x) % 16) */
}
