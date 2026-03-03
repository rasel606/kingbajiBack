// // src/context/NotificationContext.js
// import React, { createContext, useContext, useReducer, useEffect } from 'react';
// import { notificationService } from '../services/notificationService';
// import { useAuth } from './AuthContext';

// const NotificationContext = createContext();

// const notificationReducer = (state, action) => {
//   switch (action.type) {
//     case 'SET_NOTIFICATIONS':
//       return {
//         ...state,
//         notifications: action.payload,
//         unreadCount: action.payload.filter(n => !n.read).length
//       };

//     case 'ADD_NOTIFICATION':
//       const newNotifications = [action.payload, ...state.notifications];
//       return {
//         ...state,
//         notifications: newNotifications,
//         unreadCount: newNotifications.filter(n => !n.read).length
//       };

//     case 'MARK_AS_READ':
//       const updatedNotifications = state.notifications.map(notification =>
//         notification._id === action.payload ? { ...notification, read: true } : notification
//       );
//       return {
//         ...state,
//         notifications: updatedNotifications,
//         unreadCount: updatedNotifications.filter(n => !n.read).length
//       };

//     case 'MARK_ALL_READ':
//       const allReadNotifications = state.notifications.map(notification => ({
//         ...notification,
//         read: true
//       }));
//       return {
//         ...state,
//         notifications: allReadNotifications,
//         unreadCount: 0
//       };

//     case 'DELETE_NOTIFICATION':
//       const filteredNotifications = state.notifications.filter(
//         notification => notification._id !== action.payload
//       );
//       return {
//         ...state,
//         notifications: filteredNotifications,
//         unreadCount: filteredNotifications.filter(n => !n.read).length
//       };

//     case 'SET_PREFERENCES':
//       return {
//         ...state,
//         preferences: action.payload
//       };

//     case 'SET_LOADING':
//       return {
//         ...state,
//         loading: action.payload
//       };

//     case 'SET_ERROR':
//       return {
//         ...state,
//         error: action.payload
//       };

//     default:
//       return state;
//   }
// };

// const initialState = {
//   notifications: [],
//   unreadCount: 0,
//   preferences: {},
//   loading: false,
//   error: null
// };

// export const NotificationProvider = ({ children }) => {
//   const [state, dispatch] = useReducer(notificationReducer, initialState);
//   const { user } = useAuth();

//   // Load notifications on user login
//   useEffect(() => {
//     if (user) {
//       loadUserNotifications();
//       loadUserPreferences();
//       initializeWebSocket();
//     } else {
//       notificationService.disconnect();
//       dispatch({ type: 'SET_NOTIFICATIONS', payload: [] });
//     }

//     return () => {
//       notificationService.disconnect();
//     };
//   }, [user]);

//   const initializeWebSocket = () => {
//     if (user) {
//       notificationService.initWebSocket(user.userId);

//       // Subscribe to real-time notifications
//       const unsubscribe = notificationService.subscribe((notification) => {
//         dispatch({ type: 'ADD_NOTIFICATION', payload: notification });

//         // Show browser notification if permitted
//         if (Notification.permission === 'granted' && !document.hasFocus()) {
//           new Notification(notification.title, {
//             body: notification.message,
//             icon: '/favicon.ico',
//             tag: notification._id
//           });
//         }
//       });

//       return unsubscribe;
//     }
//   };

//   const loadUserNotifications = async () => {
//     try {
//       dispatch({ type: 'SET_LOADING', payload: true });
//       const response = await notificationService.getUserNotifications(user.userId, {
//         limit: 50,
//         sort: '-createdAt'
//       });
//       dispatch({ type: 'SET_NOTIFICATIONS', payload: response.data || [] });
//     } catch (error) {
//       dispatch({ type: 'SET_ERROR', payload: error.message });
//     } finally {
//       dispatch({ type: 'SET_LOADING', payload: false });
//     }
//   };

//   const loadUserPreferences = async () => {
//     try {
//       const response = await notificationService.getUserPreferences(user.userId);
//       dispatch({ type: 'SET_PREFERENCES', payload: response.data || {} });
//     } catch (error) {
//       console.error('Error loading preferences:', error);
//     }
//   };

//   const markAsRead = async (notificationId) => {
//     try {
//       await notificationService.markAsRead(notificationId);
//       dispatch({ type: 'MARK_AS_READ', payload: notificationId });
//     } catch (error) {
//       dispatch({ type: 'SET_ERROR', payload: error.message });
//     }
//   };

