const express = require('express');
const cors = require('cors');

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());

app.use(express.json());

try {
    const bfhlRoutes = require('./routes/bfhl');
    app.use('/bfhl', bfhlRoutes);
    console.log('✅ /bfhl route loaded successfully');
} catch (error) {
    console.error('❌ Failed to load /bfhl route:', error.message);
}

app.get('/', (req, res) => {
    res.send('✅ Backend server is running!');
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 API endpoint: http://localhost:${PORT}/bfhl`);
});