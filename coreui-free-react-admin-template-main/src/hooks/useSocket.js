// hooks/useSocket.js
import { useState, useEffect, useRef, useCallback } from 'react'
import { socketService } from '../services/socketService'
import { useAuth } from '../context/AuthContext'

export const useSocket = () => {
  const { user } = useAuth()
  const [isConnected, setIsConnected] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [socketId, setSocketId] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  const [lastPing, setLastPing] = useState(null)
  const eventHandlers = useRef(new Map())

  // Initialize socket connection
  useEffect(() => {
    console.log('🎯 useSocket: Initializing socket connection', {
      hasUser: !!user,
      hasToken: !!user?.token,
      userId: user?.userId,
    })

    if (user && user.token) {
      socketService.connect(user.token, user)
    } else {
      console.warn('⚠️ useSocket: Cannot initialize socket - user or token missing')
      return
    }

    // Socket event listeners
    const unsubscribeCallbacks = [
      // Connection events
      socketService.on('connected', (data) => {
        console.log('✅ useSocket: Socket connected', data)
        setIsConnected(true)
        setSocketId(data.socketId)
        setConnectionStatus('connected')
      }),

      socketService.on('disconnected', (data) => {
        console.log('❌ useSocket: Socket disconnected', data)
        setIsConnected(false)
        setIsAuthenticated(false)
        setSocketId(null)
        setConnectionStatus('disconnected')
      }),

      socketService.on('connection_error', (data) => {
        console.error('❌ useSocket: Socket connection error', data)
        setIsConnected(false)
        setConnectionStatus('error')
      }),

      socketService.on('reconnection_failed', (data) => {
        console.error('🚨 useSocket: Reconnection failed', data)
        setConnectionStatus('failed')
      }),

      // Authentication events
      socketService.on('authenticated', (data) => {
        console.log('✅ useSocket: Socket authenticated', data)
        setIsAuthenticated(true)
        setConnectionStatus('authenticated')
      }),

      socketService.on('unauthorized', (data) => {
        console.error('❌ useSocket: Socket unauthorized', data)
        setIsAuthenticated(false)
        setConnectionStatus('unauthorized')
      }),

      // Ping/Pong events
      socketService.on('pong', (data) => {
        console.log('🏓 useSocket: Pong received', data)
        setLastPing({
          latency: data.latency,
          timestamp: new Date().toISOString(),
        })
      }),

      // Room events
      socketService.on('room_joined', (data) => {
        console.log('✅ useSocket: Room joined', data)
      }),

      socketService.on('join_error', (data) => {
        console.error('❌ useSocket: Join room error', data)
      }),
    ]

    // Get initial status
    const initialStatus = socketService.getConnectionStatus()
    console.log('📊 useSocket: Initial connection status', initialStatus)
    setIsConnected(initialStatus.isConnected)
    setIsAuthenticated(initialStatus.isAuthenticated)
    setSocketId(initialStatus.socketId)

    return () => {
      console.log('🧹 useSocket: Cleaning up socket listeners')
      unsubscribeCallbacks.forEach((unsubscribe) => unsubscribe())
      // Note: We don't disconnect the socket service as it's a singleton
    }
  }, [user])

  // Custom event handler registration
  const on = useCallback((event, handler) => {
    console.log('🔔 useSocket: Registering event handler', { event })

    if (!eventHandlers.current.has(event)) {
      eventHandlers.current.set(event, [])
    }
    eventHandlers.current.get(event).push(handler)

    const unsubscribe = socketService.on(event, handler)

    return () => {
      console.log('🔕 useSocket: Unregistering event handler', { event })
      unsubscribe()
      const handlers = eventHandlers.current.get(event)
      if (handlers) {
        const index = handlers.indexOf(handler)
        if (index > -1) {
          handlers.splice(index, 1)
        }
      }
    }
  }, [])

  // Socket actions
  const joinChat = useCallback(
    (roomId, userType) => {
      if (!user) {
        console.error('❌ useSocket: Cannot join chat - user not available')
        return false
      }
      return socketService.joinChat(roomId, user.userId, userType)
    },
    [user],
  )

  const sendMessage = useCallback(
    (roomId, message, senderType) => {
      if (!user) {
        console.error('❌ useSocket: Cannot send message - user not available')
        return false
      }
      return socketService.sendNewMessage(roomId, message, user.userId, senderType)
    },
    [user],
  )

  const startTyping = useCallback(
    (roomId, userType) => {
      if (!user) return false
      return socketService.startTyping(roomId, user.userId, userType)
    },
    [user],
  )

  const stopTyping = useCallback(
    (roomId, userType) => {
      if (!user) return false
      return socketService.stopTyping(roomId, user.userId, userType)
    },
    [user],
  )

  const markMessagesRead = useCallback(
    (roomId, userType) => {
      if (!user) return false
      return socketService.markMessagesRead(roomId, user.userId, userType)
    },
    [user],
  )

  const updateChatStatus = useCallback(
    (roomId, status) => {
      if (!user) return false
      return socketService.updateChatStatus(roomId, status, user.userId)
    },
    [user],
  )

  const notifyAdminAssignment = useCallback(
    (roomId, adminName) => {
      if (!user) return false
      return socketService.notifyAdminAssignment(roomId, user.userId, adminName)
    },
    [user],
  )

  // Connection management
  const reconnect = useCallback(() => {
    console.log('🔄 useSocket: Manual reconnect requested')
    socketService.reconnect()
  }, [])

  const disconnect = useCallback(() => {
    console.log('🔌 useSocket: Manual disconnect requested')
    socketService.disconnect()
  }, [])

  const getStatus = useCallback(() => {
    return socketService.getConnectionStatus()
  }, [])

  const getDetailedReport = useCallback(() => {
    return socketService.getDetailedReport()
  }, [])

  const testConnection = useCallback(() => {
    console.log('🧪 useSocket: Testing connection')
    return socketService.testConnection()
  }, [])

  return {
    // State
    isConnected,
    isAuthenticated,
    socketId,
    connectionStatus,
    lastPing,

    // Event handling
    on,

    // Chat actions
    joinChat,
    sendMessage,
    startTyping,
    stopTyping,
    markMessagesRead,
    updateChatStatus,
    notifyAdminAssignment,

    // Connection management
    reconnect,
    disconnect,
    getStatus,
    getDetailedReport,
    testConnection,
  }
}

export default useSocket
