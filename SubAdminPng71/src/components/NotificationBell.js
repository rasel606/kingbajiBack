// // src/components/NotificationBell.js
// import React, { useState, useRef, useEffect } from 'react';
// import {
//   CBadge,
//   CDropdown,
//   CDropdownToggle,
//   CDropdownMenu,
//   CDropdownItem,
//   CSpinner
// } from '@coreui/react';
// import CIcon from '@coreui/icons-react';
// import { cilBell, cilCheck, cilTrash, cilEnvelopeOpen } from '@coreui/icons';
// import { useNotifications } from '../context/NotificationContext';

// const NotificationBell = () => {
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const dropdownRef = useRef(null);
//   const {
//     notifications,
//     unreadCount,
//     loading,
//     markAsRead,
//     markAllAsRead,
//     deleteNotification
//   } = useNotifications();

//   const handleMarkAsRead = async (notificationId, e) => {
//     e.stopPropagation();
//     await markAsRead(notificationId);
//   };

//   const handleDelete = async (notificationId, e) => {
//     e.stopPropagation();
//     await deleteNotification(notificationId);
//   };

//   const handleMarkAllAsRead = async () => {
//     await markAllAsRead();
//   };

//   const formatTime = (dateString) => {
//     const date = new Date(dateString);
//     const now = new Date();
//     const diffInHours = (now - date) / (1000 * 60 * 60);

//     if (diffInHours < 1) {
//       return 'Just now';
//     } else if (diffInHours < 24) {
//       return `${Math.floor(diffInHours)}h ago`;
//     } else {
//       return `${Math.floor(diffInHours / 24)}d ago`;
//     }
//   };

//   return (
//     <CDropdown 
//       variant="nav-item" 
//       placement="bottom-end"
//       show={dropdownOpen}
//       onShow={() => setDropdownOpen(true)}
//       onHide={() => setDropdownOpen(false)}
//       ref={dropdownRef}
//     >
//       <CDropdownToggle className="position-relative">
//         <CIcon icon={cilBell} size="lg" />
//         {unreadCount > 0 && (
//           <CBadge 
//             color="danger" 
//             position="top-end" 
//             className="position-absolute"
//             style={{ top: '5px', right: '5px', fontSize: '0.6rem' }}
//           >
//             {unreadCount > 9 ? '9+' : unreadCount}
//           </CBadge>
//         )}
//       </CDropdownToggle>
      
//       <CDropdownMenu className="pt-0" style={{ width: '350px' }}>
//         <CDropdownItem header className="bg-light fw-semibold py-2 d-flex justify-content-between align-items-center">
//           <span>Notifications</span>
//           {unreadCount > 0 && (
//             <CButton 
//               color="link" 
//               size="sm" 
//               className="p-0"
//               onClick={handleMarkAllAsRead}
//             >
//               <CIcon icon={cilEnvelopeOpen} className="me-1" />
//               Mark all as read
//             </CButton>
//           )}
//         </CDropdownItem>
        
//         <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
//           {loading ? (
//             <div className="text-center py-3">
//               <CSpinner size="sm" />
//             </div>
//           ) : notifications.length === 0 ? (
//             <CDropdownItem className="text-center text-muted py-3">
//               No notifications
//             </CDropdownItem>
//           ) : (
//             notifications.slice(0, 10).map(notification => (
//               <CDropdownItem 
//                 key={notification._id}
//                 className={`p-3 border-bottom ${!notification.read ? 'bg-light' : ''}`}
//               >
//                 <div className="d-flex justify-content-between align-items-start mb-1">
//                   <strong className="text-primary">{notification.title}</strong>
//                   <small className="text-muted">{formatTime(notification.createdAt)}</small>
//                 </div>
//                 <p className="mb-2 small">{notification.message}</p>
//                 <div className="d-flex justify-content-end gap-1">
//                   {!notification.read && (
//                     <CButton
//                       color="success"
//                       size="sm"
//                       variant="ghost"
//                       onClick={(e) => handleMarkAsRead(notification._id, e)}
//                     >
//                       <CIcon icon={cilCheck} />
//                     </CButton>
//                   )}
//                   <CButton
//                     color="danger"
//                     size="sm"
//                     variant="ghost"
//                     onClick={(e) => handleDelete(notification._id, e)}
//                   >
//                     <CIcon icon={cilTrash} />
//                   </CButton>
//                 </div>
//               </CDropdownItem>
//             ))
//           )}
//         </div>
        
//         {notifications.length > 10 && (
//           <CDropdownItem href="/notifications" className="text-center bg-light">
//             View all notifications
//           </CDropdownItem>
//         )}
//       </CDropdownMenu>
//     </CDropdown>
//   );
// };

// export default NotificationBell;


