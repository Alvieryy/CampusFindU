require('dotenv').config();

const express = require('express');
const cors = require('cors');

const testRoutes = require('./routes/testRoutes');




const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        message: 'CampusFindU API is running'
    });
});

app.use('/api/test', testRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

const itemsRoutes = require('./routes/itemsRoutes');
app.use('/api', itemsRoutes);

const claimsRoutes = require('./routes/claimsRoutes');
app.use('/api/claims', claimsRoutes);

const notificationsRoutes = require('./routes/notificationsRoutes');
app.use('/api/notifications', notificationsRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);