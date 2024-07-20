const express = require('express');
const app = express();
const multer = require('multer');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const port = 3000;
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
app.use(express.json());


// Choose Language API
app.post('/choose-language', (req, res) => {
  const { language } = req.body;
  // You can add logic here to handle the chosen language
  res.json({ message: `Selected language: ${language}` });
});

// Upload Video API
// app.post('/upload-video', (req, res) => {
//   const { videoTitle, videoURL } = req.body;
//   // You can add logic here to handle the uploaded video
//   res.json({ message: `Video uploaded: ${videoTitle}`, url: videoURL });
// });

// Configure multer for file uploads
// const storage = multer.diskStorage({
//   destination: 'uploads/',
//   filename: (req, file, cb) => {
//       cb(null, Date.now() + '-' + file.originalname);
//   }
// });

// const upload = multer({ storage: storage });
// // Handle video upload
// app.post('/upload', upload.single('video'), async (req, res) => {
//   const { title, category, language } = req.body;
//   const videoPath = req.file.path;

//   const newVideo = new Video({
//     title,
//     category,
//     language,
//     videoPath,
//   });

//   await newVideo.save();

//   res.redirect('/');
// });

// // Get videos based on category and language
// app.get('/videos', async (req, res) => {
//   const { category, language } = req.query;

//   const videos = await Video.find({
//     category: { $regex: new RegExp(category, 'i') },
//     language: { $regex: new RegExp(language, 'i') },
//   });

//   res.json(videos);
// });
// Configure multer for file uploads
const storage = multer.memoryStorage(); // Store the file in memory instead of on disk
const upload = multer({ storage: storage });

// Serve static files from the 'public' directory
app.use(express.static('uploads'));

// Handle video upload
app.post('/upload', upload.single('video'), (req, res) => {
  try{
  const { title, category, language } = req.body;
  const videoBuffer = req.file.buffer; // Access the file buffer

  // You can perform additional actions here, e.g., save metadata to a database
  // For simplicity, this example just sends back a success message and the received data

  res.json({
    message: 'Video uploaded successfully!',
    title,
    category,
    language,
    videoData: videoBuffer.toString('base64'), // Convert the buffer to base64 for demonstration
  });
}catch (error){
  console.error('Error during video upload:', error);
  res.status(500).json({ error: 'Internal Server Error', message: error.message });
}
});

// Get videos based on category and language
app.get('/videos', async (req, res) => {
  const { category, language } = req.query;

  // Your video retrieval logic...

  res.json(/* Your response */);
});
// Simple HTML form to test file upload
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});
// Categories API
app.get('/categories', (req, res) => {
  // You can add logic here to fetch and return categories
  const categories = ['Sports', 'Politics', 'Entertainment', 'Business', 'Bhakti'];
  res.json({ categories });
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(" ")[1];

  jwt.verify(token, JWT_SECRET_KEY, (err, user) => {
    if (err) {
      console.error('Token verification error:', err);
      return res.status(403).json({ error: 'Forbidden' });
    }
    console.log('Token payload:', user);
    req.user = user;
    next();
  });
};

// Superuser Login API
app.post('/superuser-login', (req, res) => {
  const { username, password } = req.body;

  // You can add your own logic for superuser authentication here
  if (username === 'superuser' && password === 'superpassword') {
    const token = jwt.sign({ username, role:"Admin" }, JWT_SECRET_KEY);
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Superuser-only API
app.get('/superuser-only', authenticateToken, (req, res) => {
  // This route is accessible only to authenticated superusers
  res.json({ message: 'Welcome, Superuser!' });
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


