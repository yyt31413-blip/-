import { initialItems } from '../../src/data/stationery.js'

// Hand-placed centers in the actual 1000 × 625 desk, using the ten real item sizes.
// Each row is [centerX, centerY, rotation]. These fixtures are research examples,
// not a training set or guaranteed user outcome.
const layouts = {
  visual: {
    laptop: [175, 140, 0], phone: [410, 140, 0], book: [640, 140, 0], notebook: [855, 140, 0],
    pen: [175, 340, 0], ruler: [410, 340, 0], cup: [640, 340, 0], headphones: [855, 340, 0],
    eraser: [410, 535, 0], notes: [640, 535, 0],
  },
  categorical: {
    laptop: [155, 140, 0], phone: [315, 120, 0], headphones: [260, 240, 0],
    pen: [730, 120, 0], ruler: [865, 150, 0], eraser: [810, 260, 0],
    book: [165, 470, 0], notebook: [345, 470, 0], notes: [270, 560, 0], cup: [800, 510, 0],
  },
  functional: {
    laptop: [170, 135, 0], phone: [455, 480, 0], book: [700, 120, 0], notebook: [870, 150, 0],
    pen: [550, 505, 0], ruler: [170, 330, 0], cup: [795, 350, 0], headphones: [520, 165, 0],
    eraser: [870, 520, 0], notes: [635, 470, 0],
  },
  personal: {
    laptop: [165, 145, 0], phone: [340, 145, 0], book: [720, 140, 90], pen: [865, 155, 90],
    notebook: [185, 465, 180], ruler: [360, 480, 180], eraser: [335, 545, 180],
    notes: [620, 480, 270], headphones: [790, 455, 270], cup: [925, 515, 270],
  },
  dynamic: {
    laptop: [180, 145, 0], book: [200, 155, 15], cup: [290, 185, 30],
    phone: [720, 145, 120], notebook: [735, 155, 135], pen: [800, 190, 150],
    ruler: [160, 465, 240], headphones: [180, 455, 255], notes: [255, 480, 270], eraser: [260, 530, 225],
  },
  lowAttention: {
    laptop: [170, 130, 15], phone: [450, 100, 100], book: [770, 115, 180], notebook: [880, 345, 305],
    pen: [115, 365, 140], ruler: [425, 300, 275], cup: [680, 350, 45], headphones: [170, 525, 330],
    eraser: [465, 555, 195], notes: [765, 550, 75],
  },
}

export const typeValidationDesks = Object.fromEntries(Object.entries(layouts).map(([id, positions]) => [
  id,
  initialItems.map((item) => {
    const [centerX, centerY, rotation] = positions[item.id]
    return { ...item, x: centerX - item.width / 2, y: centerY - item.height / 2, rotation }
  }),
]))
