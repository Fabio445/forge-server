const mongoose = require('mongoose');

// Function to connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI); // Connect to MongoDB
        console.log('MongoDB connected!');
    } catch (error) {
        console.error('MongoDB connection error:', error); // Log connection error
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB; // Export the connectDB function
