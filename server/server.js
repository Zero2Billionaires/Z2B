import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db.js'

// Import routes
import memberRoutes from './routes/memberRoutes.js'
import tierRoutes from './routes/tierRoutes.js'
import commissionRoutes from './routes/commissionRoutes.js'

// AI Coach routes
import coachRoutes from './routes/coachRoutes.js'
import btssRoutes from './routes/btssRoutes.js'
import lessonRoutes from './routes/lessonRoutes.js'

dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Connect to MongoDB
connectDB()

// Routes
app.use('/api/members', memberRoutes)
app.use('/api/tiers', tierRoutes)
app.use('/api/commissions', commissionRoutes)

// AI Coach routes
app.use('/api/coach', coachRoutes)
app.use('/api/btss', btssRoutes)
app.use('/api/lessons', lessonRoutes)

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Z2B API is running!' })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
