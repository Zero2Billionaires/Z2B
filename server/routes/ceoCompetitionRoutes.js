import express from 'express'
import CEOCompetition from '../models/CEOCompetition.js'
import Member from '../models/Member.js'

const router = express.Router()

// GET all competitions (with filters)
router.get('/', async (req, res) => {
  try {
    const { status, quarter, year, active } = req.query
    const query = {}

    if (status) query.status = status
    if (quarter) query.quarter = quarter
    if (year) query.year = parseInt(year)

    // Special filter for active competitions
    if (active === 'true') {
      const now = new Date()
      query.status = 'active'
      query.startDate = { $lte: now }
      query.endDate = { $gte: now }
    }

    const competitions = await CEOCompetition.find(query)
      .sort({ startDate: -1 })
      .populate('participants.memberId', 'fullName membershipNumber tier')
      .populate('winners.memberId', 'fullName membershipNumber tier')

    res.json({
      success: true,
      count: competitions.length,
      competitions
    })
  } catch (error) {
    console.error('Error fetching competitions:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch competitions',
      error: error.message
    })
  }
})

// GET single competition by ID
router.get('/:id', async (req, res) => {
  try {
    const competition = await CEOCompetition.findById(req.params.id)
      .populate('participants.memberId', 'fullName membershipNumber tier email')
      .populate('winners.memberId', 'fullName membershipNumber tier email')

    if (!competition) {
      return res.status(404).json({
        success: false,
        message: 'Competition not found'
      })
    }

    res.json({
      success: true,
      competition
    })
  } catch (error) {
    console.error('Error fetching competition:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch competition',
      error: error.message
    })
  }
})

// GET leaderboard for a competition
router.get('/:id/leaderboard', async (req, res) => {
  try {
    const { limit = 10 } = req.query
    const competition = await CEOCompetition.findById(req.params.id)

    if (!competition) {
      return res.status(404).json({
        success: false,
        message: 'Competition not found'
      })
    }

    const leaderboard = competition.getLeaderboard(parseInt(limit))

    res.json({
      success: true,
      leaderboard,
      competition: {
        id: competition._id,
        title: competition.title,
        targetValue: competition.targetValue,
        targetType: competition.targetType,
        endDate: competition.endDate,
        status: competition.status
      }
    })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard',
      error: error.message
    })
  }
})

// CREATE new competition (CEO/Admin only)
router.post('/', async (req, res) => {
  try {
    const competitionData = req.body

    // Validate required fields
    if (!competitionData.title || !competitionData.description || !competitionData.targetType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, description, targetType'
      })
    }

    // Auto-calculate quarter and year if not provided
    if (!competitionData.quarter || !competitionData.year) {
      const startDate = new Date(competitionData.startDate)
      const month = startDate.getMonth() + 1
      competitionData.year = startDate.getFullYear()

      if (month <= 3) competitionData.quarter = 'Q1'
      else if (month <= 6) competitionData.quarter = 'Q2'
      else if (month <= 9) competitionData.quarter = 'Q3'
      else competitionData.quarter = 'Q4'
    }

    // Calculate total prize pool
    let totalPrizePool = 0
    if (competitionData.prizes?.first?.amount) totalPrizePool += competitionData.prizes.first.amount
    if (competitionData.prizes?.second?.amount) totalPrizePool += competitionData.prizes.second.amount
    if (competitionData.prizes?.third?.amount) totalPrizePool += competitionData.prizes.third.amount
    if (competitionData.prizes?.additionalPrizes) {
      competitionData.prizes.additionalPrizes.forEach(prize => {
        totalPrizePool += prize.amount || 0
      })
    }
    competitionData.totalPrizePool = totalPrizePool

    const competition = new CEOCompetition(competitionData)
    await competition.save()

    res.status(201).json({
      success: true,
      message: 'Competition created successfully',
      competition
    })
  } catch (error) {
    console.error('Error creating competition:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create competition',
      error: error.message
    })
  }
})

// UPDATE competition (CEO/Admin only)
router.put('/:id', async (req, res) => {
  try {
    const competition = await CEOCompetition.findById(req.params.id)

    if (!competition) {
      return res.status(404).json({
        success: false,
        message: 'Competition not found'
      })
    }

    // Prevent editing completed competitions
    if (competition.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit completed competitions'
      })
    }

    // Update fields
    const allowedUpdates = [
      'title', 'description', 'targetType', 'targetValue', 'targetDescription',
      'startDate', 'endDate', 'eligibility', 'prizes'
    ]

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        competition[field] = req.body[field]
      }
    })

    // Recalculate total prize pool
    let totalPrizePool = 0
    if (competition.prizes?.first?.amount) totalPrizePool += competition.prizes.first.amount
    if (competition.prizes?.second?.amount) totalPrizePool += competition.prizes.second.amount
    if (competition.prizes?.third?.amount) totalPrizePool += competition.prizes.third.amount
    if (competition.prizes?.additionalPrizes) {
      competition.prizes.additionalPrizes.forEach(prize => {
        totalPrizePool += prize.amount || 0
      })
    }
    competition.totalPrizePool = totalPrizePool

    await competition.save()

    res.json({
      success: true,
      message: 'Competition updated successfully',
      competition
    })
  } catch (error) {
    console.error('Error updating competition:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update competition',
      error: error.message
    })
  }
})

