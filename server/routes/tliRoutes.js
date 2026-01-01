import express from 'express'
import Member from '../models/Member.js'

const router = express.Router()

// TLI Levels Configuration with Silver+ Percentage Requirements
const TLI_LEVELS = [
  { level: 1, name: 'Ignite Pathfinder 🔥', pv: 50, reward: 600, requiredInvites: 2, requiredInviteLevel: 'active', silverPlusPercent: 0 },
  { level: 2, name: 'Guardian of Growth 🌱', pv: 150, reward: 1500, requiredInvites: 2, requiredInviteLevel: 1, silverPlusPercent: 0 },
  { level: 3, name: 'Cash Catalyst 💰', pv: 300, reward: 3000, requiredInvites: 2, requiredInviteLevel: 2, silverPlusPercent: 0 },
  { level: 4, name: 'Freedom Architect 🏛️', pv: 1500, reward: 15000, requiredInvites: 2, requiredInviteLevel: 3, silverPlusPercent: 0 },
  { level: 5, name: 'Lifestyle Ambassador ✈️', pv: 3000, reward: 30000, requiredInvites: 2, requiredInviteLevel: 4, silverPlusPercent: 0 },
  { level: 6, name: 'Mama I Made It 🚗', pv: 15000, reward: 150000, requiredInvites: 3, requiredInviteLevel: 5, silverPlusPercent: 10 },
  { level: 7, name: 'Estate Pioneer 🏠', pv: 40000, reward: 375000, requiredInvites: 3, requiredInviteLevel: 6, silverPlusPercent: 15 },
  { level: 8, name: 'Capital Visionary 💼', pv: 80000, reward: 600000, requiredInvites: 3, requiredInviteLevel: 7, silverPlusPercent: 20 },
  { level: 9, name: 'Mega Estate Builder 🏰', pv: 100000, reward: 750000, requiredInvites: 3, requiredInviteLevel: 8, silverPlusPercent: 30 },
  { level: 10, name: 'Titan Capitalist 💎', pv: 200000, reward: 1500000, requiredInvites: 3, requiredInviteLevel: 9, silverPlusPercent: 35 },
  { level: 11, name: 'Billionaire Legacy Builder 👑', pv: 700000, reward: 5000000, requiredInvites: 3, requiredInviteLevel: 10, silverPlusPercent: 40 }
]

// Get all TLI levels
router.get('/levels', (req, res) => {
  res.json({
    success: true,
    levels: TLI_LEVELS
  })
})