//   const markAllAsRead = async () => {
//     try {
//       await notificationService.markAllAsRead(user.userId);
//       dispatch({ type: 'MARK_ALL_READ' });
//     } catch (error) {
//       dispatch({ type: 'SET_ERROR', payload: error.message });
//     }
//   };

//   const deleteNotification = async (notificationId) => {
//     try {
//       await notificationService.deleteNotification(notificationId);
//       dispatch({ type: 'DELETE_NOTIFICATION', payload: notificationId });
//     } catch (error) {
//       dispatch({ type: 'SET_ERROR', payload: error.message });
//     }
//   };

//   const updatePreferences = async (preferences) => {
//     try {
//       const response = await notificationService.updatePreferences(user.userId, preferences);
//       dispatch({ type: 'SET_PREFERENCES', payload: response.data });
//       return response;
//     } catch (error) {
//       dispatch({ type: 'SET_ERROR', payload: error.message });
//       throw error;
//     }
//   };

//   const requestNotificationPermission = async () => {
//     if (!('Notification' in window)) {
//       throw new Error('This browser does not support notifications');
//     }

//     if (Notification.permission === 'granted') {
//       return true;
//     }

//     const permission = await Notification.requestPermission();
//     return permission === 'granted';
//   };

//   const value = {
//     ...state,
//     markAsRead,
//     markAllAsRead,
//     deleteNotification,
//     updatePreferences,
//     requestNotificationPermission,
//     refreshNotifications: loadUserNotifications
//   };

//   return (
//     <NotificationContext.Provider value={value}>
//       {children}
//     </NotificationContext.Provider>
//   );
// };

// export const useNotifications = () => {
//   const context = useContext(NotificationContext);
//   if (!context) {
//     throw new Error('useNotifications must be used within a NotificationProvider');
//   }
//   return context;
// };

// // src/context/NotificationContext.js
// import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { webWorkerService } from '../service/webWorkerService'
// import { useAuth } from './AuthContext';
// import { useToast } from './ToastContext';

// const NotificationContext = createContext();

// const notificationReducer = (state, action) => {
//   switch (action.type) {
//     case 'SET_NOTIFICATIONS':
//       const notifications = action.payload;
//       return {
//         ...state,
//         notifications,
//         unreadCount: notifications.filter(n => !n.read).length,
//         lastSynced: Date.now()
//       };

//     case 'ADD_NOTIFICATION':
//       const newNotifications = [action.payload, ...state.notifications];
//       return {
//         ...state,
//         notifications: newNotifications,
//         unreadCount: newNotifications.filter(n => !n.read).length
//       };

//     case 'MARK_AS_READ':
//       const updatedNotifications = state.notifications.map(notification =>
//         notification._id === action.payload ? { ...notification, read: true } : notification
//       );
//       return {
//         ...state,
//         notifications: updatedNotifications,
//         unreadCount: updatedNotifications.filter(n => !n.read).length
//       };

//     case 'MARK_ALL_READ':
//       const allReadNotifications = state.notifications.map(notification => ({
//         ...notification,
//         read: true
//       }));
//       return {
//         ...state,
//         notifications: allReadNotifications,
//         unreadCount: 0
//       };

//     case 'DELETE_NOTIFICATION':
//       const filteredNotifications = state.notifications.filter(
//         notification => notification._id !== action.payload
//       );
//       return {
//         ...state,
//         notifications: filteredNotifications,
//         unreadCount: filteredNotifications.filter(n => !n.read).length
//       };

//     case 'SET_WORKER_STATUS':
//       return {
//         ...state,
//         workerStatus: action.payload
//       };

//     case 'SET_NETWORK_STATUS':
//       return {
//         ...state,
//         isOnline: action.payload
//       };

//     case 'SET_LOADING':
//       return {
//         ...state,
//         loading: action.payload
//       };

//     case 'SET_ERROR':
//       return {
//         ...state,
//         error: action.payload
//       };

//     case 'SET_SYNCING':
//       return {
//         ...state,
//         syncing: action.payload
//       };

//     default:
//       return state;
//   }
// };

// const initialState = {
//   notifications: [],
//   unreadCount: 0,
//   workerStatus: 'initializing',
//   isOnline: navigator.onLine,
//   loading: false,
//   syncing: false,
//   error: null,
//   lastSynced: null
// };

