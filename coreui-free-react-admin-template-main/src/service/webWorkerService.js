class WebWorkerService {
  constructor() {
    this.worker = null
    this.messageHandlers = new Map()
    this.isInitialized = false
    this.pendingRequests = new Map()
    this.fallbackMode = false
    this.init()
  }

  init() {
    if (typeof Worker !== 'undefined') {
      this.createWorkerFromBlob()
    } else {
      console.warn('Web Workers are not supported in this browser')
      this.fallbackToMainThread()
    }
  }

  createWorkerFromBlob() {
    try {
      // Create worker from blob to avoid file loading issues
      const workerCode = `
        self.addEventListener('message', function(e) {
          const { type, payload, messageId } = e.data;

          switch (type) {
            case 'PING':
              self.postMessage({
                type: 'PONG',
                payload: { ...payload, workerTime: Date.now() },
                messageId
              });
              break;

            case 'INIT':
              self.postMessage({
                type: 'INIT_SUCCESS',
                payload: { success: true },
                messageId
              });
              break;

            case 'SEND_NOTIFICATION':
              setTimeout(() => {
                self.postMessage({
                  type: 'NOTIFICATION_SENT',
                  payload: { success: true, id: payload?.id },
                  messageId
                });
              }, 100);
              break;

            case 'MARK_AS_READ':
              self.postMessage({
                type: 'NOTIFICATION_READ',
                payload: { notificationId: payload?.notificationId },
                messageId
              });
              break;

            case 'SYNC_REQUEST':
              setTimeout(() => {
                self.postMessage({
                  type: 'SYNC_COMPLETE',
                  payload: { notifications: [], timestamp: Date.now() },
                  messageId
                });
              }, 500);
              break;

            default:
              self.postMessage({
                type: 'ERROR',
                payload: { error: 'Unknown message type: ' + type },
                messageId
              });
          }
        });

        self.addEventListener('online', () => {
          self.postMessage({ type: 'NETWORK_STATUS', payload: { online: true } });
        });

        self.addEventListener('offline', () => {
          self.postMessage({ type: 'NETWORK_STATUS', payload: { online: false } });
        });
      `

      const workerBlob = new Blob([workerCode], { type: 'application/javascript' })
      const workerUrl = URL.createObjectURL(workerBlob)
      this.worker = new Worker(workerUrl)
      // NOTE: Do not revoke immediately; some environments can fail to fully initialize
      // the worker script, causing intermittent ping timeouts.

      this.setupMessageHandlers()
      this.isInitialized = true

      console.log('Web Worker created successfully from Blob')
    } catch (error) {
      console.error('Failed to create Web Worker from Blob:', error)
      this.fallbackToMainThread()
    }
  }

  setupMessageHandlers() {
    if (!this.worker) return

    this.worker.onmessage = (event) => {
      const { type, payload, messageId } = event.data

      console.log('Worker message received:', type, payload)

      // Handle pending requests
      if (messageId && this.pendingRequests.has(messageId)) {
        const { resolve, reject } = this.pendingRequests.get(messageId)
        this.pendingRequests.delete(messageId)

        if (type === 'ERROR') {
          reject(new Error(payload.error))
        } else {
          resolve(payload)
        }
        return
      }

      // Handle event-based messages
      if (this.messageHandlers.has(type)) {
        this.messageHandlers.get(type).forEach((handler) => {
          try {
            handler(payload)
          } catch (error) {
            console.error(`Error in message handler for ${type}:`, error)
          }
        })
      }
    }

    this.worker.onerror = (error) => {
      console.error('Web Worker error:', error)
      this.emit('WORKER_ERROR', { error: error.message })
      this.fallbackToMainThread()
    }

    this.worker.onmessageerror = (error) => {
      console.error('Web Worker message error:', error)
      this.emit('WORKER_ERROR', { error: 'Message error' })
      this.fallbackToMainThread()
    }
  }

  async testWorker() {
    if (!this.isInitialized || !this.worker) {
      throw new Error('Worker not initialized')
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.pendingRequests.delete('ping-test')
        reject(new Error('Worker test timeout'))
      }, 10000)

      this.pendingRequests.set('ping-test', {
        resolve: (result) => {
          clearTimeout(timeoutId)
          resolve(result)
        },
        reject: (error) => {
          clearTimeout(timeoutId)
          reject(error)
        },
      })

      this.worker.postMessage({
        type: 'PING',
        payload: { test: true, timestamp: Date.now() },
        messageId: 'ping-test',
      })
    })
  }

  fallbackToMainThread() {
    console.log('Falling back to main thread for notifications')
    this.isInitialized = false
    this.fallbackMode = true
    this.emit('WORKER_STATUS', { status: 'fallback', fallback: true })
  }

  // Initialize with user data
  async initialize(userId, userData = {}) {
    if (!this.isInitialized || !this.worker) {
      console.warn('Web Worker not initialized, using fallback')
      this.fallbackToMainThread()
      return false
    }

    try {
      // Test worker first
      await this.testWorker()
      console.log('Worker test successful, proceeding with initialization')

      const result = await this.sendToWorker('INIT', {
        userId,
        userData,
        timestamp: Date.now(),
      })

      this.emit('WORKER_STATUS', { status: 'connected', fallback: false })
      return result.success
    } catch (error) {
      console.error('Worker initialization failed:', error)
      this.fallbackToMainThread()
      return false
    }
  }

  // Generic method to send messages to worker with response
  sendToWorker(type, payload, timeout = 10000) {
    return new Promise((resolve, reject) => {
      if (!this.isInitialized || !this.worker) {
        reject(new Error('Worker not initialized'))
        return
      }

      const messageId = this.generateMessageId()

      // Set up timeout
      const timeoutId = setTimeout(() => {
        this.pendingRequests.delete(messageId)
        reject(new Error(`Worker request timeout for ${type}`))
      }, timeout)

      // Store the request
      this.pendingRequests.set(messageId, {
        resolve: (result) => {
          clearTimeout(timeoutId)
          resolve(result)
        },
        reject: (error) => {
          clearTimeout(timeoutId)
          reject(error)
        },
      })

      // Send message to worker
      this.worker.postMessage({
        type,
        payload,
        messageId,
      })
    })
  }

  // Send notification
  async sendNotification(notificationData) {
    try {
      if (this.isInitialized && !this.fallbackMode) {
        return await this.sendToWorker('SEND_NOTIFICATION', notificationData)
      } else {
        return await this.mainThreadSendNotification(notificationData)
      }
    } catch (error) {
      console.error('Failed to send notification:', error)
      // Fallback to main thread on error
      return await this.mainThreadSendNotification(notificationData)
    }
  }

  // Main thread fallback for sending notifications
  async mainThreadSendNotification(notificationData) {
    console.log('Main thread: Sending notification', notificationData)

    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          fallback: true,
          id: 'main-thread-' + Date.now(),
        })
      }, 100)
    })
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      if (this.isInitialized && !this.fallbackMode) {
        await this.sendToWorker('MARK_AS_READ', { notificationId })
      } else {
        await this.mainThreadMarkAsRead(notificationId)
      }
    } catch (error) {
      console.error('Failed to mark as read:', error)
      await this.mainThreadMarkAsRead(notificationId)
    }
  }

  mainThreadMarkAsRead(notificationId) {
    console.log('Main thread: Marking as read', notificationId)
    this.emit('NOTIFICATION_READ', { notificationId })
    return Promise.resolve()
  }

  // Request sync
  async syncNotifications() {
    try {
      if (this.isInitialized && !this.fallbackMode) {
        const result = await this.sendToWorker('SYNC_REQUEST', {
          timestamp: Date.now(),
        })
        this.emit('SYNC_COMPLETE', result)
      } else {
        await this.mainThreadSyncNotifications()
      }
    } catch (error) {
      console.error('Failed to sync notifications:', error)
      await this.mainThreadSyncNotifications()
    }
  }

  mainThreadSyncNotifications() {
    console.log('Main thread: Syncing notifications')

    // Simulate sync process
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockNotifications = [
          {
            _id: '1',
            title: 'Welcome!',
            message: 'Your notification system is working in fallback mode',
            type: 'system',
            read: false,
            createdAt: new Date().toISOString(),
          },
        ]

        this.emit('SYNC_COMPLETE', { notifications: mockNotifications })
        resolve()
      }, 500)
    })
  }

  // Event handling
  on(eventType, handler) {
    if (!this.messageHandlers.has(eventType)) {
      this.messageHandlers.set(eventType, new Set())
    }
    this.messageHandlers.get(eventType).add(handler)
  }

  off(eventType, handler) {
    if (this.messageHandlers.has(eventType)) {
      this.messageHandlers.get(eventType).delete(handler)
    }
  }

  emit(eventType, payload) {
    if (this.messageHandlers.has(eventType)) {
      this.messageHandlers.get(eventType).forEach((handler) => handler(payload))
    }
  }

  generateMessageId() {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Health check
  getStatus() {
    return {
      initialized: this.isInitialized,
      workerSupported: typeof Worker !== 'undefined',
      fallbackMode: this.fallbackMode,
      status: this.fallbackMode ? 'fallback' : this.isInitialized ? 'connected' : 'disconnected',
    }
  }

  // Cleanup
  disconnect() {
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
    }
    this.isInitialized = false
    this.fallbackMode = false
    this.pendingRequests.clear()
    this.messageHandlers.clear()
  }
}

// Create singleton instance
export const webWorkerService = new WebWorkerService()
