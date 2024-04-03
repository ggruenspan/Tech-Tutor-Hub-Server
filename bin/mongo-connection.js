// bin/mongo-connection.js

const mongoose = require('mongoose');

// MongoDB connection setup
mongoose.connect(process.env.MONGODB_CONN_STR, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});