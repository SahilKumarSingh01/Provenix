const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors');
const mongoStore = require('connect-mongo');
const authRoutes = require('./routes/authRoutes');
const multer = require("multer");

const courseRoutes  = require('./routes/courseRoutes.js');
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

// Express Middleware allowing 1mb json only
app.use(express.json({limit: "1mb"}));
app.use(express.urlencoded({ extended: true ,limit: "1mb"}));
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
    maxAge: 10*60*1000  // 10 minutes 
  }
}));

// Passport Middleware (AFTER session)
app.use(passport.initialize());
app.use(passport.session());
app.use('/auth',authRoutes);
app.use('/api/course',isAuthenticated,courseRoutes);

 // Home Route
 app.get('/', (req, res) => {
  res.status(200).json({ data: "you are visiting home", data2: "it has nothing try something else" });
});


// Set up Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, "uploads/"); // Store files in "uploads" folder
  },
  filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname); // Rename file
  }
});

// Initialize Multer with a file size limit
const upload = multer({storage: multer.memoryStorage()});

app.post("/upload",upload.single('file'), (req, res) => {
  console.log("File uploaded:", req.file);
  res.send("File uploaded successfully");
});




// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`App is listening at http://localhost:${PORT}`);
});
