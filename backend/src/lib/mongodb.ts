import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neurocloak'

let isConnected = false

export async function connectMongoDB(): Promise<void> {
  if (isConnected) return

  try {
    const maskedUri = MONGODB_URI.replace(/:([^:@]+)@/, ':****@');
    console.log(`Connecting to MongoDB: ${maskedUri}`);
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000, // Increased timeout
      socketTimeoutMS: 45000,
    })
    isConnected = true
    console.log('MongoDB connected successfully')
  } catch (error) {
    const maskedUri = MONGODB_URI.replace(/:([^:@]+)@/, ':****@');
    console.error(`MongoDB connection failed [${maskedUri}]:`, error)
    process.exit(1)
  }

}

export async function disconnectMongoDB(): Promise<void> {
  if (!isConnected) return
  await mongoose.disconnect()
  isConnected = false
  console.log('MongoDB disconnected')
}

mongoose.connection.on('error', (error) => {
  console.error('MongoDB connection error:', error)
  isConnected = false
})

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected')
  isConnected = false
})

export default mongoose
