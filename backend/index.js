const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors');
const mongoStore = require('connect-mongo');
const authRoutes = require('./routes/authRoutes');
const apiRoutes  = require('./routes/apiRoutes');
const isAuthenticated=require('./middlewares/authMiddleware');
const passport   = require('./config/passport.js');
require("dotenv").config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB is connected"))
  .catch((e) => console.log(e.message));
    
const app = express();

// CORS Middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

// Express Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Session Middleware (Must be before passport)
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
    httpOnly: true,
    maxAge: 2*60*1000  // 10 minutes 
  }
}));

// Passport Middleware (AFTER session)
app.use(passport.initialize());
app.use(passport.session());
app.use('/auth',authRoutes);
app.use('/api',isAuthenticated,apiRoutes);

 // Home Route
 app.get('/', (req, res) => {
  // console.log(req.user);
  // console.log(req.session.cookie);
  res.status(200).json({ data: "somevalue", data2: "somevalue" });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`App is listening at http://localhost:${PORT}`);
});
