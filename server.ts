import express from 'express'
import compression from 'compression'
import cors from 'cors'
import helmet from 'helmet'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import dotenv from 'dotenv'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000
const NODE_ENV = process.env.NODE_ENV || 'development'

// Security middleware
app.use(helmet())
app.use(compression())
app.use(cors({
  origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}))

// Body parser
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', environment: NODE_ENV })
})

// API routes placeholder
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    uptime: process.uptime(),
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
  })
})

// Serve static files from dist
const distPath = join(__dirname, 'dist')
app.use(express.static(distPath, {
  maxAge: NODE_ENV === 'production' ? '1d' : 0,
  etag: false,
}))

// SPA fallback - serve index.html for all routes not matched by API
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(join(distPath, 'index.html'), (err) => {
      if (err) {
        res.status(500).send('Error loading application')
      }
    })
  } else {
    res.status(404).json({ error: 'API route not found' })
  }
})

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err)
  res.status(err.status || 500).json({
    error: NODE_ENV === 'production' ? 'Internal server error' : err.message,
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  Learn German App - Production Server  ║
╠════════════════════════════════════════╣
║  🚀 Server running on port ${PORT}      ║
║  🌍 Environment: ${NODE_ENV}              ║
║  📦 Static files served from: dist/    ║
║  ✅ Ready for requests                 ║
╚════════════════════════════════════════╝
  `)
})
