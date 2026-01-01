import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    default: 'admin'
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: false
  },
  lastLogin: {
    type: Date
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  role: {
    type: String,
    enum: ['superadmin', 'admin', 'manager'],
    default: 'admin'
  }
}, {
  timestamps: true
})

// Virtual for account lock status
adminSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now())
})

// Hash password before saving
adminSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next()

  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Method to compare password
adminSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password)
  } catch (error) {
    throw error
  }
}

// Method to increment login attempts
adminSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    })
  }

  // Otherwise increment
  const updates = { $inc: { loginAttempts: 1 } }

  // Lock account after 5 failed attempts for 2 hours
  const maxAttempts = 5
  const lockTime = 2 * 60 * 60 * 1000 // 2 hours

  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + lockTime }
  }

  return this.updateOne(updates)
}

// Method to reset login attempts
adminSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $set: { loginAttempts: 0, lastLogin: Date.now() },
    $unset: { lockUntil: 1 }
  })
}

const Admin = mongoose.model('Admin', adminSchema)

export default Admin
