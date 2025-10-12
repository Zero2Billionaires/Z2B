import mongoose from 'mongoose'

const memberSchema = new mongoose.Schema({
  membershipId: {
    type: String,
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: String,
  tier: {
    type: String,
    enum: ['FAM', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'],
    default: 'FAM'
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'inactive'],
    default: 'active'
  },
  referralLink: String,
  sponsorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member'
  },
  isBetaTester: {
    type: Boolean,
    default: false
  },
  betaPosition: Number,
  joinedDate: {
    type: Date,
    default: Date.now
  },
  builderSales: {
    type: Number,
    default: 0
  },
  totalCommissions: {
    type: Number,
    default: 0
  },
  pv: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
})

const Member = mongoose.model('Member', memberSchema)

export default Member