// PUBLISH competition (changes status to published)
router.post('/:id/publish', async (req, res) => {
  try {
    const competition = await CEOCompetition.findById(req.params.id)

    if (!competition) {
      return res.status(404).json({
        success: false,
        message: 'Competition not found'
      })
    }

    if (competition.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft competitions can be published'
      })
    }

    // Check if start date is in the future or now
    const now = new Date()
    if (competition.startDate <= now) {
      competition.status = 'active'
    } else {
      competition.status = 'published'
    }

    competition.publishedAt = new Date()
    await competition.save()

    res.json({
      success: true,
      message: `Competition ${competition.status === 'active' ? 'activated' : 'published'} successfully`,
      competition
    })
  } catch (error) {
    console.error('Error publishing competition:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to publish competition',
      error: error.message
    })
  }
})

// ACTIVATE competition (for published competitions that reach start date)
router.post('/:id/activate', async (req, res) => {
  try {
    const competition = await CEOCompetition.findById(req.params.id)

    if (!competition) {
      return res.status(404).json({
        success: false,
        message: 'Competition not found'
      })
    }

    if (competition.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Only published competitions can be activated'
      })
    }

    competition.status = 'active'
    await competition.save()

    res.json({
      success: true,
      message: 'Competition activated successfully',
      competition
    })
  } catch (error) {
    console.error('Error activating competition:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to activate competition',
      error: error.message
    })
  }
})

// FINALIZE competition and select winners
router.post('/:id/finalize', async (req, res) => {
  try {
    const competition = await CEOCompetition.findById(req.params.id)

    if (!competition) {
      return res.status(404).json({
        success: false,
        message: 'Competition not found'
      })
    }

    const winners = await competition.finalizeCompetition()

    res.json({
      success: true,
      message: 'Competition finalized successfully',
      winners,
      competition
    })
  } catch (error) {
    console.error('Error finalizing competition:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to finalize competition',
      error: error.message
    })
  }
})

// UPDATE participant progress (for manual updates or system tracking)
router.post('/:id/update-progress', async (req, res) => {
  try {
    const { memberId, progress } = req.body
    const competition = await CEOCompetition.findById(req.params.id)

    if (!competition) {
      return res.status(404).json({
        success: false,
        message: 'Competition not found'
      })
    }

    if (!competition.isActive()) {
      return res.status(400).json({
        success: false,
        message: 'Competition is not active'
      })
    }

    await competition.updateParticipantProgress(memberId, progress)

    res.json({
      success: true,
      message: 'Progress updated successfully',
      competition
    })
  } catch (error) {
    console.error('Error updating progress:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update progress',
      error: error.message
    })
  }
})

// UPDATE winner payment status
router.put('/:id/winners/:position/payment', async (req, res) => {
  try {
    const { status } = req.body
    const competition = await CEOCompetition.findById(req.params.id)

    if (!competition) {
      return res.status(404).json({
        success: false,
        message: 'Competition not found'
      })
    }

    const winner = competition.winners.find(w => w.position === parseInt(req.params.position))

    if (!winner) {
      return res.status(404).json({
        success: false,
        message: 'Winner not found'
      })
    }

    winner.paymentStatus = status
    await competition.save()

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      winner
    })
  } catch (error) {
    console.error('Error updating payment status:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update payment status',
      error: error.message
    })
  }
})

// DELETE competition (only drafts can be deleted)
router.delete('/:id', async (req, res) => {
  try {
    const competition = await CEOCompetition.findById(req.params.id)

    if (!competition) {
      return res.status(404).json({
        success: false,
        message: 'Competition not found'
      })
    }

    if (competition.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft competitions can be deleted'
      })
    }

    await CEOCompetition.findByIdAndDelete(req.params.id)

    res.json({
      success: true,
      message: 'Competition deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting competition:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete competition',
      error: error.message
    })
  }
})

// GET member's participation in competitions
router.get('/member/:memberId', async (req, res) => {
  try {
    const competitions = await CEOCompetition.find({
      'participants.memberId': req.params.memberId,
      status: { $in: ['active', 'published', 'completed'] }
    }).sort({ startDate: -1 })

    res.json({
      success: true,
      count: competitions.length,
      competitions
    })
  } catch (error) {
    console.error('Error fetching member competitions:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch member competitions',
      error: error.message
    })
  }
})

export default router
