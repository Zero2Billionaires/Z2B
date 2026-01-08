const express = require('express');
const router = express.Router();
const Milestone1Lead = require('../models/Milestone1Lead');
const emailService = require('../utils/emailService');
const whatsappService = require('../utils/whatsappService');

// ============================================
// ENDPOINT 1: Milestone 1 Opt-In
// ============================================
// Purpose: Capture prospect details from landing page
// Route: POST /api/milestone1-optin
// ============================================

router.post('/milestone1-optin', async (req, res) => {
  try {
    const { fullName, email, whatsapp, currentSituation, biggestFrustration } = req.body;

    // 1. Validate required fields
    if (!fullName || !email || !whatsapp || !currentSituation || !biggestFrustration) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    // 2. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // 3. Validate biggest frustration (minimum 10 characters)
    if (biggestFrustration.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Please provide more detail about your biggest frustration (minimum 10 characters)'
      });
    }

    // 4. Check if email already exists
    const existingLead = await Milestone1Lead.findOne({ email: email.toLowerCase() });
    if (existingLead) {
      // User already opted in - still return success
      console.log(`Duplicate opt-in attempt: ${email}`);
      return res.status(200).json({
        success: true,
        message: 'Welcome back! Redirecting to Milestone 1.',
        email: email,
        isExisting: true
      });
    }

    // 5. Create new lead in database
    const newLead = new Milestone1Lead({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      whatsapp: whatsapp.trim(),
      currentSituation,
      biggestFrustration: biggestFrustration.trim(),
      submittedAt: new Date(),
      source: 'landing-page',
      status: 'new',
      milestone1Complete: false,
      bronzeUpsellShown: false,
      bronzeUpsellDecision: 'pending',
      emailSent: false,
      whatsappSent: false
    });

    await newLead.save();
    console.log(`New Milestone 1 lead created: ${email}`);

    // 6. Send confirmation email (async, don't wait)
    emailService.sendMilestone1Welcome({
      fullName,
      email,
      milestonesLink: process.env.BASE_URL + '/milestone1-welcome?email=' + encodeURIComponent(email)
    }).then(() => {
      console.log(`Welcome email sent to: ${email}`);
      // Update email sent status
      newLead.emailSent = true;
      newLead.save();
    }).catch(err => {
      console.error('Email send failed:', err);
    });

    // 7. Optional: Send WhatsApp message (async)
    if (whatsappService && whatsappService.isConfigured && whatsappService.isConfigured()) {
      whatsappService.sendMilestone1Welcome({
        whatsapp,
        firstName: fullName.split(' ')[0],
        milestonesLink: process.env.BASE_URL + '/milestone1-welcome?email=' + encodeURIComponent(email)
      }).then(() => {
        console.log(`WhatsApp message sent to: ${whatsapp}`);
        newLead.whatsappSent = true;
        newLead.save();
      }).catch(err => {
        console.error('WhatsApp send failed:', err);
      });
    }

    // 8. Return success response
    res.status(200).json({
      success: true,
      message: 'Welcome to Z2B Legacy Builders! Redirecting to Milestone 1...',
      email: email,
      prospectId: newLead._id
    });

  } catch (error) {
    console.error('Milestone 1 opt-in error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error. Please try again.'
    });
  }
});

// ============================================
// ENDPOINT 2: Milestone 1 Complete
// ============================================
// Purpose: Mark Milestone 1 as complete, trigger upsell
// Route: POST /api/milestone1-complete
// ============================================

router.post('/milestone1-complete', async (req, res) => {
  try {
    const { email, completedAt } = req.body;

    // 1. Validate required fields
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    // 2. Find user by email
    const lead = await Milestone1Lead.findOne({ email: email.toLowerCase() });
    if (!lead) {
      return res.status(404).json({
        success: false,
        error: 'User not found. Please start from the landing page.'
      });
    }

    // 3. Check if already completed (prevent duplicate completions)
    if (lead.milestone1Complete) {
      console.log(`Milestone 1 already complete for: ${email}`);
      return res.status(200).json({
        success: true,
        message: 'Milestone 1 already marked as complete!',
        alreadyComplete: true
      });
    }

    // 4. Update lead record
    lead.milestone1Complete = true;
    lead.milestone1CompletedAt = completedAt ? new Date(completedAt) : new Date();
    lead.status = 'milestone1-complete';
    lead.bronzeUpsellShown = false; // Will be shown next

    await lead.save();
    console.log(`Milestone 1 marked complete for: ${email}`);

    // 5. Optional: Send completion email
    emailService.sendMilestone1Completion({
      fullName: lead.fullName,
      email: lead.email,
      bronzeUpsellLink: process.env.BASE_URL + '/bronze-upsell?email=' + encodeURIComponent(email)
    }).then(() => {
      console.log(`M1 completion email sent to: ${email}`);
    }).catch(err => {
      console.error('M1 completion email failed:', err);
    });

    // 6. Return success
    res.status(200).json({
      success: true,
      message: 'Milestone 1 marked complete! Redirecting to next step...'
    });

  } catch (error) {
    console.error('Milestone 1 complete error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error. Please try again.'
    });
  }
});

// ============================================
// ENDPOINT 3: Save Milestone 1 Progress (Interactive Data)
// ============================================
// Purpose: Save Vision Board + SWOT/TEEE responses as user fills form
// Route: POST /api/milestone1-save-progress
// ============================================

