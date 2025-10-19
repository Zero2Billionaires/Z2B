import express from 'express'

const router = express.Router()

// Commission rates configuration
const commissionRates = {
  qpb: {
    firstSetRate: 8,        // 8% for first set of 3 sales
    additionalSetRate: 10,  // 10% for each additional set of 3
    requiredSales: 3,       // Must have complete sets of 3
    cycleStart: 4,          // Cycle starts on 4th of month
    cycleEnd: 3             // Cycle ends on 3rd of next month
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
    copper: 30,
    silver: 35,
    gold: 40,
    platinum: 45,
    diamond: 0  // Whitelabel tier - sets own prices, keeps all sales, pays Z2B whitelabel premium only
  },
  tierPrices: {
    fam: 0,
    bronze: 480,
    copper: 999,
    silver: 1480,
    gold: 2980,
    platinum: 4980,
    diamond: 11980  // White-label tier: R11,980/month + 7.5% royalties
  },
  tierPV: {
    fam: 0,        // R0 / 20 = 0 PV
    bronze: 24,    // R480 / 20 = 24 PV
    copper: 50,    // R999 / 20 = 49.95 ≈ 50 PV
    silver: 74,    // R1480 / 20 = 74 PV
    gold: 149,     // R2980 / 20 = 149 PV
    platinum: 249, // R4980 / 20 = 249 PV
    diamond: 599   // R11980 / 20 = 599 PV (members who generate Diamond sales get credited)
  },
  diamondRules: {
    // Diamond tier is WHITE-LABEL - they don't earn from network
    whiteLabel: true,
    ispRate: 0,
    qpbEligible: false,
    tscEligible: false,
    tpbEligible: false,
    tliEligible: false,
    ceoEligible: false,
    maxEarningTier: 'platinum',  // Can earn AS platinum if they maintain platinum qualifications
    monthlyFee: 11980,
    royaltyRate: 7.5  // 7.5% royalties on white-label sales
  }
}

// Helper function: Check if member should earn commission
const shouldEarnCommission = (member, commissionType) => {
  // Diamond tier members don't earn from network (white-label)
  if (member.tier === 'Diamond' || member.tier === 'diamond') {
    return false
  }
  return true
}

// Helper function: Get effective earning tier for member
const getEffectiveEarningTier = (member) => {
  // If Diamond but qualifies as Platinum, calculate as Platinum
  if ((member.tier === 'Diamond' || member.tier === 'diamond') && member.qualifiesAsPlatinum) {
    return 'platinum'
  }

  // Otherwise return actual tier (lowercase for consistency)
  return member.tier?.toLowerCase() || 'fam'
}

// Helper function: Get PV for a tier
const getPVForTier = (tier) => {
  const tierLower = tier?.toLowerCase() || 'fam'
  return commissionRates.tierPV[tierLower] || 0
}

// Helper function: Calculate ISP commission
const calculateISP = (member, saleAmount) => {
  if (!shouldEarnCommission(member, 'ISP')) {
    return 0
  }

  const tier = getEffectiveEarningTier(member)
  const rate = commissionRates.isp[tier] || 0
  return (saleAmount * rate) / 100
}

// Helper function: Check if eligible for QPB
const isQPBEligible = (member) => {
  if (!shouldEarnCommission(member, 'QPB')) {
    return false
  }
  return true
}

// Helper function: Check if eligible for TSC
const isTSCEligible = (member) => {
  if (!shouldEarnCommission(member, 'TSC')) {
    return false
  }
  return true
}

// Helper function: Check if eligible for TPB
const isTPBEligible = (member) => {
  if (!shouldEarnCommission(member, 'TPB')) {
    return false
  }
  return true
}

// Helper function: Check if eligible for TLI
const isTLIEligible = (member) => {
  if (!shouldEarnCommission(member, 'TLI')) {
    return false
  }
  return true
}

// Helper function: Check if eligible for CEO awards
const isCEOEligible = (member) => {
  if (!shouldEarnCommission(member, 'CEO')) {
    return false
  }
  return true
}

