require('dotenv').config();

const express = require('express');
const cors = require('cors');
const compression = require('compression');

const testRoutes = require('./routes/testRoutes');
const itemsRoutes = require('./routes/itemsRoutes');
const claimsRoutes = require('./routes/claimsRoutes');
const notificationsRoutes = require('./routes/notificationsRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Enable HTTP response compression (gzip/deflate) to drastically reduce JSON transfer size
app.use(compression({
    level: 6,
    threshold: 1024 // Only compress responses larger than 1KB
}));

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/', (req, res) => {
    res.json({
        message: 'CampusFindU API is running'
    });
});

app.use('/api/test', testRoutes);
app.use('/api', itemsRoutes);
app.use('/api/claims', claimsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});