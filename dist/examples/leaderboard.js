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

const newStar = () => ({ pos: [rnd(width), rnd(height)], color: rnd(15), speed: Math.random() + 0.1 })

function init() {
    for (let i = 0; i < nStars; i += 1) 
        stars.push(newStar())
}

function update() {
    for (const s of stars) {
        s.pos[1] -= s.speed
        if (s.pos[1] < 0) {
            s.pos[0] = rnd(width)
            s.pos[1] = height
        }
    }
}

const place = (i) => `${i.toString()}${(i === 1) ? 'ST' : ((i === 2) ? 'ND' : (i === 3) ? 'RD' : 'TH')}`

function draw() {
    cls()
    pen(15)

    for (const s of stars) {
        pset(Math.floor(s.pos[0]), Math.floor(s.pos[1]), s.color)
        pset(Math.floor(s.pos[0] + 1), Math.floor(s.pos[1]), s.color)
        pset(Math.floor(s.pos[0]), Math.floor(s.pos[1] + 1), s.color)
        pset(Math.floor(s.pos[0] + 1), Math.floor(s.pos[1] + 1), s.color)
    }

    const y = 15
    print('RANK', 0, y)
    printc('USER', width / 2, y)
    printr('SCORE', width, y)

    for (let i = 0, y = 34; i < users.length; i += 1, y += 9) {
        const name = users[i][0].toUpperCase()
        const score = users[i][1].toString()
        const color = Math.floor(i / 2) + 7

        pen(color)

        print(place(i + 1), 0, y)
        printc(name, width / 2, y)
        printr(score, width, y)
    }
}