router.get('/rates', (req, res) => {
  res.json(commissionRates)
})

router.put('/rates', (req, res) => {
  // Update commission rates
  Object.assign(commissionRates, req.body)
  res.json(commissionRates)
})

// New endpoint: Check commission eligibility
router.post('/check-eligibility', (req, res) => {
  const { member, commissionType } = req.body

  const eligibility = {
    isEligible: shouldEarnCommission(member, commissionType),
    effectiveTier: getEffectiveEarningTier(member),
    isDiamond: member.tier === 'Diamond' || member.tier === 'diamond',
    reason: null
  }

  if (!eligibility.isEligible) {
    eligibility.reason = 'Diamond tier members (White-label) do not earn from network commissions'
  }

  res.json(eligibility)
})

// New endpoint: Calculate commission
router.post('/calculate', (req, res) => {
  const { member, saleAmount, commissionType } = req.body

  let commission = 0
  let details = {
    eligible: true,
    tier: getEffectiveEarningTier(member),
    rate: 0,
    reason: null
  }

  switch (commissionType) {
    case 'ISP':
      if (shouldEarnCommission(member, 'ISP')) {
        commission = calculateISP(member, saleAmount)
        details.rate = commissionRates.isp[details.tier]
      } else {
        details.eligible = false
        details.reason = 'Diamond tier (White-label) - No ISP commission'
      }
      break

    case 'QPB':
      if (!isQPBEligible(member)) {
        details.eligible = false
        details.reason = 'Diamond tier (White-label) - No QPB commission'
      }
      break

    case 'TSC':
      if (!isTSCEligible(member)) {
        details.eligible = false
        details.reason = 'Diamond tier (White-label) - No TSC commission'
      }
      break

    case 'TPB':
      if (!isTPBEligible(member)) {
        details.eligible = false
        details.reason = 'Diamond tier (White-label) - No TPB commission'
      }
      break

    case 'TLI':
      if (!isTLIEligible(member)) {
        details.eligible = false
        details.reason = 'Diamond tier (White-label) - No TLI eligibility'
      }
      break

    case 'CEO':
      if (!isCEOEligible(member)) {
        details.eligible = false
        details.reason = 'Diamond tier (White-label) - No CEO awards eligibility'
      }
      break
  }

  res.json({
    commission,
    details,
    isDiamond: member.tier === 'Diamond' || member.tier === 'diamond'
  })
})

// New endpoint: Get PV for a tier
router.get('/pv/:tier', (req, res) => {
  const tier = req.params.tier
  const pv = getPVForTier(tier)
  const price = commissionRates.tierPrices[tier.toLowerCase()] || 0

  res.json({
    tier,
    price,
    pv,
    formula: 'PV = Price ÷ 20 (rounded to nearest unit)'
  })
})

// New endpoint: Get all tier PV values
router.get('/pv', (req, res) => {
  const allTierPV = Object.keys(commissionRates.tierPV).map(tier => ({
    tier,
    price: commissionRates.tierPrices[tier],
    pv: commissionRates.tierPV[tier]
  }))

  res.json({
    formula: 'PV = Price ÷ 20 (rounded to nearest unit)',
    tiers: allTierPV
  })
})

// New endpoint: Allocate PV for a sale (including Diamond sales)
router.post('/allocate-pv', async (req, res) => {
  const { memberId, tierSold } = req.body

  try {
    const Member = (await import('../models/Member.js')).default
    const member = await Member.findById(memberId)

    if (!member) {
      return res.status(404).json({ error: 'Member not found' })
    }

    // Get PV for the tier sold (works for all tiers including Diamond)
    const pvToAllocate = getPVForTier(tierSold)

    // Add PV to member's account
    member.pv = (member.pv || 0) + pvToAllocate
    await member.save()

    res.json({
      success: true,
      memberId: member._id,
      memberName: member.fullName,
      tierSold,
      pvAllocated: pvToAllocate,
      totalPV: member.pv,
      message: `${pvToAllocate} PV allocated for ${tierSold} sale`
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
