require('dotenv').config();

const express = require('express');
const cors = require('cors');

const testRoutes = require('./routes/testRoutes');
const itemsRoutes = require('./routes/itemsRoutes');
const claimsRoutes = require('./routes/claimsRoutes');
const notificationsRoutes = require('./routes/notificationsRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(cors());
app.use(express.json());

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