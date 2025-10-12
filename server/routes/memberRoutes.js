import express from 'express'
import Member from '../models/Member.js'

const router = express.Router()

// Get all members
router.get('/', async (req, res) => {
  try {
    const members = await Member.find().sort({ createdAt: -1 })
    res.json(members)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get member by ID
router.get('/:id', async (req, res) => {
  try {
    const member = await Member.findById(req.params.id)
    if (!member) {
      return res.status(404).json({ message: 'Member not found' })
    }
    res.json(member)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create new member
router.post('/', async (req, res) => {
  try {
    // Generate membership ID
    const count = await Member.countDocuments()
    const membershipId = `Z2B-${String(count + 1).padStart(5, '0')}`

    const member = new Member({
      ...req.body,
      membershipId,
      referralLink: `https://z2blegacybuilders.co.za/ref/${membershipId}`
    })

    const newMember = await member.save()
    res.status(201).json(newMember)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Update member
router.put('/:id', async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
    if (!member) {
      return res.status(404).json({ message: 'Member not found' })
    }
    res.json(member)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Delete member
router.delete('/:id', async (req, res) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id)
    if (!member) {
      return res.status(404).json({ message: 'Member not found' })
    }
    res.json({ message: 'Member deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