// export const EnhancedNotificationProvider = ({ children }) => {
//   const [state, dispatch] = useReducer(notificationReducer, initialState);
//   const { user } = useAuth();
//   const { addToast } = useToast();

//   // Initialize Web Worker
//   useEffect(() => {
//     if (user && webWorkerService.getStatus().workerSupported) {
//       const initialized = webWorkerService.initialize(user.userId, {
//         email: user.email,
//         role: user.role
//       });

//       if (initialized) {
//         setupWorkerHandlers();
//         dispatch({ type: 'SET_WORKER_STATUS', payload: 'connected' });
//       } else {
//         dispatch({ type: 'SET_WORKER_STATUS', payload: 'failed' });
//       }
//     }

//     return () => {
//       if (webWorkerService.getStatus().initialized) {
//         webWorkerService.disconnect();
//       }
//     };
//   }, [user]);

//   const setupWorkerHandlers = useCallback(() => {
//     // Handle new notifications from worker
//     webWorkerService.on('NEW_NOTIFICATION', (notification) => {
//       dispatch({ type: 'ADD_NOTIFICATION', payload: notification });

//       // Show toast for important notifications
//       if (notification.type === 'deposit' || notification.type === 'withdrawal') {
//         addToast({
//           title: notification.title,
//           message: notification.message,
//           type: 'info',
//           duration: 5000
//         });
//       }
//     });

//     // Handle sync completion
//     webWorkerService.on('SYNC_COMPLETE', (notifications) => {
//       dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
//       dispatch({ type: 'SET_SYNCING', payload: false });
//     });

//     // Handle WebSocket status
//     webWorkerService.on('WEBSOCKET_STATUS', (status) => {
//       if (status.connected) {
//         dispatch({ type: 'SET_WORKER_STATUS', payload: 'connected' });
//       } else {
//         dispatch({ type: 'SET_WORKER_STATUS', payload: 'disconnected' });
//       }
//     });

//     // Handle network status
//     webWorkerService.on('NETWORK_STATUS', (status) => {
//       dispatch({ type: 'SET_NETWORK_STATUS', payload: status.online });

//       if (status.online) {
//         addToast({
//           title: 'Back online',
//           message: 'Connection restored',
//           type: 'success'
//         });
//       } else {
//         addToast({
//           title: 'Offline',
//           message: 'Working in offline mode',
//           type: 'warning'
//         });
//       }
//     });

//     // Handle errors
//     webWorkerService.on('WORKER_ERROR', (error) => {
//       console.error('Worker error:', error);
//       dispatch({ type: 'SET_ERROR', payload: error.message });
//     });

//     // Handle notification clicks from browser notifications
//     webWorkerService.on('NOTIFICATION_CLICK', (notification) => {
//       // Focus the app and navigate to relevant page
//       if (window.focus) window.focus();

//       // You can add navigation logic here based on notification type
//       console.log('Notification clicked:', notification);
//     });
//   }, [addToast]);

//   // Manual sync
//   const syncNotifications = useCallback(() => {
//     if (!webWorkerService.getStatus().initialized) return;

//     dispatch({ type: 'SET_SYNCING', payload: true });
//     webWorkerService.syncNotifications();
//   }, []);

//   // Mark as read
//   const markAsRead = useCallback((notificationId) => {
//     dispatch({ type: 'MARK_AS_READ', payload: notificationId });
//     webWorkerService.markAsRead(notificationId);
//   }, []);

//   // Mark all as read
//   const markAllAsRead = useCallback(() => {
//     dispatch({ type: 'MARK_ALL_READ' });

//     // Queue background sync for all unread notifications
//     state.notifications
//       .filter(n => !n.read)
//       .forEach(notification => {
//         webWorkerService.queueBackgroundSync({
//           type: 'MARK_AS_READ',
//           data: { notificationId: notification._id }
//         });
//       });
//   }, [state.notifications]);

//   // Delete notification
//   const deleteNotification = useCallback((notificationId) => {
//     dispatch({ type: 'DELETE_NOTIFICATION', payload: notificationId });

//     // Note: You might want to sync this deletion with the server
//   }, []);

//   // Request notification permission
//   const requestNotificationPermission = useCallback(async () => {
//     if (!('Notification' in window)) {
//       throw new Error('This browser does not support notifications');
//     }

//     if (Notification.permission === 'granted') {
//       return true;
//     }

