require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const axios = require('axios');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || 'demo',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'demo'
});

// Configure Multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// In-memory database (replace with MongoDB in production)
const users = new Map();
const videos = new Map();
const forexAccess = new Map();

// Admin credentials (hash this in production)
const ADMIN_EMAIL = 'GilbertandRuby@gmail.com';
const ADMIN_PASSWORD = 'Basicboy1!';

// ==================== AUTHENTICATION ROUTES ====================

// Admin Login
app.post('/api/auth/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { email, role: 'admin' },
      process.env.JWT_SECRET || 'super_secret_key',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { email, role: 'admin' }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User Registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (users.has(email)) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    users.set(email, { name, email, password: hashedPassword, createdAt: new Date() });

    const token = jwt.sign(
      { email, role: 'user' },
      process.env.JWT_SECRET || 'super_secret_key',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { email, name, role: 'user' }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = users.get(email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { email, role: 'user' },
      process.env.JWT_SECRET || 'super_secret_key',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { email, name: user.name, role: 'user' }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Current User
app.get('/api/auth/me', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_key');
    const user = users.get(decoded.email);

    res.json({
      email: decoded.email,
      name: user?.name || 'Admin',
      role: decoded.role,
      forexAccess: forexAccess.has(decoded.email)
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// ==================== VIDEO ROUTES ====================

// Upload Video
app.post('/api/video/upload', upload.single('video'), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_key');
    const userEmail = decoded.email;

    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    // Upload to Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'video',
        folder: 'forex-verification',
        public_id: `${userEmail}-${Date.now()}`,
        max_bytes: 50 * 1024 * 1024
      },
      (error, result) => {
        if (error) {
          return res.status(500).json({ error: 'Video upload failed', details: error.message });
        }

        // Store video metadata
        const videoId = result.public_id;
        videos.set(videoId, {
          userId: userEmail,
          cloudinaryUrl: result.secure_url,
          status: 'pending',
          uploadedAt: new Date(),
          videoId: videoId
        });

        res.json({
          success: true,
          message: 'Video uploaded successfully',
          videoId: videoId,
          status: 'pending_approval'
        });
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Pending Videos (Admin only)
app.get('/api/video/pending', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_key');
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const pendingVideos = Array.from(videos.values()).filter(v => v.status === 'pending');

    res.json({
      count: pendingVideos.length,
      videos: pendingVideos
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve Video (Admin only)
app.post('/api/video/approve/:userId', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_key');
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const userId = req.params.userId;

    // Find video by userId
    let userVideo = null;
    for (let [key, video] of videos) {
      if (video.userId === userId) {
        userVideo = video;
        break;
      }
    }

    if (!userVideo) {
      return res.status(404).json({ error: 'Video not found' });
    }

    userVideo.status = 'approved';
    forexAccess.set(userId, { grantedAt: new Date(), approved: true });

    res.json({
      success: true,
      message: `Video approved for ${userId}`,
      forexAccessGranted: true
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reject Video (Admin only)
app.post('/api/video/reject/:userId', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_key');
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const userId = req.params.userId;
    const { reason } = req.body;

    // Find video by userId
    let userVideo = null;
    for (let [key, video] of videos) {
      if (video.userId === userId) {
        userVideo = video;
        break;
      }
    }

    if (!userVideo) {
      return res.status(404).json({ error: 'Video not found' });
    }

    userVideo.status = 'rejected';
    userVideo.rejectionReason = reason;

    res.json({
      success: true,
      message: `Video rejected for ${userId}`,
      reason: reason
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== FOREX DATA ROUTES ====================

// Get XAUUSD Price
app.get('/api/forex/xauusd', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_key');
    if (!forexAccess.has(decoded.email)) {
      return res.status(403).json({ error: 'Forex access not granted. Please submit verification video.' });
    }

    const apiKey = process.env.ALPHA_VANTAGE_KEY || 'demo';
    
    // Call Alpha Vantage API for FX_MONTHLY data
    const response = await axios.get(`https://www.alphavantage.co/query`, {
      params: {
        function: 'FX_MONTHLY',
        from_symbol: 'XAU',
        to_symbol: 'USD',
        apikey: apiKey
      }
    });

    if (response.data['Error Message']) {
      return res.status(500).json({ error: response.data['Error Message'] });
    }

    const timeSeries = response.data['Time Series FX (Monthly)'];
    if (!timeSeries) {
      return res.json({
        symbol: 'XAUUSD',
        note: 'Using demo data - API limit reached',
        price: 2050.50,
        change: '+0.25%',
        timestamp: new Date().toISOString()
      });
    }

    const latestDate = Object.keys(timeSeries)[0];
    const latestData = timeSeries[latestDate];

    res.json({
      symbol: 'XAUUSD',
      date: latestDate,
      open: latestData['1. open'],
      high: latestData['2. high'],
      low: latestData['3. low'],
      close: latestData['4. close'],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Market Status
app.get('/api/forex/market-status', async (req, res) => {
  try {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // XAUUSD market hours (typically Monday-Friday, 00:00-23:00 UTC)
    // Closed: Saturday (6) and Sunday (0)
    let status = 'OPEN';
    
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      status = 'CLOSED';
    } else if (hours >= 22 && hours < 23) {
      status = 'PREMARKET';
    }

    res.json({
      symbol: 'XAUUSD',
      status: status,
      timestamp: now.toISOString(),
      dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek],
      time: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} UTC`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Trading Signals
app.get('/api/forex/signals', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_key');
    if (!forexAccess.has(decoded.email)) {
      return res.status(403).json({ error: 'Forex access not granted' });
    }

    // Simple signal based on time (demo)
    const hour = new Date().getHours();
    let signal = 'NEUTRAL';
    let confidence = 50;

    if (hour >= 1 && hour <= 8) {
      signal = 'BUY';
      confidence = 65;
    } else if (hour >= 9 && hour <= 16) {
      signal = 'SELL';
      confidence = 60;
    }

    res.json({
      symbol: 'XAUUSD',
      signal: signal,
      confidence: `${confidence}%`,
      recommendation: `${signal} with ${confidence}% confidence`,
      timestamp: new Date().toISOString(),
      note: 'Demo signals - use with caution'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ERROR HANDLING ====================

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server error', message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📹 Video Portal Active`);
  console.log(`💰 Forex Signals API Ready`);
  console.log(`☁️  Cloudinary Storage: ${cloudinary.config().cloud_name}`);
});
