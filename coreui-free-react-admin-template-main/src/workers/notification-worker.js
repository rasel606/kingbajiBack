// public/workers/notification-worker.js
class NotificationWorker {
  constructor() {
    this.websocket = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 1000
    this.isConnected = false
    this.userId = null
    this.notificationCache = new Map()
    this.backgroundSyncQueue = []
    this.init()
  }

  init() {
    self.addEventListener('message', this.handleMessage.bind(this))
    self.addEventListener('online', this.handleOnline.bind(this))
    self.addEventListener('offline', this.handleOffline.bind(this))

    // Start background sync interval
    setInterval(() => this.processBackgroundSync(), 30000) // Every 30 seconds
  }

  handleMessage(event) {
    const { type, payload } = event.data

    switch (type) {
      case 'INIT':
        this.userId = payload.userId
        this.initWebSocket()
        break

      case 'SEND_NOTIFICATION':
        this.sendNotification(payload)
        break

      case 'MARK_AS_READ':
        this.markAsRead(payload)
        break

      case 'SYNC_REQUEST':
        this.syncNotifications()
        break

      case 'BACKGROUND_SYNC':
        this.queueBackgroundSync(payload)
        break

      case 'CLEAR_CACHE':
        this.clearCache()
        break

      case 'DISCONNECT':
        this.disconnect()
        break

      default:
        console.warn('Unknown message type:', type)
    }
  }