//     const permission = await Notification.requestPermission();

//     if (permission === 'granted') {
//       addToast({
//         title: 'Notifications enabled',
//         message: 'You will now receive browser notifications',
//         type: 'success'
//       });
//     }

//     return permission === 'granted';
//   }, [addToast]);

//   // Auto-sync every 5 minutes
//   useEffect(() => {
//     if (state.isOnline && webWorkerService.getStatus().initialized) {
//       const interval = setInterval(syncNotifications, 5 * 60 * 1000);
//       return () => clearInterval(interval);
//     }
//   }, [state.isOnline, syncNotifications]);

//   // Initial sync
//   useEffect(() => {
//     if (user && state.isOnline) {
//       syncNotifications();
//     }
//   }, [user, state.isOnline, syncNotifications]);

//   const value = {
//     ...state,
//     markAsRead,
//     markAllAsRead,
//     deleteNotification,
//     syncNotifications,
//     requestNotificationPermission,
//     workerSupported: webWorkerService.getStatus().workerSupported,
//     workerInitialized: webWorkerService.getStatus().initialized
//   };

//   return (
//     <NotificationContext.Provider value={value}>
//       {children}
//     </NotificationContext.Provider>
//   );
// };

// export const useEnhancedNotifications = () => {
//   const context = useContext(NotificationContext);
//   if (!context) {
//     throw new Error('useEnhancedNotifications must be used within an EnhancedNotificationProvider');
//   }
//   return context;
// };

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
const notificationWorker = new Worker(
  new URL('../workers/notification-worker.js', import.meta.url),
  { type: 'module' },
)

import { useAuth } from './AuthContext'
import { useToast } from './ToastContext'

const NotificationContext = createContext()
self.onmessage = (e) => {
  const { type, payload } = e.data

  if (type === 'ping') {
    self.postMessage({ type: 'pong', payload })
  }
}

const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'SET_NOTIFICATIONS':
      const notifications = action.payload
      return {
        ...state,
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
        lastSynced: Date.now(),
      }

    case 'ADD_NOTIFICATION':
      const newNotifications = [action.payload, ...state.notifications]
      return {
        ...state,
        notifications: newNotifications,
        unreadCount: newNotifications.filter((n) => !n.read).length,
      }

    case 'MARK_AS_READ':
      const updatedNotifications = state.notifications.map((notification) =>
        notification._id === action.payload ? { ...notification, read: true } : notification,
      )
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter((n) => !n.read).length,
      }

    case 'MARK_ALL_READ':
      const allReadNotifications = state.notifications.map((notification) => ({
        ...notification,
        read: true,
      }))
      return {
        ...state,
        notifications: allReadNotifications,
        unreadCount: 0,
      }

    case 'DELETE_NOTIFICATION':
      const filteredNotifications = state.notifications.filter(
        (notification) => notification._id !== action.payload,
      )
      return {
        ...state,
        notifications: filteredNotifications,
        unreadCount: filteredNotifications.filter((n) => !n.read).length,
      }

    case 'SET_WORKER_STATUS':
      return {
        ...state,
        workerStatus: action.payload.status,
        workerFallback: action.payload.fallback || false,
      }

    case 'SET_NETWORK_STATUS':
      return {
        ...state,
        isOnline: action.payload,
      }

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      }

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      }

    case 'SET_SYNCING':
      return {
        ...state,
        syncing: action.payload,
      }

    default:
      return state
  }
}

const initialState = {
  notifications: [],
  unreadCount: 0,
  workerStatus: 'initializing',
  workerFallback: false,
  isOnline: navigator.onLine,
  loading: false,
  syncing: false,
  error: null,
  lastSynced: null,
}

