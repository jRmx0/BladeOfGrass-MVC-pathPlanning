const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Enable CORS
app.use(cors());

// Serve static files
app.use(express.static('.'));

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        phase: 1, 
        name: 'Basic Interface',
        timestamp: new Date().toISOString()
    });
});

// Debug endpoint to check file loading
app.get('/debug', (req, res) => {
    const fs = require('fs');
    const files = ['index.html', 'js/app.js', 'js/canvas.js', 'js/controls.js'];
    const status = {};
    
    files.forEach(file => {
        try {
            status[file] = fs.existsSync(file) ? 'exists' : 'missing';
        } catch (e) {
            status[file] = 'error: ' + e.message;
        }
    });
    
    res.json(status);
});

app.listen(PORT, () => {
    console.log(`🌱 BladeOfGrass Path Planning Prototype`);
    console.log(`📡 Server running at http://localhost:${PORT}`);
    console.log(`🎯 Phase 1: Basic Interface`);
    console.log(`📋 Open http://localhost:${PORT} in your browser`);
});
