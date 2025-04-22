const express = require('express');
const session = require('express-session');
const cors = require('cors');
const mongoStore = require('connect-mongo');
const authRoutes = require('./routes/authRoutes');
const courseRoutes  = require('./routes/courseRoutes.js');
const uploadRoutes  = require('./routes/uploadRoutes.js');
const enrollmentRoutes  = require('./routes/enrollmentRoutes.js');
const profileRoutes  = require('./routes/profileRoutes.js');
const webhookRoutes    = require('./routes/webhookRoutes.js');
const isAuthenticated=require('./middlewares/authMiddleware');
const passport   = require('./config/passport.js');
const worker     = require('./cron/worker.js');
const connectDatabase=require('./utils/connectDatabase.js');
const razorpay=require('./config/razorpay.js');
const removeOrphanResource=require('./cron/tasks/removeOrphanResource.js');
require("dotenv").config();
// const cloudinary = require("./config/cloudinary");

// Connect to MongoDB
connectDatabase(); 

const app = express();

// CORS Middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

// Express Middleware allowing 1mb json only
app.use(express.json({limit: "1mb"}));
app.use(express.urlencoded({ extended: true ,limit: "1mb"}));
// Session Middleware (Must be before passport)
app.set('trust proxy', 1)

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  store: mongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions'
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'PROD',
    httpOnly: true,
    maxAge: 30*60*1000,  // 30 minutes 
    sameSite:process.env.NODE_ENV === 'PROD'?'none':'lax',
  }
}));

// Passport Middleware (AFTER session)
app.use(passport.initialize());
app.use(passport.session());
app.use('/auth',authRoutes);
app.use('/api/upload',isAuthenticated,uploadRoutes);
app.use('/api/enrollment',isAuthenticated,enrollmentRoutes);
app.use('/api/course',courseRoutes);
app.use('/api/profile',isAuthenticated,profileRoutes)
app.use('/api/webhook',webhookRoutes);

 // Home Route
app.get('/', (req, res) => {
  res.status(200).json({ data: "this is backend entry point has nothing to offer " });
});
app.get('/run-maintenance', async (req, res) => {
  try {
    await worker(); // Call the worker function to run tasks
    res.status(200).json({ message: "Tasks completed successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error executing tasks.", error: error.message });
  }
})


// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('🧨 Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
});


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`App is listening at http://localhost:${PORT}`); 
})

