import express from 'express'

const router = express.Router()

// Commission rates configuration
const commissionRates = {
  qpb: {
    base: 120,
    additional: 200,
    tierBonus: 5
  },
  tsc: {
    bronze: [10, 6, 4],
    silver: [10, 6, 4, 3, 2],
    gold: [10, 6, 4, 3, 2, 1, 1],
    platinum: [10, 6, 4, 3, 2, 1, 1, 1, 1, 1]
  },
  tpb: {
    poolPercentage: 10,
    perGeneration: 1
  },
  isp: {
    fam: 20,
    bronze: 25,
    silver: 30,
    gold: 35,
    platinum: 40,
    diamond: 45
  }
}

router.get('/rates', (req, res) => {
  res.json(commissionRates)
})

router.put('/rates', (req, res) => {
  // Update commission rates
  Object.assign(commissionRates, req.body)
  res.json(commissionRates)
})

export default router