  initWebSocket() {
    if (!this.userId) return

    const protocol = self.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${self.location.host}/ws/notifications/${this.userId}`

    try {
      this.websocket = new WebSocket(wsUrl)
      this.setupWebSocketHandlers()
    } catch (error) {
      console.error('WebSocket connection failed:', error)
      this.scheduleReconnection()
    }
  }

  setupWebSocketHandlers() {
    this.websocket.onopen = () => {
      this.isConnected = true
      this.reconnectAttempts = 0
      this.postMessage({
        type: 'WEBSOCKET_STATUS',
        payload: { connected: true },
      })
      console.log('WebWorker: WebSocket connected')
    }

    this.websocket.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data)
        this.handleIncomingNotification(notification)
      } catch (error) {
        console.error('WebWorker: Error parsing notification:', error)
      }
    }

    this.websocket.onclose = (event) => {
      this.isConnected = false
      this.postMessage({
        type: 'WEBSOCKET_STATUS',
        payload: {
          connected: false,
          code: event.code,
          reason: event.reason,
        },
      })
      this.scheduleReconnection()
    }

    this.websocket.onerror = (error) => {
      console.error('WebWorker: WebSocket error:', error)
      this.postMessage({
        type: 'WEBSOCKET_ERROR',
        payload: { error: error.message },
      })
    }
  }

  handleIncomingNotification(notification) {
    // Cache the notification
    this.notificationCache.set(notification._id, {
      ...notification,
      cachedAt: Date.now(),
    })

    // Clean old cache entries (older than 1 hour)
    this.cleanCache()

    // Send to main thread
    this.postMessage({
      type: 'NEW_NOTIFICATION',
      payload: notification,
    })

    // Show browser notification if applicable
    this.showBrowserNotification(notification)
  }

  showBrowserNotification(notification) {
    if (self.Notification && self.Notification.permission === 'granted') {
      const notificationOptions = {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification._id,
        timestamp: Date.now(),
        data: notification,
      }

      // Different icons based on notification type
      switch (notification.type) {
        case 'deposit':
          notificationOptions.icon = '/icons/deposit-notification.png'
          break
        case 'withdrawal':
          notificationOptions.icon = '/icons/withdrawal-notification.png'
          break
        case 'bonus':
          notificationOptions.icon = '/icons/bonus-notification.png'
          break
        case 'security':
          notificationOptions.icon = '/icons/security-notification.png'
          break
      }

      const notif = new Notification(notification.title, notificationOptions)

      notif.onclick = () => {
        self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({
              type: 'NOTIFICATION_CLICK',
              payload: notification,
            })
          })
        })
        notif.close()
      }

      // Auto-close after 10 seconds
      setTimeout(() => notif.close(), 10000)
    }
  }

  scheduleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)

      setTimeout(() => {
        if (!this.isConnected) {
          console.log(`WebWorker: Attempting reconnect (${this.reconnectAttempts})`)
          this.initWebSocket()
        }
      }, delay)
    }
  }

  async sendNotification(notificationData) {
    try {
      const response = await this.fetchWithTimeout('/api/notifications/send-push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('WebWorker: Failed to send notification:', error)
      // Queue for background sync
      this.queueBackgroundSync({
        type: 'SEND_NOTIFICATION',
        data: notificationData,
      })
      throw error
    }
  }

  async markAsRead(notificationId) {
    try {
      const response = await this.fetchWithTimeout(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      this.postMessage({
        type: 'NOTIFICATION_READ',
        payload: { notificationId },
      })
    } catch (error) {
      console.error('WebWorker: Failed to mark as read:', error)
      // Queue for background sync
      this.queueBackgroundSync({
        type: 'MARK_AS_READ',
        data: { notificationId },
      })
    }
  }

  async syncNotifications() {
    try {
      const response = await this.fetchWithTimeout(
        `/api/notifications/user/${this.userId}?limit=100`,
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      this.postMessage({
        type: 'SYNC_COMPLETE',
        payload: data.data,
      })
    } catch (error) {
      console.error('WebWorker: Sync failed:', error)
      this.postMessage({
        type: 'SYNC_ERROR',
        payload: { error: error.message },
      })
    }
  }

  queueBackgroundSync(task) {
    this.backgroundSyncQueue.push({
      ...task,
      attempt: 0,
      maxAttempts: 3,
      timestamp: Date.now(),
    })

    // Store in IndexedDB for persistence
    this.storeSyncTask(task)
  }

  async processBackgroundSync() {
    if (this.backgroundSyncQueue.length === 0 || !navigator.onLine) return

    const successfulTasks = []

    for (const task of this.backgroundSyncQueue) {
      try {
        await this.processSyncTask(task)
        successfulTasks.push(task)
      } catch (error) {
        console.error('WebWorker: Background sync task failed:', error)
        task.attempt++

        if (task.attempt >= task.maxAttempts) {
          console.warn('WebWorker: Task failed after max attempts:', task)
          successfulTasks.push(task) // Remove from queue even if failed
        }
      }
    }

    // Remove successful/failed tasks from queue
    this.backgroundSyncQueue = this.backgroundSyncQueue.filter(
      (task) => !successfulTasks.includes(task),
    )

    // Clean up stored tasks
    await this.cleanStoredSyncTasks(successfulTasks)
  }

  async processSyncTask(task) {
    switch (task.type) {
      case 'SEND_NOTIFICATION':
        await this.sendNotification(task.data)
        break
      case 'MARK_AS_READ':
        await this.markAsRead(task.data.notificationId)
        break
      default:
        console.warn('WebWorker: Unknown sync task type:', task.type)
    }
  }

  async fetchWithTimeout(url, options = {}) {
    const timeout = 10000 // 10 seconds
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), timeout)

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })

    clearTimeout(id)
    return response
  }

  cleanCache() {
    const oneHourAgo = Date.now() - 60 * 60 * 1000

    for (const [id, notification] of this.notificationCache) {
      if (notification.cachedAt < oneHourAgo) {
        this.notificationCache.delete(id)
      }
    }
  }

  clearCache() {
    this.notificationCache.clear()
  }

  disconnect() {
    if (this.websocket) {
      this.websocket.close()
      this.websocket = null
    }
    this.isConnected = false
  }

  handleOnline() {
    this.postMessage({ type: 'NETWORK_STATUS', payload: { online: true } })
    this.processBackgroundSync()

    if (!this.isConnected) {
      this.initWebSocket()
    }
  }

  handleOffline() {
    this.postMessage({ type: 'NETWORK_STATUS', payload: { online: false } })
  }

  // IndexedDB for persistent storage
  async storeSyncTask(task) {
    // Implementation for storing tasks in IndexedDB
    // This ensures tasks survive page reloads
  }

  async cleanStoredSyncTasks(tasks) {
    // Implementation for cleaning stored tasks
  }

  postMessage(message) {
    self.postMessage(message)
  }
}

// Initialize the worker
const worker = new NotificationWorker()