router.post('/milestone1-save-progress', async (req, res) => {
  try {
    const { email, ...milestone1FormData } = req.body;

    // 1. Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    // 2. Find user by email
    const lead = await Milestone1Lead.findOne({ email: email.toLowerCase() });
    if (!lead) {
      return res.status(404).json({
        success: false,
        error: 'User not found. Please start from the landing page.'
      });
    }

    // 3. Update M1 data (merge with existing to preserve partial saves)
    lead.milestone1Data = {
      ...lead.milestone1Data,
      ...milestone1FormData,
      lastSaved: new Date()
    };

    // 4. Update status to in-progress if not already complete
    if (lead.status === 'new') {
      lead.status = 'milestone1-in-progress';
    }

    await lead.save();
    console.log(`M1 progress saved for: ${email}`);

    // 5. Return success
    res.status(200).json({
      success: true,
      message: 'Progress saved successfully'
    });

  } catch (error) {
    console.error('Save M1 progress error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error. Please try again.'
    });
  }
});

// ============================================
// ENDPOINT 4: Track Upsell Decision
// ============================================
// Purpose: Track whether user accepts or declines Bronze Tier
// Route: POST /api/track-upsell-decision
// ============================================

router.post('/track-upsell-decision', async (req, res) => {
  try {
    const { email, decision, timestamp } = req.body;

    // 1. Validate required fields
    if (!email || !decision) {
      return res.status(400).json({
        success: false,
        error: 'Email and decision are required'
      });
    }

    // 2. Validate decision value
    if (!['accepted', 'declined'].includes(decision)) {
      return res.status(400).json({
        success: false,
        error: 'Decision must be "accepted" or "declined"'
      });
    }

    // 3. Find user by email
    const lead = await Milestone1Lead.findOne({ email: email.toLowerCase() });
    if (!lead) {
      // Still return success (don't block user flow), but log warning
      console.warn(`Upsell decision tracked for unknown email: ${email}`);
      return res.status(200).json({
        success: true,
        message: 'Decision recorded'
      });
    }

    // 4. Update lead record
    lead.bronzeUpsellShown = true;
    lead.bronzeUpsellDecision = decision;
    lead.bronzeUpsellDecidedAt = timestamp ? new Date(timestamp) : new Date();

    // Update status based on decision
    if (decision === 'accepted') {
      lead.status = 'bronze-pending'; // Will be updated to 'bronze-member' after payment
    } else {
      lead.status = 'free-member';
    }

    await lead.save();
    console.log(`Bronze upsell decision recorded: ${email} - ${decision}`);

    // 5. Handle post-decision actions
    if (decision === 'accepted') {
      // User clicked upgrade - they'll be redirected to checkout
      console.log(`User accepted Bronze Tier: ${email}`);

      // Optional: Send "Welcome to Bronze" email (after payment confirms)
      // This would be handled by your payment webhook

    } else {
      // User declined - send nurture sequence
      console.log(`User declined Bronze Tier: ${email}`);

      // Schedule follow-up email (3 days later)
      emailService.scheduleBronzeFollowUp({
        fullName: lead.fullName,
        email: lead.email,
        daysDelay: 3
      }).then(() => {
        console.log(`Bronze follow-up scheduled for: ${email}`);
      }).catch(err => {
        console.error('Bronze follow-up scheduling failed:', err);
      });
    }

    // 6. Return success
    res.status(200).json({
      success: true,
      message: 'Decision recorded successfully'
    });

  } catch (error) {
    console.error('Track upsell decision error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error. Please try again.'
    });
  }
});

// ============================================
// OPTIONAL: Get User Progress
// ============================================
// Purpose: Fetch user's milestone progress (for dashboard)
// Route: GET /api/milestone1-progress/:email
// ============================================

router.get('/milestone1-progress/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const lead = await Milestone1Lead.findOne({ email: email.toLowerCase() });
    if (!lead) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Return sanitized user data
    res.status(200).json({
      success: true,
      data: {
        fullName: lead.fullName,
        email: lead.email,
        currentSituation: lead.currentSituation,
        milestone1Complete: lead.milestone1Complete,
        milestone1CompletedAt: lead.milestone1CompletedAt,
        bronzeUpsellDecision: lead.bronzeUpsellDecision,
        status: lead.status,
        submittedAt: lead.submittedAt
      }
    });

  } catch (error) {
    console.error('Get milestone progress error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// ============================================
// ADMIN ONLY: Get All M1 Leads
// ============================================
// Purpose: Admin dashboard - view all M1 leads
// Route: GET /api/admin/milestone1-leads
// Requires: Admin authentication middleware
// ============================================

router.get('/admin/milestone1-leads', async (req, res) => {
  try {
    // TODO: Add admin authentication middleware here
    // const isAdmin = req.user && req.user.role === 'admin';
    // if (!isAdmin) return res.status(403).json({ error: 'Unauthorized' });

    const leads = await Milestone1Lead.find()
      .sort({ submittedAt: -1 })
      .limit(100);

    const stats = {
      total: await Milestone1Lead.countDocuments(),
      completed: await Milestone1Lead.countDocuments({ milestone1Complete: true }),
      bronzeAccepted: await Milestone1Lead.countDocuments({ bronzeUpsellDecision: 'accepted' }),
      bronzeDeclined: await Milestone1Lead.countDocuments({ bronzeUpsellDecision: 'declined' }),
      pending: await Milestone1Lead.countDocuments({ milestone1Complete: false })
    };

    res.status(200).json({
      success: true,
      stats,
      leads
    });

  } catch (error) {
    console.error('Get all M1 leads error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;