// src/components/EnhancedNotificationBell.js
import React, { useState, useRef, useEffect } from 'react';
import {
  CBadge,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CSpinner,
  CButton,
  CTooltip
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { 
  cilBell, 
  cilCheck, 
  cilTrash, 
  cilEnvelopeOpen, 
  cilSync,
  cilWarning,
  cilWifiSignal0 
} from '@coreui/icons';
import { useEnhancedNotifications } from '../context/NotificationContext';

const EnhancedNotificationBell = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const {
    notifications,
    unreadCount,
    loading,
    syncing,
    workerStatus,
    isOnline,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    syncNotifications,
    workerInitialized
  } = useEnhancedNotifications();

  const handleMarkAsRead = async (notificationId, e) => {
    e.stopPropagation();
    await markAsRead(notificationId);
  };

  const handleDelete = async (notificationId, e) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleSync = async () => {
    await syncNotifications();
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = (now - date) / (1000 * 60);

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const getStatusIcon = () => {
    if (!workerInitialized) return cilWarning;
    if (!isOnline) return cilWifiSignal0;
    if (workerStatus === 'connected') return cilBell;
    return cilWarning;
  };

  const getStatusColor = () => {
    if (!workerInitialized || !isOnline) return 'warning';
    if (workerStatus === 'connected') return 'success';
    return 'danger';
  };

  const getStatusTooltip = () => {
    if (!workerInitialized) return 'Notifications disabled';
    if (!isOnline) return 'Working offline';
    if (workerStatus === 'connected') return 'Real-time notifications active';
    return 'Connection issues';
  };

  return (
    <CDropdown 
      variant="nav-item" 
      placement="bottom-end"
      show={dropdownOpen}
      onShow={() => setDropdownOpen(true)}
      onHide={() => setDropdownOpen(false)}
      ref={dropdownRef}
    >
      <CDropdownToggle className="position-relative">
        <CTooltip content={getStatusTooltip()}>
          <CIcon 
            icon={getStatusIcon()} 
            size="lg" 
            className={`text-${getStatusColor()}`}
          />
        </CTooltip>
        {unreadCount > 0 && (
          <CBadge 
            color="danger" 
            position="top-end" 
            className="position-absolute"
            style={{ top: '5px', right: '5px', fontSize: '0.6rem' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </CBadge>
        )}
      </CDropdownToggle>
      
      <CDropdownMenu className="pt-0" style={{ width: '380px' }}>
        <CDropdownItem header className="bg-light fw-semibold py-2 d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <span>Notifications</span>
            {syncing && (
              <CSpinner size="sm" className="ms-2" />
            )}
          </div>
          <div className="d-flex gap-1">
            {unreadCount > 0 && (
              <CButton 
                color="link" 
                size="sm" 
                className="p-0 text-success"
                onClick={handleMarkAllAsRead}
                title="Mark all as read"
              >
                <CIcon icon={cilEnvelopeOpen} />
              </CButton>
            )}
            <CButton 
              color="link" 
              size="sm" 
              className="p-0 text-primary"
              onClick={handleSync}
              title="Sync notifications"
              disabled={syncing}
            >
              <CIcon icon={cilSync} />
            </CButton>
          </div>
        </CDropdownItem>
        
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {loading ? (
            <div className="text-center py-3">
              <CSpinner size="sm" />
              <div className="small text-muted mt-1">Loading notifications...</div>
            </div>
          ) : notifications.length === 0 ? (
            <CDropdownItem className="text-center text-muted py-4">
              <CIcon icon={cilBell} width={24} className="mb-2" />
              <div>No notifications</div>
              {!isOnline && (
                <div className="small mt-1">Offline - notifications will sync when online</div>
              )}
            </CDropdownItem>
          ) : (
            notifications.slice(0, 10).map(notification => (
              <CDropdownItem 
                key={notification._id}
                className={`p-3 border-bottom ${!notification.read ? 'bg-light' : ''}`}
              >
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <strong className="text-primary">{notification.title}</strong>
                  <small className="text-muted">{formatTime(notification.createdAt)}</small>
                </div>
                <p className="mb-2 small">{notification.content}</p>
                <div className="d-flex justify-content-between align-items-center">
                  <small className={`badge bg-${getNotificationTypeColor(notification.type)}`}>
                    {notification.type}
                  </small>
                  <div className="d-flex gap-1">
                    {!notification.read && (
                      <CButton
                        color="success"
                        size="sm"
                        variant="ghost"
                        onClick={(e) => handleMarkAsRead(notification._id, e)}
                        title="Mark as read"
                      >
                        <CIcon icon={cilCheck} />
                      </CButton>
                    )}
                    <CButton
                      color="danger"
                      size="sm"
                      variant="ghost"
                      onClick={(e) => handleDelete(notification._id, e)}
                      title="Delete notification"
                    >
                      <CIcon icon={cilTrash} />
                    </CButton>
                  </div>
                </div>
              </CDropdownItem>
            ))
          )}
        </div>
        
        {notifications.length > 10 && (
          <CDropdownItem href="/notifications" className="text-center bg-light">
            View all notifications ({notifications.length})
          </CDropdownItem>
        )}
      </CDropdownMenu>
    </CDropdown>
  );
};

const getNotificationTypeColor = (type) => {
  switch (type) {
    case 'deposit': return 'success';
    case 'withdrawal': return 'info';
    case 'bonus': return 'warning';
    case 'security': return 'danger';
    case 'system': return 'secondary';
    default: return 'primary';
  }
};

export default EnhancedNotificationBell;