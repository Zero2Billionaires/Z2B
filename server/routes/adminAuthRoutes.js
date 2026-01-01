import express from 'express'
import jwt from 'jsonwebtoken'
import Admin from '../models/Admin.js'

const router = express.Router()

// JWT Secret - in production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'z2b-admin-secret-key-change-in-production-2024'
const JWT_EXPIRES_IN = '24h' // Token expires in 24 hours

// Middleware to verify admin token
export const verifyAdminToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.adminToken

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' })
    }

    const decoded = jwt.verify(token, JWT_SECRET)
    const admin = await Admin.findById(decoded.id)

    if (!admin) {
      return res.status(401).json({ error: 'Invalid token. Admin not found.' })
    }

    if (admin.isLocked) {
      return res.status(423).json({ error: 'Account is locked due to too many failed login attempts.' })
    }

    req.admin = admin
    next()
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token.' })
  }
}

// Initialize default admin if none exists
router.post('/initialize', async (req, res) => {
  try {
    const adminCount = await Admin.countDocuments()

    if (adminCount > 0) {
      return res.status(400).json({ error: 'Admin already exists. Use login instead.' })
    }

    // Create default admin
    const defaultAdmin = new Admin({
      username: 'admin',
      password: 'Z2BAdmin2024!', // Default password - MUST be changed after first login
      email: 'admin@z2b.co.za',
      role: 'superadmin'
    })

    await defaultAdmin.save()

    res.json({
      success: true,
      message: 'Default admin created successfully',
      defaultCredentials: {
        username: 'admin',
        password: 'Z2BAdmin2024!',
        warning: 'CHANGE PASSWORD IMMEDIATELY AFTER FIRST LOGIN'
      }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' })
    }

    // Find admin by username
    const admin = await Admin.findOne({ username })

    if (!admin) {
      return res.status(401).json({ error: 'Invalid username or password' })
    }

    // Check if account is locked
    if (admin.isLocked) {
      const lockTimeRemaining = Math.ceil((admin.lockUntil - Date.now()) / 60000) // minutes
      return res.status(423).json({
        error: `Account is locked due to too many failed login attempts. Try again in ${lockTimeRemaining} minutes.`
      })
    }

    // Verify password
    const isMatch = await admin.comparePassword(password)

    if (!isMatch) {
      // Increment login attempts
      await admin.incLoginAttempts()
      return res.status(401).json({ error: 'Invalid username or password' })
    }

    // Reset login attempts on successful login
    await admin.resetLoginAttempts()

    // Generate JWT token
    const token = jwt.sign(
      {
        id: admin._id,
        username: admin.username,
        role: admin.role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )

    res.json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        lastLogin: admin.lastLogin
      }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Verify token (check if user is still authenticated)
router.get('/verify', verifyAdminToken, (req, res) => {
  res.json({
    success: true,
    admin: {
      id: req.admin._id,
      username: req.admin.username,
      email: req.admin.email,
      role: req.admin.role
    }
  })
})

// Change password
router.post('/change-password', verifyAdminToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' })
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' })
    }

    // Verify current password
    const isMatch = await req.admin.comparePassword(currentPassword)

    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' })
    }

    // Update password
    req.admin.password = newPassword
    await req.admin.save()

    res.json({
      success: true,
      message: 'Password changed successfully'
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update admin profile
router.put('/profile', verifyAdminToken, async (req, res) => {
  try {
    const { email, username } = req.body

    if (username && username !== req.admin.username) {
      // Check if username is already taken
      const existingAdmin = await Admin.findOne({ username, _id: { $ne: req.admin._id } })
      if (existingAdmin) {
        return res.status(400).json({ error: 'Username already taken' })
      }
      req.admin.username = username
    }

    if (email) {
      req.admin.email = email
    }

    await req.admin.save()

    res.json({
      success: true,
      message: 'Profile updated successfully',
      admin: {
        id: req.admin._id,
        username: req.admin.username,
        email: req.admin.email,
        role: req.admin.role
      }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Logout (client-side will remove token, but we can track it here)
router.post('/logout', verifyAdminToken, (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  })
})

// Get admin stats (for dashboard)
router.get('/stats', verifyAdminToken, async (req, res) => {
  try {
    const stats = {
      adminCount: await Admin.countDocuments(),
      lastLogin: req.admin.lastLogin,
      role: req.admin.role
    }

    res.json(stats)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
