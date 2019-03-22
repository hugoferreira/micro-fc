const users = [
    ['BYTTER', 999],
    ['DOMINGUESGM', 123],
    ['MAFALDA', 120],
    ['JPDIAS', 115],
    ['MIGUEL', 110],
    ['rfgamaral', 69],
    ['benjamimalves', 67],
    ['killmaster', 67],
    ['xhip', 62],
    ['bacitoto', 61],
    ['joanarijo', 61],
    ['tiagoad', 61]
]

const stars = []
const nStars = 32

const newStar = () => ({ pos: [Math.random() * width, Math.random() * height], color: Math.random() * 15, speed: Math.random() + 0.1 })

function init() {
    for (let i = 0; i < nStars; i += 1) {
        stars.push(newStar())
    }    
}

function update() {
    for (const s of stars) {
        s.pos[1] = s.pos[1] - s.speed
        if (s.pos[1] < 0) {
            s.pos[0] = Math.random() * width
            s.pos[1] = height
        }
    }
}

function draw() {
    cls()

    for (const s of stars) {
        pset(Math.floor(s.pos[0]), Math.floor(s.pos[1]), Math.floor(s.color))
    }   

    print('RANK', 5, 5)
    print('USER', width / 2 - 2 * fontWidth, 5)
    print('SCORE', width - 6 * 5, 5)

    const startY = 24
    for (let i = 0; i < users.length; i += 1) {
        const name = users[i][0].toUpperCase()
        const score = users[i][1].toString()
        const color = Math.floor(i / 2) + 7

        print((i + 1).toString(), 5, 8 * i + startY, pen = color)
        print(name, (width / 2) - (name.length * fontWidth) / 2, 8 * i + startY, pen = color)
        print(score, width - score.length * fontWidth, 8 * i + startY, pen = color)
    }
}