let xdir = 1
let ydir = 1

class Ball {
    constructor(x, y, xdir, ydir) {
        this.x = x
        this.y = y
        this.xdir = xdir
        this.ydir = ydir
    }

    update() {
        if (this.x >= (width - 8) || this.x <= 0) this.xdir = -this.xdir
        if (this.y >= (height - 8) || this.y <= 0) this.ydir = -this.ydir

        this.x += this.xdir
        this.y += this.ydir
    }

    draw() {
        spr(0, this.x, this.y, 1, 5)
    }
}

let balls = []

function init() {
    decodeSprite([0x50005555, 0x0DDB0555, 0x0DDD0555, 0x0DDD0555, 0x50005555, 0x55555555, 0x55555555, 0x55555555], 0)
    for (let i = 0; i < 16; i += 1)
        balls.push(new Ball(rnd(120), rnd(120), rnd(6) - 3, rnd(6) - 3))
}

function update() {
    balls.forEach(b => b.update())
}

function draw() {
    cls(1)
    balls.forEach(b => b.draw())
}