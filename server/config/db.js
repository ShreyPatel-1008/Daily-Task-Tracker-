const mongoose = require('mongoose');

const connectDB = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 30000,
        connectTimeoutMS: 30000,
      });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.error(`❌ MongoDB Connection Error (attempt ${i + 1}/${retries}): ${error.message}`);
      if (i < retries - 1) {
        console.log(`   Retrying in 5 seconds...`);
        await new Promise(r => setTimeout(r, 5000));
      } else {
        console.error('❌ All connection attempts failed. Please check:');
        console.error('   1. Your MONGODB_URI in .env is correct');
        console.error('   2. Your IP is whitelisted in MongoDB Atlas (Network Access -> Add Current IP or 0.0.0.0/0)');
        console.error('   3. Your internet connection is working');
        process.exit(1);
      }
    }
  }
};

module.exports = connectDB;
