
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/ride-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Rider schema
const riderSchema = new mongoose.Schema({
  name: String,
  phone: String,
  vehicle: String,
  location: {
    lat: Number,
    lng: Number
  }
});

const Rider = mongoose.model('Rider', riderSchema);

// Nearby riders endpoint
app.post('/api/nearby-riders', async (req, res) => {
  const { lat, lng } = req.body;

  if (!lat || !lng) {
    return res.status(400).json({ error: 'Missing coordinates' });
  }

  try {
    const riders = await Rider.find(); // Basic fetch (consider pagination or indexing later)

    const nearby = riders
      .map(r => {
        const dist = getDistanceFromLatLonInKm(lat, lng, r.location.lat, r.location.lng);
        return { ...r.toObject(), distance: dist };
      })
      .filter(r => r.distance <= 5)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10); // Optional: top 10 closest

    res.json(nearby);
  } catch (err) {
    console.error('Error fetching riders:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Haversine distance function
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// Sample test endpoint
app.get('/', (req, res) => {
  res.send('Server is running...');
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
let dropoffCoord = null;
const dropoffInput = document.getElementById('dropoff');
const dropSuggestions = document.getElementById('dropSuggestions');

dropoffInput.addEventListener('input', async () => {
  const query = dropoffInput.value;
  if (query.length < 3) return dropSuggestions.innerHTML = '';
  const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1&viewbox=89.6,23.7,90.0,23.4&bounded=1`);
  const results = await res.json();
  dropSuggestions.innerHTML = '';
  results.forEach(loc => {
    const li = document.createElement('li');
    li.textContent = loc.display_name;
    li.onclick = () => {
      dropoffInput.value = loc.display_name;
      dropoffCoord = [parseFloat(loc.lat), parseFloat(loc.lon)];
      map.setView(dropoffCoord, 15);
      L.marker(dropoffCoord).addTo(map).bindPopup("Dropoff Location").openPopup();
      dropSuggestions.innerHTML = '';
    };
    dropSuggestions.appendChild(li);
  });
});