// Check TLI qualification for a member
router.post('/check-qualification', async (req, res) => {
  try {
    const { memberId, level } = req.body

    if (!memberId || !level) {
      return res.status(400).json({ error: 'Member ID and level are required' })
    }

    const member = await Member.findById(memberId)

    if (!member) {
      return res.status(404).json({ error: 'Member not found' })
    }

    // Find the TLI level config
    const tliLevel = TLI_LEVELS.find(l => l.level === level)

    if (!tliLevel) {
      return res.status(404).json({ error: 'TLI level not found' })
    }

    // Diamond tier members don't qualify for TLI (white-label)
    if (member.tier === 'Diamond' || member.tier === 'diamond') {
      return res.json({
        qualified: false,
        reason: 'Diamond tier (White-label) members do not qualify for TLI',
        checks: {
          isDiamond: true
        }
      })
    }

    // Calculate team composition if not already done
    if (!member.teamComposition || !member.teamComposition.lastUpdated ||
        (Date.now() - new Date(member.teamComposition.lastUpdated).getTime()) > 86400000) {
      // Update if older than 24 hours
      await member.calculateTeamComposition()
    }

    const composition = member.teamComposition

    // Run all qualification checks
    const checks = {
      pvCheck: {
        required: tliLevel.pv,
        current: member.pv || 0,
        passed: (member.pv || 0) >= tliLevel.pv
      },
      silverPlusCheck: {
        required: tliLevel.silverPlusPercent,
        current: composition.silverPlusPercentage || 0,
        teamSize: composition.totalMembers || 0,
        silverPlusCount: (composition.tierCounts?.Silver || 0) +
                        (composition.tierCounts?.Gold || 0) +
                        (composition.tierCounts?.Platinum || 0) +
                        (composition.tierCounts?.Diamond || 0),
        passed: (composition.silverPlusPercentage || 0) >= tliLevel.silverPlusPercent
      },
      teamSizeCheck: {
        required: 1,
        current: composition.totalMembers || 0,
        passed: (composition.totalMembers || 0) >= 1
      }
    }

    // For levels requiring previous level qualification, check invites at that level
    if (tliLevel.requiredInviteLevel !== 'active') {
      // This would require tracking which members are at which TLI level
      // For now, we'll check if they have the required direct referrals
      const directReferrals = await Member.find({ sponsorId: member._id })

      checks.invitesCheck = {
        required: tliLevel.requiredInvites,
        current: directReferrals.length,
        atPreviousLevel: 0, // Would need to track member TLI levels
        passed: directReferrals.length >= tliLevel.requiredInvites
      }
    }

    // Determine overall qualification
    const allChecksPassed = Object.values(checks).every(check => check.passed !== false)

    // Build qualification response
    const response = {
      qualified: allChecksPassed,
      level: tliLevel.level,
      levelName: tliLevel.name,
      reward: tliLevel.reward,
      checks,
      teamComposition: {
        total: composition.totalMembers,
        tierBreakdown: composition.tierCounts,
        silverPlusPercentage: composition.silverPlusPercentage,
        tierPercentages: composition.tierPercentages
      }
    }

    // Add failure reason if not qualified
    if (!allChecksPassed) {
      const failedChecks = []

      if (checks.pvCheck && !checks.pvCheck.passed) {
        failedChecks.push(`Need ${tliLevel.pv - (member.pv || 0)} more PV (have ${member.pv || 0}, need ${tliLevel.pv})`)
      }

      if (checks.silverPlusCheck && !checks.silverPlusCheck.passed) {
        failedChecks.push(
          `Need ${tliLevel.silverPlusPercent}% Silver+ builders (currently ${composition.silverPlusPercentage || 0}% - ${checks.silverPlusCheck.silverPlusCount}/${composition.totalMembers} members)`
        )
      }

      if (checks.teamSizeCheck && !checks.teamSizeCheck.passed) {
        failedChecks.push('Need to build a team first')
      }

      if (checks.invitesCheck && !checks.invitesCheck.passed) {
        failedChecks.push(`Need ${tliLevel.requiredInvites - checks.invitesCheck.current} more direct referrals at previous TLI level`)
      }

      response.failureReasons = failedChecks
    }

    res.json(response)

  } catch (error) {
    console.error('TLI qualification check error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get member's highest qualified TLI level
router.get('/highest-qualification/:memberId', async (req, res) => {
  try {
    const { memberId } = req.params

    const member = await Member.findById(memberId)

    if (!member) {
      return res.status(404).json({ error: 'Member not found' })
    }

    // Diamond tier check
    if (member.tier === 'Diamond' || member.tier === 'diamond') {
      return res.json({
        highestLevel: 0,
        levelName: 'Not Eligible',
        reason: 'Diamond tier (White-label) members do not qualify for TLI',
        totalPotentialReward: 0
      })
    }

    // Calculate team composition
    await member.calculateTeamComposition()

    let highestQualifiedLevel = 0
    let totalRewards = 0
    const qualifiedLevels = []

    // Check each level in order
    for (const tliLevel of TLI_LEVELS) {
      // PV check
      if ((member.pv || 0) < tliLevel.pv) break

      // Silver+ percentage check
      if ((member.teamComposition.silverPlusPercentage || 0) < tliLevel.silverPlusPercent) break

      // Team size check
      if ((member.teamComposition.totalMembers || 0) < 1 && tliLevel.level > 1) break

      // If all checks pass
      highestQualifiedLevel = tliLevel.level
      totalRewards += tliLevel.reward
      qualifiedLevels.push({
        level: tliLevel.level,
        name: tliLevel.name,
        reward: tliLevel.reward
      })
    }

    const highestLevel = TLI_LEVELS.find(l => l.level === highestQualifiedLevel)

    res.json({
      highestLevel: highestQualifiedLevel,
      levelName: highestLevel ? highestLevel.name : 'Not Qualified',
      totalPotentialReward: totalRewards,
      qualifiedLevels,
      memberPV: member.pv || 0,
      teamComposition: member.teamComposition
    })

  } catch (error) {
    console.error('Highest qualification check error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Update member team composition (can be called periodically)
router.post('/update-team-composition/:memberId', async (req, res) => {
  try {
    const { memberId } = req.params

    const member = await Member.findById(memberId)

    if (!member) {
      return res.status(404).json({ error: 'Member not found' })
    }

    const composition = await member.calculateTeamComposition()

    res.json({
      success: true,
      message: 'Team composition updated',
      composition
    })

  } catch (error) {
    console.error('Team composition update error:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router
