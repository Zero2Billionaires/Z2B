import express from 'express'

const router = express.Router()

const tiers = [
  { id: 'fam', name: 'FAM Member', price: 0, pv: 0, isp: 20, tsc: 0, tpb: 0 },
  { id: 'bronze', name: 'Bronze Legacy', price: 480, pv: 100, isp: 25, tsc: 3, tpb: 2 },
  { id: 'silver', name: 'Silver Legacy', price: 1480, pv: 300, isp: 30, tsc: 5, tpb: 4 },
  { id: 'gold', name: 'Gold Legacy', price: 2980, pv: 600, isp: 35, tsc: 7, tpb: 6 },
  { id: 'platinum', name: 'Platinum Legacy', price: 4980, pv: 1000, isp: 40, tsc: 10, tpb: 10 },
  { id: 'diamond', name: 'Diamond Legacy', price: 'Custom', pv: 'Custom', isp: 'Custom', tsc: 'Custom', tpb: 'Custom' }
]

router.get('/', (req, res) => {
  res.json(tiers)
})

export default router
