function init() {
    border(1)
    
    decodeSprite([
        0x11111111, 0x11111111, 0x11111111, 0x11111111,
        0x11111111, 0x11111111, 0x11111111, 0x11111111,
    ], 0)

    decodeSprite([
        0x10101010, 0x01010101, 0x10101010, 0x01010101,
        0x10101010, 0x01010101, 0x10101010, 0x01010101,
    ], 1)
}

function draw() {
    cls()
    pal()

    for (y = 0; y < 16; y += 1) {
        for (x = y; x < 16; x += 1) {
            pal(1, x)
            spr(0, x*8, y*8)
            pal(1, y)
            spr(1, x*8, y*8)
        }

        pen(15)
        print(y.toString(), x*8+2, y*8+2)
    }
}