export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState)
  const { user } = useAuth()
  const { addToast } = useToast()

  // Initialize Web Worker
  useEffect(() => {
    const initializeWorker = async () => {
      if (user) {
        try {
          const initialized = await webWorkerService.initialize(user.userId, {
            email: user.email,
            role: user.role,
          })

          if (initialized) {
            setupWorkerHandlers()
            dispatch({
              type: 'SET_WORKER_STATUS',
              payload: { status: 'connected', fallback: false },
            })
            // addToast({message:{
            //   title: 'Notifications Active',
            //   message: 'Real-time notifications enabled',
            //   type: 'success',
            //   duration: 3000
            // }});
          } else {
            dispatch({
              type: 'SET_WORKER_STATUS',
              payload: { status: 'fallback', fallback: true },
            })
            // addToast({
            //   title: 'Limited Mode',
            //   message: 'Using standard notifications',
            //   type: 'info',
            //   duration: 3000
            // });
          }
        } catch (error) {
          console.error('Worker initialization error:', error)
          dispatch({
            type: 'SET_WORKER_STATUS',
            payload: { status: 'failed', fallback: true },
          })
        }
      } else {
        dispatch({
          type: 'SET_WORKER_STATUS',
          payload: { status: 'unsupported', fallback: true },
        })
      }
    }

    initializeWorker()

    return () => {
      // if (webWorkerService.getStatus().initialized) {
      //   webWorkerService.disconnect();
      // }
    }
  }, [user, addToast])

  const setupWorkerHandlers = useCallback(() => {
    // Handle new notifications from worker
    webWorkerService.on('NEW_NOTIFICATION', (notification) => {
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification })

      // Show toast for important notifications
      if (notification.type === 'deposit' || notification.type === 'withdrawal') {
        addToast({
          title: notification.title,
          message: notification.message,
          type: 'info',
          duration: 5000,
        })
      }
    })

    // Handle sync completion
    webWorkerService.on('SYNC_COMPLETE', (notifications) => {
      dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications })
      dispatch({ type: 'SET_SYNCING', payload: false })
    })

    // Handle WebSocket status
    webWorkerService.on('WEBSOCKET_STATUS', (status) => {
      if (status.connected) {
        dispatch({ type: 'SET_WORKER_STATUS', payload: { status: 'connected' } })
      } else {
        dispatch({ type: 'SET_WORKER_STATUS', payload: { status: 'disconnected' } })
      }
    })

    // Handle network status
    webWorkerService.on('NETWORK_STATUS', (status) => {
      dispatch({ type: 'SET_NETWORK_STATUS', payload: status.online })

      // if (status.online) {
      //   addToast({
      //     title: 'Back online',
      //     message: 'Connection restored',
      //     type: 'success'
      //   });
      // } else {
      //   addToast({
      //     title: 'Offline',
      //     message: 'Working in offline mode',
      //     type: 'warning'
      //   });
      // }
    })

    // Handle errors
    webWorkerService.on('WORKER_ERROR', (error) => {
      console.error('Worker error:', error)
      dispatch({ type: 'SET_ERROR', payload: error.message })
    })
  }, [addToast])

  // Manual sync
  const syncNotifications = useCallback(() => {
    dispatch({ type: 'SET_SYNCING', payload: true })
    webWorkerService.syncNotifications()
  }, [])

  // Mark as read
  const markAsRead = useCallback((notificationId) => {
    dispatch({ type: 'MARK_AS_READ', payload: notificationId })
    webWorkerService.markAsRead(notificationId)
  }, [])
  notificationWorker.onmessage = (event) => {
    const { type, payload } = event.data
    if (type === 'NEW_NOTIFICATION') {
      dispatch({ type: 'ADD_NOTIFICATION', payload })
      addToast({
        title: payload.title,
        message: payload.message,
        type: 'info',
        duration: 5000,
      })
    }
  }
  // Mark all as read
  const markAllAsRead = useCallback(() => {
    dispatch({ type: 'MARK_ALL_READ' })

    // Queue background sync for all unread notifications
    state.notifications
      .filter((n) => !n.read)
      .forEach((notification) => {
        webWorkerService.markAsRead(notification._id)
      })
  }, [state.notifications])

  // Delete notification
  const deleteNotification = useCallback((notificationId) => {
    dispatch({ type: 'DELETE_NOTIFICATION', payload: notificationId })
  }, [])

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications')
    }

    if (Notification.permission === 'granted') {
      return true
    }

    const permission = await Notification.requestPermission()

    if (permission === 'granted') {
      addToast({
        title: 'Notifications enabled',
        message: 'You will now receive browser notifications',
        type: 'success',
      })
    }

    return permission === 'granted'
  }, [addToast])

  const value = {
    ...state,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    syncNotifications,
    requestNotificationPermission,
    // workerSupported: notificationWorker.getStatus().workerSupported,
    // workerInitialized: notificationWorker.getStatus().initialized
  }

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export const useEnhancedNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useEnhancedNotifications must be used within an EnhancedNotificationProvider')
  }
  return context
}
