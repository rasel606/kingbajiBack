const redis = require('redis')

// Export a mutable holder so other modules can read updated .client after connect
const redisHolder = { client: null }

const connectRedis = async () => {
	try {
		const url = process.env.REDIS_URL || process.env.REDIS_URI || 'redis://127.0.0.1:6379'

		// create client with sensible defaults and auto-reconnect
		const client = redis.createClient({
			url,
			socket: {
				reconnectStrategy: (retries) => Math.min(retries * 50, 2000),
			},
		})

		client.on('error', (err) => console.warn('Redis Client Error', err && err.message))
		client.on('connect', () => console.log('✅ Redis Client connecting'))
		client.on('ready', () => console.log('✅ Redis Client ready'))

		await client.connect()

		redisHolder.client = client
		console.log('✅ Redis connected at', url)
		return client
	} catch (err) {
		console.warn('⚠️ Redis connect failed, falling back to in-memory cache:', err && err.message)
		redisHolder.client = null
		return null
	}
}

// Graceful disconnect helper
const disconnectRedis = async () => {
	try {
		if (redisHolder.client) await redisHolder.client.disconnect()
	} catch (err) {
		console.warn('Error disconnecting redis:', err && err.message)
	}
}

module.exports = { ...redisHolder, connectRedis, disconnectRedis }