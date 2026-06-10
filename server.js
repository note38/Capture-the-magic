require('dotenv').config();
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.static('.'));

// API endpoint to fetch gallery photos
app.get('/api/gallery', async (req, res) => {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: '18th-bday/',
      max_results: 500
    });

    const photos = (result.resources || []).map(r => ({
      url: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/q_auto,f_auto,w_600/${r.public_id}`,
      urlFull: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/q_auto,f_auto/${r.public_id}`,
      publicId: r.public_id,
      createdAt: r.created_at
    })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, photos });
  } catch (error) {
    console.error('Gallery API error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
