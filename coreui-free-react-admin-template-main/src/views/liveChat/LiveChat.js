// import React, { useState, useEffect, useRef, useCallback } from 'react'
// import {
//   CCard,
//   CCardHeader,
//   CCardBody,
//   CCol,
//   CRow,
//   CButton,
//   CFormInput,
//   CListGroup,
//   CListGroupItem,
//   CBadge,
//   CSpinner,
//   CAlert,
//   CModal,
//   CModalHeader,
//   CModalTitle,
//   CModalBody,
//   CModalFooter,
//   CFormSelect,
//   CInputGroup,
//   CInputGroupText,
//   CTooltip,
//   CProgress
// } from '@coreui/react'
// import CIcon from '@coreui/icons-react'
// import {
//   cilSend,
//   cilCommentBubble,
//   cilUser,
//   cilPaperclip,
//   cilPlus,
//   cilTrash,
//   cilPencil,
//   cilReload,
//   cilWarning,
//   cilSignalCellular4,
//   cilSignalCellular0,
//   cilCloudDownload,
//   cilCloudUpload
// } from '@coreui/icons'
// import  socketService  from '../../service/socketService'
// import  liveChatService  from '../../service/liveChatService'
// import { useAuth } from '../../context/AuthContext'

// const LiveChat = () => {
//   const { user, token } = useAuth()
//   const [chatRooms, setChatRooms] = useState([])
//   const [activeRoom, setActiveRoom] = useState(null)
//   const [messages, setMessages] = useState([])
//   const [newMessage, setNewMessage] = useState('')
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')
//   const [success, setSuccess] = useState('')
//   const [isTyping, setIsTyping] = useState(false)
//   const [typingUser, setTypingUser] = useState(null)
//   const [selectedFile, setSelectedFile] = useState(null)
//   const [socketConnected, setSocketConnected] = useState(false)
//   const [socketAuthenticated, setSocketAuthenticated] = useState(false)
//   const [connectionStatus, setConnectionStatus] = useState('disconnected')
//   const [connectionStats, setConnectionStats] = useState({})
//   const [debugMode, setDebugMode] = useState(false)
//   const [connectionLog, setConnectionLog] = useState([])
//   const messagesEndRef = useRef(null)
//   const fileInputRef = useRef(null)
//   const typingTimeoutRef = useRef(null)
//   const logRef = useRef([])
//   // console.log("token",user);
//   // Fixed Replies State
//   const [fixedReplies, setFixedReplies] = useState([])
//   const [showFixedReplies, setShowFixedReplies] = useState(false)
//   const [fixedReplyCategory, setFixedReplyCategory] = useState('all')
//   const [showFixedReplyModal, setShowFixedReplyModal] = useState(false)
//   const [newFixedReply, setNewFixedReply] = useState({ title: '', message: '', category: 'general' })

//   // Filter & Sort State
//   const [chatFilter, setChatFilter] = useState('all')
//   const [sortBy, setSortBy] = useState('unread')

//   const isAdmin = user?.role === 'Admin' || user?.role === 'SubAdmin'
//   const isUser = user?.role === 'user'

//   // Add to connection log
//   const addLog = useCallback((type, message, data = {}) => {
//     const logEntry = {
//       id: Date.now() + Math.random(),
//       type,
//       message,
//       data,
//       timestamp: new Date().toISOString()
//     };

//     logRef.current = [...logRef.current.slice(-49), logEntry]; // Keep last 50 entries
//     setConnectionLog(logRef.current);
//     console.log("token",token,user.userId);
//     console.log(`📝 ${type}: ${message}`, data);
//   }, []);

//   // Socket connection setup
// useEffect(() => {
//   if (user && token && !socketConnected) {
//     const timer = setTimeout(() => {
//       addLog('info', 'Retrying socket connection with available auth data');
//       socketService.connect(token, user);
//       console.log("token",token,user.userId);
//     }, 1000);

//     return () => clearTimeout(timer);
//   }
// }, [user, token, socketConnected, addLog]);
//   // Update connection state
//   const updateConnectionState = (status) => {
//     setSocketConnected(status.isConnected);
//     setSocketAuthenticated(status.isAuthenticated);
//     setConnectionStats(status);
//     console.log('🔌 Connection status updated:', status);
//     if (status.isConnected && status.isAuthenticated) {
//       setConnectionStatus('authenticated');
//     } else if (status.isConnected) {
//       setConnectionStatus('connected');
//     } else {
//       setConnectionStatus('disconnected');
//     }
//   }

//   // Update connection state
//   // const updateConnectionState = (status) => {
//   //   setSocketConnected(status.isConnected);
//   //   setSocketAuthenticated(status.isAuthenticated);
//   //   setConnectionStats(status);
//   //   console.log('🔌 Connection status updated:', status);
//   //   if (status.isConnected && status.isAuthenticated) {
//   //     setConnectionStatus('authenticated');
//   //   } else if (status.isConnected) {
//   //     setConnectionStatus('connected');
//   //   } else {
//   //     setConnectionStatus('disconnected');
//   //   }
//   // }

//   // Socket event handlers
//   // const handleSocketConnected = (data) => {
//   //   addLog('success', 'Socket connected', data);
//   //   setSocketConnected(true);
//   //   console.log('🔌 Socket connected', data);
//   //   setConnectionStatus('connected');
//   //   updateConnectionState(socketService.getConnectionStatus());
//   // }

//   // const handleSocketDisconnected = (data) => {
//   //   addLog('error', 'Socket disconnected', data);
//   //   setSocketConnected(false);
//   //       console.log('🔌 Socket disconnected', data);
//   //   setSocketAuthenticated(false);
//   //   setConnectionStatus('disconnected');
//   //   updateConnectionState(socketService.getConnectionStatus());
//   // }

//   // const handleConnectionError = (data) => {
//   //   addLog('error', 'Socket connection error', data);
//   //   setConnectionStatus('error');
//   //   setError(`Connection error: ${data.error}`);
//   // }

//   // const handleSocketAuthenticated = (data) => {
//   //   addLog('success', 'Socket authenticated', data);
//   //   setSocketAuthenticated(true);
//   //   setConnectionStatus('authenticated');
//   //   updateConnectionState(socketService.getConnectionStatus());
//   // }

//   // const handleSocketUnauthorized = (data) => {
//   //   addLog('error', 'Socket unauthorized', data);
//   //   setSocketAuthenticated(false);
//   //   setConnectionStatus('unauthorized');
//   //   setError('Authentication failed. Please refresh the page.');
//   // }

//   // const handleNewMessage = (data) => {
//   //   addLog('message', 'New message received', data);

//   //   if (data.roomId === activeRoom?.roomId) {
//   //     setMessages(prev => [...prev, data]);
//   //     // Auto-mark as read if it's the active room
//   //     if (data.senderId !== user.userId) {
//   //       socketService.markMessagesRead(activeRoom.roomId, user.userId, isUser ? 'user' : 'admin');
//   //     }
//   //   }
//   //   // Refresh chat list to update last message
//   //   fetchChatRooms();
//   // }

//   // const handleTypingIndicator = (data) => {
//   //   addLog('info', 'Typing indicator', data);

//   //   if (data.roomId === activeRoom?.roomId) {
//   //     setIsTyping(data.typing);
//   //     setTypingUser(data.userType === 'user' ? activeRoom.userName : 'Admin');

//   //     if (typingTimeoutRef.current) {
//   //       clearTimeout(typingTimeoutRef.current);
//   //     }

//   //     if (data.typing) {
//   //       typingTimeoutRef.current = setTimeout(() => {
//   //         setIsTyping(false);
//   //         setTypingUser(null);
//   //       }, 3000);
//   //     }
//   //   }
//   // }

//   // const handleMessagesRead = (data) => {
//   //   addLog('info', 'Messages read update', data);

//   //   if (data.roomId === activeRoom?.roomId) {
//   //     setMessages(prev => prev.map(msg =>
//   //       msg.senderId !== user.userId ? { ...msg, read: true } : msg
//   //     ));
//   //   }
//   // }

//   // const handleUnreadUpdate = (data) => {
//   //   addLog('info', 'Unread count update', data);

//   //   if (data.roomId === activeRoom?.roomId) {
//   //     setActiveRoom(prev => ({
//   //       ...prev,
//   //       unreadCount: data.unreadCount
//   //     }));
//   //   }
//   //   fetchChatRooms();
//   // }

//   // const handleChatStatusChanged = (data) => {
//   //   addLog('info', 'Chat status changed', data);

//   //   if (data.roomId === activeRoom?.roomId) {
//   //     setActiveRoom(prev => ({
//   //       ...prev,
//   //       status: data.status
//   //     }));
//   //   }
//   //   fetchChatRooms();
//   // }

//   // const handleAdminJoined = (data) => {
//   //   addLog('success', 'Admin joined chat', data);

//   //   if (data.roomId === activeRoom?.roomId) {
//   //     setActiveRoom(prev => ({
//   //       ...prev,
//   //       adminId: data.adminId,
//   //       adminName: data.adminName
//   //     }));
//   //     setSuccess(`Admin ${data.adminName} joined the chat`);
//   //   }
//   // }

//   // const handleChatClosed = (data) => {
//   //   addLog('info', 'Chat closed', data);

//   //   if (data.roomId === activeRoom?.roomId) {
//   //     setActiveRoom(prev => ({
//   //       ...prev,
//   //       status: 'closed'
//   //     }));
//   //     setSuccess('Chat has been closed');
//   //   }
//   //   fetchChatRooms();
//   // }

//   // const handleNewChatCreated = (data) => {
//   //   addLog('info', 'New chat created', data);

//   //   if (isAdmin) {
//   //     fetchChatRooms();
//   //   }
//   // }

//   // const handleRoomJoined = (data) => {
//   //   addLog('success', 'Room joined successfully', data);
//   // }

//   // const handleJoinError = (data) => {
//   //   addLog('error', 'Failed to join room', data);
//   //   setError(`Failed to join room: ${data.error}`);
//   // }

//   // const handlePong = (data) => {
//   //   addLog('info', 'Pong received', data);
//   //   setConnectionStats(prev => ({ ...prev, lastPing: data }));
//   // }

//   // const handleConnectionInfo = (data) => {
//   //   addLog('info', 'Connection info received', data);
//   //   setConnectionStats(prev => ({ ...prev, info: data }));
//   // }

//   // Load initial data
//   useEffect(() => {
//     fetchChatRooms();
//     if (isAdmin) {
//       fetchFixedReplies();
//     }
//   }, [isAdmin]);

//   // Auto-refresh chats
//   useEffect(() => {
//     const interval = setInterval(() => {
//       fetchChatRooms();
//       if (activeRoom) {
//         fetchChatMessages(activeRoom.roomId);
//       }
//     }, 10000); // Refresh every 10 seconds

//     return () => clearInterval(interval);
//   }, [activeRoom, chatFilter, sortBy]);

//   // Join room when active room changes
//   useEffect(() => {
//     if (activeRoom && user && socketConnected && socketAuthenticated) {
//       const success = socketService.joinChat(
//         activeRoom.roomId,
//         user.userId,
//         isUser ? 'user' : 'admin'
//       );

//       if (success) {
//         addLog('info', 'Joining chat room', { roomId: activeRoom.roomId });
//       } else {
//         addLog('error', 'Failed to join chat room', { roomId: activeRoom.roomId });
//       }
//     }
//   }, [activeRoom, user, socketConnected, socketAuthenticated, isUser, addLog]);

//   // Auto-scroll to bottom
//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }

//   const fetchChatRooms = async () => {
//     try {
//       let response;
//       if (isAdmin) {
//         response = await liveChatService.getAdminChats(chatFilter, sortBy);
//       } else {
//         response = await liveChatService.getUserChatHistory();
//       }

//       if (response.success) {
//         setChatRooms(response.chatRooms || []);
//         addLog('info', 'Chat rooms fetched', { count: response.chatRooms?.length });
//       }
//     } catch (err) {
//       const errorMsg = 'Failed to load chat rooms';
//       addLog('error', errorMsg, { error: err.message });
//       console.error(errorMsg, err);
//     }
//   }

//   const fetchChatMessages = async (roomId) => {
//     setLoading(true);
//     try {
//       const response = await liveChatService.getChatMessages(roomId);
//       if (response.success) {
//         setMessages(response.chatRoom.messages || []);

//         const room = chatRooms.find(chat => chat.roomId === roomId) || response.chatRoom;
//         setActiveRoom(room);

//         // Mark messages as read when opening chat
//         if (room && (room.unreadCount?.user > 0 || room.unreadCount?.admin > 0)) {
//           await liveChatService.markAsRead(roomId);
//           fetchChatRooms();
//         }

//         addLog('info', 'Chat messages fetched', { roomId, messageCount: response.chatRoom.messages?.length });
//       }
//     } catch (err) {
//       const errorMsg = 'Failed to load messages';
//       addLog('error', errorMsg, { error: err.message });
//       setError(errorMsg);
//     } finally {
//       setLoading(false);
//     }
//   }

//   const fetchFixedReplies = async () => {
//     try {
//       const response = await liveChatService.getFixedReplies(fixedReplyCategory);
//       if (response.success) {
//         setFixedReplies(response.fixedReplies || []);
//         addLog('info', 'Fixed replies fetched', { count: response.fixedReplies?.length });
//       }
//     } catch (err) {
//       addLog('error', 'Failed to load fixed replies', { error: err.message });
//       console.error('Failed to load fixed replies:', err);
//     }
//   }

//   const startNewChat = async () => {
//     const message = "Hello, I need help with my account.";
//     setLoading(true);
//     try {
//       const response = await liveChatService.startChat(message);
//       if (response.success) {
//         setChatRooms(prev => [response.chat, ...prev]);
//         setActiveRoom(response.chat);
//         setMessages(response.chat.messages || []);
//         setSuccess('Chat started successfully');
//         addLog('success', 'New chat started', { roomId: response.chat.roomId });
//       }
//     } catch (err) {
//       const errorMsg = err.message || 'Failed to start chat';
//       addLog('error', errorMsg, { error: err.message });
//       setError(errorMsg);
//     } finally {
//       setLoading(false);
//     }
//   }

//   const sendMessage = async () => {
//     if ((!newMessage.trim() && !selectedFile) || !activeRoom) return;

//     setLoading(true);
//     try {
//       let response;

//       if (selectedFile) {
//         response = await liveChatService.sendMessageWithFile(
//           activeRoom.roomId,
//           newMessage,
//           selectedFile
//         );
//         setSelectedFile(null);
//       } else {
//         if (isAdmin) {
//           response = await liveChatService.adminSendMessage(activeRoom.roomId, newMessage);
//         } else {
//           response = await liveChatService.userSendMessage(activeRoom.roomId, newMessage);
//         }
//       }

//       if (response.success) {
//         setNewMessage('');
//         setMessages(prev => [...prev, response.newMessage]);

//         // Send real-time message via socket
//         if (socketConnected && socketAuthenticated) {
//           const success = socketService.sendNewMessage(
//             activeRoom.roomId,
//             response.newMessage,
//             user.userId,
//             isUser ? 'user' : 'admin'
//           );

//           if (success) {
//             addLog('message', 'Message sent via socket', {
//               roomId: activeRoom.roomId,
//               messageId: response.newMessage._id
//             });
//           }
//         }

//         fetchChatRooms();
//         setSuccess('Message sent successfully');
//       } else {
//         setError(response.message || 'Failed to send message');
//       }
//     } catch (err) {
//       const errorMsg = err.message || 'Failed to send message';
//       addLog('error', errorMsg, { error: err.message });
//       setError(errorMsg);
//     } finally {
//       setLoading(false);
//     }
//   }

//   const sendFixedReply = async (fixedReply) => {
//     if (!activeRoom) return;

//     try {
//       const response = await liveChatService.useFixedReply(activeRoom.roomId, fixedReply._id);
//       if (response.success) {
//         setMessages(prev => [...prev, response.newMessage]);

//         // Send real-time message via socket
//         if (socketConnected && socketAuthenticated) {
//           socketService.sendNewMessage(
//             activeRoom.roomId,
//             response.newMessage,
//             user.userId,
//             'admin'
//           );
//         }

//         fetchChatRooms();
//         setShowFixedReplies(false);
//         setSuccess('Quick reply sent successfully');
//         addLog('info', 'Fixed reply sent', { fixedReplyId: fixedReply._id });
//       }
//     } catch (err) {
//       addLog('error', 'Failed to send quick reply', { error: err.message });
//       setError('Failed to send quick reply');
//     }
//   }

//   const handleFileSelect = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       if (file.size > 10 * 1024 * 1024) {
//         setError('File size must be less than 10MB');
//         return;
//       }

//       const allowedTypes = [
//         'image/jpeg', 'image/png', 'image/gif',
//         'application/pdf',
//         'application/msword',
//         'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//         'text/plain'
//       ];

//       if (!allowedTypes.includes(file.type)) {
//         setError('Invalid file type. Only images, PDFs, and documents are allowed.');
//         return;
//       }

//       setSelectedFile(file);
//       setError('');
//       addLog('info', 'File selected', { fileName: file.name, fileSize: file.size });
//     }
//   }

//   const removeSelectedFile = () => {
//     addLog('info', 'File removed', { fileName: selectedFile?.name });
//     setSelectedFile(null);
//     if (fileInputRef.current) {
//       fileInputRef.current.value = '';
//     }
//   }

//   const createFixedReply = async () => {
//     if (!newFixedReply.title.trim() || !newFixedReply.message.trim()) {
//       setError('Title and message are required');
//       return;
//     }

//     try {
//       const response = await liveChatService.createFixedReply(newFixedReply);
//       if (response.success) {
//         setFixedReplies(prev => [response.fixedReply, ...prev]);
//         setNewFixedReply({ title: '', message: '', category: 'general' });
//         setShowFixedReplyModal(false);
//         setSuccess('Quick reply created successfully');
//         addLog('success', 'Fixed reply created', { title: newFixedReply.title });
//       }
//     } catch (err) {
//       addLog('error', 'Failed to create quick reply', { error: err.message });
//       setError('Failed to create quick reply');
//     }
//   }

//   const handleTyping = () => {
//     if (activeRoom && user && socketConnected && socketAuthenticated) {
//       socketService.startTyping(
//         activeRoom.roomId,
//         user.userId,
//         isUser ? 'user' : 'admin'
//       );

//       // Stop typing after 2 seconds
//       if (typingTimeoutRef.current) {
//         clearTimeout(typingTimeoutRef.current);
//       }
//       typingTimeoutRef.current = setTimeout(() => {
//         socketService.stopTyping(
//           activeRoom.roomId,
//           user.userId,
//           isUser ? 'user' : 'admin'
//         );
//       }, 2000);
//     }
//   }

//   const closeChat = async () => {
//     if (!activeRoom) return;

//     try {
//       const response = isAdmin
//         ? await liveChatService.adminCloseChat(activeRoom.roomId)
//         : await liveChatService.userCloseChat(activeRoom.roomId);

//       if (response.success) {
//         setSuccess('Chat closed successfully');
//         setActiveRoom(prev => ({ ...prev, status: 'closed' }));

//         // Notify via socket
//         if (socketConnected && socketAuthenticated) {
//           socketService.updateChatStatus(activeRoom.roomId, 'closed', user.userId);
//         }

//         fetchChatRooms();
//         addLog('info', 'Chat closed', { roomId: activeRoom.roomId });
//       }
//     } catch (err) {
//       addLog('error', 'Failed to close chat', { error: err.message });
//       setError('Failed to close chat');
//     }
//   }

//   const assignChat = async (roomId) => {
//     try {
//       const response = await liveChatService.assignChat(roomId);
//       if (response.success) {
//         setSuccess('Chat assigned to you');

//         // Notify via socket
//         if (socketConnected && socketAuthenticated) {
//           socketService.notifyAdminAssignment(
//             roomId,
//             user.userId,
//             user.firstName || `Admin_${user.userId}`
//           );
//         }

//         fetchChatRooms();
//         if (activeRoom && activeRoom.roomId === roomId) {
//           setActiveRoom(response.chatRoom);
//         }
//         addLog('success', 'Chat assigned', { roomId, adminId: user.userId });
//       }
//     } catch (err) {
//       addLog('error', 'Failed to assign chat', { error: err.message });
//       setError('Failed to assign chat');
//     }
//   }

//   const getFileIcon = (mimeType) => {
//     if (mimeType?.startsWith('image/')) return '🖼️';
//     if (mimeType === 'application/pdf') return '📄';
//     if (mimeType?.includes('word') || mimeType?.includes('document')) return '📝';
//     if (mimeType === 'text/plain') return '📃';
//     return '📎';
//   }

//   const formatFileSize = (bytes) => {
//     if (!bytes) return '0 Bytes';
//     const k = 1024;
//     const sizes = ['Bytes', 'KB', 'MB', 'GB'];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
//   }

//   const getUnreadCount = (room) => {
//     if (isAdmin) return room.unreadCount?.admin || 0;
//     return room.unreadCount?.user || 0;
//   }

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       sendMessage();
//     }
//   }

//   const getStatusBadge = (status) => {
//     const statusConfig = {
//       waiting: { color: 'warning', text: 'Waiting' },
//       active: { color: 'success', text: 'Active' },
//       closed: { color: 'secondary', text: 'Closed' }
//     };

//     const config = statusConfig[status] || statusConfig.waiting;
//     return <CBadge color={config.color}>{config.text}</CBadge>;
//   }

//   const downloadFile = (attachment) => {
//     if (attachment && attachment.url) {
//       const link = document.createElement('a');
//       link.href = attachment.url;
//       link.download = attachment.originalName || 'download';
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       addLog('info', 'File downloaded', { fileName: attachment.originalName });
//     }
//   }

//   // Connection management functions
//   const testConnection = () => {
//     addLog('info', 'Manual connection test requested');
//     socketService.testConnection();
//   };

//   const reconnectSocket = () => {
//     addLog('info', 'Manual reconnect requested');
//     socketService.reconnect();
//   };

//   const getConnectionStatusColor = () => {
//     switch (connectionStatus) {
//       case 'authenticated': return 'success';
//       case 'connected': return 'info';
//       case 'error': return 'warning';
//       case 'unauthorized': return 'danger';
//       default: return 'secondary';
//     }
//   };

//   const getConnectionStatusText = () => {
//     switch (connectionStatus) {
//       case 'authenticated': return 'Authenticated & Connected';
//       case 'connected': return 'Connected';
//       case 'error': return 'Connection Error';
//       case 'unauthorized': return 'Unauthorized';
//       default: return 'Disconnected';
//     }
//   };

//   const getConnectionIcon = () => {
//     switch (connectionStatus) {
//       case 'authenticated': return cilSignalCellular4;
//       case 'connected': return cilSignalCellular4;
//       case 'error': return cilSignalCellular0;
//       case 'unauthorized': return cilWarning;
//       default: return cilSignalCellular0;
//     }
//   };

//   const clearLogs = () => {
//     logRef.current = [];
//     setConnectionLog([]);
//   };

//   return (
//     <>
//       <CRow>
//         <CCol xs={12}>
//           <CCard>
//             <CCardHeader className="d-flex justify-content-between align-items-center">
//               <div className="d-flex align-items-center">
//                 <CIcon icon={cilCommentBubble} className="me-2" />
//                 <h5 className="mb-0 me-3">Live Chat Support</h5>

//                 {/* Connection Status */}
//                 <div className="d-flex align-items-center me-3">
//                   <CIcon icon={getConnectionIcon()} className={`me-1 text-${getConnectionStatusColor()}`} />
//                   <CBadge color={getConnectionStatusColor()} className="me-1">
//                     {getConnectionStatusText()}
//                   </CBadge>
//                   {connectionStats.socketId && (
//                     <small className="text-muted">ID: {connectionStats.socketId}</small>
//                   )}
//                 </div>

//                 {isAdmin && (
//                   <CBadge color="primary" className="me-2">
//                     {chatRooms.filter(room => getUnreadCount(room) > 0).length} Unread
//                   </CBadge>
//                 )}
//               </div>

//               <div className="d-flex gap-2 align-items-center">
//                 {/* Connection Controls */}
//                 <CTooltip content="Test Connection">
//                   <CButton
//                     color="outline-info"
//                     size="sm"
//                     onClick={testConnection}
//                   >
//                     <CIcon icon={cilCloudDownload} />
//                   </CButton>
//                 </CTooltip>

//                 <CTooltip content="Reconnect">
//                   <CButton
//                     color="outline-warning"
//                     size="sm"
//                     onClick={reconnectSocket}
//                   >
//                     <CIcon icon={cilCloudUpload} />
//                   </CButton>
//                 </CTooltip>

//                 {isAdmin && (
//                   <>
//                     <CFormSelect
//                       size="sm"
//                       style={{ width: '120px' }}
//                       value={chatFilter}
//                       onChange={(e) => setChatFilter(e.target.value)}
//                     >
//                       <option value="all">All Chats</option>
//                       <option value="waiting">Waiting</option>
//                       <option value="active">Active</option>
//                       <option value="closed">Closed</option>
//                     </CFormSelect>

//                     <CFormSelect
//                       size="sm"
//                       style={{ width: '140px' }}
//                       value={sortBy}
//                       onChange={(e) => setSortBy(e.target.value)}
//                     >
//                       <option value="unread">Unread First</option>
//                       <option value="recent">Most Recent</option>
//                     </CFormSelect>

//                     <CButton
//                       color="primary"
//                       size="sm"
//                       onClick={() => setShowFixedReplyModal(true)}
//                     >
//                       <CIcon icon={cilPlus} className="me-1" />
//                       Add Reply
//                     </CButton>
//                   </>
//                 )}

//                 <CTooltip content="Refresh Chats">
//                   <CButton
//                     color="light"
//                     size="sm"
//                     onClick={fetchChatRooms}
//                   >
//                     <CIcon icon={cilReload} />
//                   </CButton>
//                 </CTooltip>

//                 <CTooltip content={debugMode ? "Hide Debug" : "Show Debug"}>
//                   <CButton
//                     color={debugMode ? "info" : "outline-info"}
//                     size="sm"
//                     onClick={() => setDebugMode(!debugMode)}
//                   >
//                     Debug
//                   </CButton>
//                 </CTooltip>

//                 {isUser && !activeRoom && (
//                   <CButton
//                     color="primary"
//                     onClick={startNewChat}
//                     disabled={loading}
//                   >
//                     {loading ? <CSpinner size="sm" /> : 'Start New Chat'}
//                   </CButton>
//                 )}
//               </div>
//             </CCardHeader>

//             <CCardBody>
//               {/* Connection Status Bar */}
//               {debugMode && (
//                 <CAlert color="info" className="mb-3">
//                   <div className="d-flex justify-content-between align-items-center">
//                     <strong>Connection Debug</strong>
//                     <CButton size="sm" color="danger" onClick={clearLogs}>
//                       Clear Logs
//                     </CButton>
//                   </div>
//                   <div className="mt-2">
//                     <small>
//                       Socket: {connectionStats.socketId} |
//                       Reconnect Attempts: {connectionStats.reconnectAttempts} |
//                       Event Listeners: {connectionStats.eventListeners}
//                     </small>
//                   </div>
//                 </CAlert>
//               )}

//               {/* Alerts */}
//               {error && (
//                 <CAlert color="danger" dismissible onClose={() => setError('')}>
//                   <CIcon icon={cilWarning} className="me-2" />
//                   {error}
//                 </CAlert>
//               )}
//               {success && (
//                 <CAlert color="success" dismissible onClose={() => setSuccess('')}>
//                   {success}
//                 </CAlert>
//               )}

//               {!socketConnected && (
//                 <CAlert color="warning" className="mb-3">
//                   <strong>Connection Issue:</strong> Real-time features are disabled. Some features may not work properly.
//                 </CAlert>
//               )}

//               {!socketAuthenticated && socketConnected && (
//                 <CAlert color="warning" className="mb-3">
//                   <strong>Authentication Pending:</strong> Waiting for socket authentication...
//                 </CAlert>
//               )}

//               {/* Debug Log Panel */}
//               {debugMode && connectionLog.length > 0 && (
//                 <CCard className="mb-3">
//                   <CCardHeader>
//                     <h6 className="mb-0">Connection Log (Last 50)</h6>
//                   </CCardHeader>
//                   <CCardBody className="p-0" style={{ maxHeight: '200px', overflowY: 'auto' }}>
//                     <CListGroup flush>
//                       {connectionLog.map((log) => (
//                         <CListGroupItem
//                           key={log.id}
//                           className={`p-2 ${log.type === 'error' ? 'text-danger' : log.type === 'success' ? 'text-success' : ''}`}
//                         >
//                           <div className="d-flex justify-content-between align-items-start">
//                             <div className="flex-grow-1">
//                               <small>
//                                 <span className="fw-bold">[{log.type.toUpperCase()}]</span> {log.message}
//                               </small>
//                               {Object.keys(log.data).length > 0 && (
//                                 <pre className="mt-1 mb-0 text-xs">
//                                   <code>{JSON.stringify(log.data, null, 2)}</code>
//                                 </pre>
//                               )}
//                             </div>
//                             <small className="text-muted ms-2">
//                               {new Date(log.timestamp).toLocaleTimeString()}
//                             </small>
//                           </div>
//                         </CListGroupItem>
//                       ))}
//                     </CListGroup>
//                   </CCardBody>
//                 </CCard>
//               )}

//               <CRow>
//                 {/* Chat List Sidebar */}
//                 <CCol md={4} className="chat-sidebar">
//                   <CCard>
//                     <CCardHeader className="d-flex justify-content-between align-items-center">
//                       <h6 className="mb-0">
//                         {isAdmin ? 'Chat Rooms' : 'My Chats'}
//                       </h6>
//                       <CBadge color="primary">
//                         {chatRooms.length}
//                       </CBadge>
//                     </CCardHeader>
//                     <CCardBody className="p-0">
//                       {loading && chatRooms.length === 0 ? (
//                         <div className="text-center py-4">
//                           <CSpinner color="primary" />
//                         </div>
//                       ) : chatRooms.length === 0 ? (
//                         <div className="text-center py-4 text-muted">
//                           <CIcon icon={cilCommentBubble} width={32} />
//                           <p>No chats found</p>
//                           {isUser && (
//                             <CButton color="primary" size="sm" onClick={startNewChat}>
//                               Start Your First Chat
//                             </CButton>
//                           )}
//                         </div>
//                       ) : (
//                         <CListGroup flush>
//                           {chatRooms.map((chat) => (
//                             <CListGroupItem
//                               key={chat.roomId}
//                               className={`chat-list-item ${
//                                 activeRoom?.roomId === chat.roomId ? 'active' : ''
//                               } ${getUnreadCount(chat) > 0 ? 'unread' : ''}`}
//                               onClick={() => fetchChatMessages(chat.roomId)}
//                               style={{ cursor: 'pointer' }}
//                             >
//                               <div className="d-flex justify-content-between align-items-start w-100">
//                                 <div className="flex-grow-1 me-2">
//                                   <div className="d-flex justify-content-between align-items-start">
//                                     <strong className="text-truncate">
//                                       {isAdmin ? chat.userName : `Support ${chat.adminName ? `- ${chat.adminName}` : ''}`}
//                                     </strong>
//                                     {getUnreadCount(chat) > 0 && (
//                                       <CBadge color="danger" className="ms-2">
//                                         {getUnreadCount(chat)}
//                                       </CBadge>
//                                     )}
//                                   </div>
//                                   <p className="mb-1 text-muted small text-truncate">
//                                     {chat.lastMessage || 'No messages yet'}
//                                   </p>
//                                   <div className="d-flex justify-content-between align-items-center">
//                                     <small className="text-muted">
//                                       {new Date(chat.lastMessageTime).toLocaleTimeString()}
//                                     </small>
//                                     {getStatusBadge(chat.status)}
//                                   </div>
//                                 </div>
//                               </div>

//                               {isAdmin && chat.status === 'waiting' && chat.adminId !== user.userId && (
//                                 <div className="mt-2">
//                                   <CButton
//                                     size="sm"
//                                     color="primary"
//                                     onClick={(e) => {
//                                       e.stopPropagation();
//                                       assignChat(chat.roomId);
//                                     }}
//                                   >
//                                     Take Chat
//                                   </CButton>
//                                 </div>
//                               )}
//                             </CListGroupItem>
//                           ))}
//                         </CListGroup>
//                       )}
//                     </CCardBody>
//                   </CCard>
//                 </CCol>

//                 {/* Chat Messages Area */}
//                 <CCol md={8}>
//                   <CCard className="h-100">
//                     <CCardHeader className="d-flex justify-content-between align-items-center">
//                       <div>
//                         {activeRoom ? (
//                           <>
//                             <strong>
//                               Chat with {isAdmin ? activeRoom.userName : activeRoom.adminName || 'Support'}
//                             </strong>
//                             <CBadge
//                               color={activeRoom.status === 'active' ? 'success' : 'secondary'}
//                               className="ms-2"
//                             >
//                               {activeRoom.status}
//                             </CBadge>
//                             {getUnreadCount(activeRoom) > 0 && (
//                               <CBadge color="danger" className="ms-2">
//                                 {getUnreadCount(activeRoom)} unread
//                               </CBadge>
//                             )}
//                           </>
//                         ) : (
//                           <span className="text-muted">Select a chat to start messaging</span>
//                         )}
//                       </div>

//                       {activeRoom && activeRoom.status !== 'closed' && (
//                         <div className="d-flex gap-2">
//                           {isAdmin && (
//                             <CButton
//                               size="sm"
//                               color="info"
//                               onClick={() => setShowFixedReplies(!showFixedReplies)}
//                             >
//                               {showFixedReplies ? 'Hide' : 'Show'} Quick Replies
//                             </CButton>
//                           )}
//                           <CButton
//                             size="sm"
//                             color="danger"
//                             onClick={closeChat}
//                           >
//                             Close Chat
//                           </CButton>
//                         </div>
//                       )}
//                     </CCardHeader>

//                     <CCardBody className="chat-messages-container">
//                       {!activeRoom ? (
//                         <div className="text-center py-5 text-muted">
//                           <CIcon icon={cilCommentBubble} width={48} />
//                           <p>Select a chat from the list to view messages</p>
//                           {isUser && (
//                             <CButton color="primary" onClick={startNewChat}>
//                               Start New Chat
//                             </CButton>
//                           )}
//                         </div>
//                       ) : (
//                         <>
//                           {/* Messages Area */}
//                           <div className="messages-area">
//                             {messages.length === 0 ? (
//                               <div className="text-center py-4 text-muted">
//                                 <p>No messages yet. Start the conversation!</p>
//                               </div>
//                             ) : (
//                               messages.map((message, index) => (
//                                 <div
//                                   key={index}
//                                   className={`message-bubble ${
//                                     message.senderId === user.userId ? 'own-message' : 'other-message'
//                                   } ${!message.read && message.senderId !== user.userId ? 'unread' : ''}`}
//                                 >
//                                   <div className="message-header">
//                                     <div>
//                                       <strong>{message.senderName}</strong>
//                                       {message.messageType === 'fixed_reply' && (
//                                         <CBadge color="info" className="ms-2" size="sm">
//                                           Quick Reply
//                                         </CBadge>
//                                       )}
//                                     </div>
//                                     <span className="message-time">
//                                       {new Date(message.timestamp).toLocaleTimeString()}
//                                     </span>
//                                   </div>

//                                   {message.attachment ? (
//                                     <div className="file-attachment">
//                                       <div className="file-icon">
//                                         {getFileIcon(message.attachment.mimeType)}
//                                       </div>
//                                       <div className="file-info">
//                                         <div className="file-name">
//                                           {message.attachment.originalName}
//                                         </div>
//                                         <div className="file-size">
//                                           {formatFileSize(message.attachment.size)}
//                                         </div>
//                                         <CButton
//                                           size="sm"
//                                           color="primary"
//                                           onClick={() => downloadFile(message.attachment)}
//                                         >
//                                           Download
//                                         </CButton>
//                                       </div>
//                                     </div>
//                                   ) : (
//                                     <div className="message-content">
//                                       {message.message}
//                                     </div>
//                                   )}

//                                   {message.senderId === user.userId && (
//                                     <div className="message-status">
//                                       {message.read ? '✓✓ Read' : '✓ Sent'}
//                                     </div>
//                                   )}
//                                 </div>
//                               ))
//                             )}

//                             {/* Typing Indicator */}
//                             {isTyping && (
//                               <div className="typing-indicator">
//                                 <div className="typing-dots">
//                                   <span></span>
//                                   <span></span>
//                                   <span></span>
//                                 </div>
//                                 <span>{typingUser} is typing...</span>
//                               </div>
//                             )}

//                             <div ref={messagesEndRef} />
//                           </div>

//                           {/* Fixed Replies Panel */}
//                           {showFixedReplies && isAdmin && (
//                             <div className="fixed-replies-panel">
//                               <div className="fixed-replies-header">
//                                 <h6 className="mb-0">Quick Replies</h6>
//                                 <CFormSelect
//                                   size="sm"
//                                   value={fixedReplyCategory}
//                                   onChange={(e) => {
//                                     setFixedReplyCategory(e.target.value);
//                                     fetchFixedReplies();
//                                   }}
//                                   style={{ width: '120px' }}
//                                 >
//                                   <option value="all">All</option>
//                                   <option value="general">General</option>
//                                   <option value="technical">Technical</option>
//                                   <option value="billing">Billing</option>
//                                   <option value="account">Account</option>
//                                 </CFormSelect>
//                               </div>
//                               <div className="fixed-replies-list">
//                                 {fixedReplies.length === 0 ? (
//                                   <div className="text-center py-3 text-muted">
//                                     <small>No quick replies found</small>
//                                   </div>
//                                 ) : (
//                                   fixedReplies.map((reply) => (
//                                     <div
//                                       key={reply._id}
//                                       className="fixed-reply-item"
//                                       onClick={() => sendFixedReply(reply)}
//                                     >
//                                       <strong>{reply.title}</strong>
//                                       <p className="mb-1">{reply.message}</p>
//                                       <small className="text-muted">
//                                         Used {reply.usedCount} times • {reply.category}
//                                       </small>
//                                     </div>
//                                   ))
//                                 )}
//                               </div>
//                             </div>
//                           )}

//                           {/* Message Input */}
//                           {activeRoom.status !== 'closed' && (
//                             <div className="message-input-container mt-3">
//                               {/* File Attachment Preview */}
//                               {selectedFile && (
//                                 <div className="file-preview mb-2">
//                                   <div className="file-preview-content">
//                                     <span className="file-icon">
//                                       {getFileIcon(selectedFile.type)}
//                                     </span>
//                                     <span className="file-name">
//                                       {selectedFile.name}
//                                     </span>
//                                     <CButton
//                                       color="danger"
//                                       size="sm"
//                                       onClick={removeSelectedFile}
//                                     >
//                                       Remove
//                                     </CButton>
//                                   </div>
//                                 </div>
//                               )}

//                               <div className="d-flex gap-2">
//                                 <CInputGroup>
//                                   <CInputGroupText>
//                                     <CTooltip content="Attach file">
//                                       <CButton
//                                         color="light"
//                                         size="sm"
//                                         onClick={() => fileInputRef.current?.click()}
//                                       >
//                                         <CIcon icon={cilPaperclip} />
//                                       </CButton>
//                                     </CTooltip>
//                                     <input
//                                       type="file"
//                                       ref={fileInputRef}
//                                       onChange={handleFileSelect}
//                                       style={{ display: 'none' }}
//                                       accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
//                                     />
//                                   </CInputGroupText>

//                                   <CFormInput
//                                     type="text"
//                                     value={newMessage}
//                                     onChange={(e) => setNewMessage(e.target.value)}
//                                     onKeyPress={handleKeyPress}
//                                     onInput={handleTyping}
//                                     placeholder="Type your message..."
//                                     disabled={loading || !socketConnected}
//                                   />

//                                   <CButton
//                                     color="primary"
//                                     onClick={sendMessage}
//                                     disabled={(!newMessage.trim() && !selectedFile) || loading || !socketConnected}
//                                   >
//                                     {loading ? <CSpinner size="sm" /> : <CIcon icon={cilSend} />}
//                                   </CButton>
//                                 </CInputGroup>
//                               </div>
//                             </div>
//                           )}
//                         </>
//                       )}
//                     </CCardBody>
//                   </CCard>
//                 </CCol>
//               </CRow>
//             </CCardBody>
//           </CCard>
//         </CCol>
//       </CRow>

//       {/* Fixed Reply Management Modal */}
//       <CModal
//         size="lg"
//         visible={showFixedReplyModal}
//         onClose={() => setShowFixedReplyModal(false)}
//       >
//         <CModalHeader>
//           <CModalTitle>Manage Quick Replies</CModalTitle>
//         </CModalHeader>
//         <CModalBody>
//           <div className="mb-3">
//             <h6>Add New Quick Reply</h6>
//             <div className="row g-3">
//               <div className="col-12">
//                 <CFormInput
//                   placeholder="Title"
//                   value={newFixedReply.title}
//                   onChange={(e) => setNewFixedReply(prev => ({
//                     ...prev,
//                     title: e.target.value
//                   }))}
//                 />
//               </div>
//               <div className="col-12">
//                 <CFormInput
//                   as="textarea"
//                   rows={3}
//                   placeholder="Message"
//                   value={newFixedReply.message}
//                   onChange={(e) => setNewFixedReply(prev => ({
//                     ...prev,
//                     message: e.target.value
//                   }))}
//                 />
//               </div>
//               <div className="col-12">
//                 <CFormSelect
//                   value={newFixedReply.category}
//                   onChange={(e) => setNewFixedReply(prev => ({
//                     ...prev,
//                     category: e.target.value
//                   }))}
//                 >
//                   <option value="general">General</option>
//                   <option value="technical">Technical</option>
//                   <option value="billing">Billing</option>
//                   <option value="account">Account</option>
//                   <option value="other">Other</option>
//                 </CFormSelect>
//               </div>
//             </div>
//             <CButton
//               color="primary"
//               className="mt-2"
//               onClick={createFixedReply}
//               disabled={!newFixedReply.title.trim() || !newFixedReply.message.trim()}
//             >
//               Add Quick Reply
//             </CButton>
//           </div>

//           <hr />

//           <h6>Existing Quick Replies</h6>
//           <div className="fixed-replies-list">
//             {fixedReplies.length === 0 ? (
//               <div className="text-center py-3 text-muted">
//                 <small>No quick replies created yet</small>
//               </div>
//             ) : (
//               fixedReplies.map((reply) => (
//                 <div key={reply._id} className="fixed-reply-item admin-view">
//                   <div className="d-flex justify-content-between align-items-start">
//                     <div>
//                       <strong>{reply.title}</strong>
//                       <CBadge color="secondary" className="ms-2">
//                         {reply.category}
//                       </CBadge>
//                     </div>
//                     <div>
//                       <CButton
//                         size="sm"
//                         color="warning"
//                         className="me-1"
//                         onClick={async () => {
//                           const newTitle = prompt('Enter new title:', reply.title);
//                           if (newTitle) {
//                             try {
//                               await liveChatService.updateFixedReply(reply._id, {
//                                 ...reply,
//                                 title: newTitle
//                               });
//                               fetchFixedReplies();
//                               setSuccess('Quick reply updated successfully');
//                             } catch (err) {
//                               setError('Failed to update quick reply');
//                             }
//                           }
//                         }}
//                       >
//                         <CIcon icon={cilPencil} />
//                       </CButton>
//                       <CButton
//                         size="sm"
//                         color="danger"
//                         onClick={async () => {
//                           if (window.confirm('Are you sure you want to delete this quick reply?')) {
//                             try {
//                               await liveChatService.deleteFixedReply(reply._id);
//                               setFixedReplies(prev => prev.filter(r => r._id !== reply._id));
//                               setSuccess('Quick reply deleted successfully');
//                             } catch (err) {
//                               setError('Failed to delete quick reply');
//                             }
//                           }
//                         }}
//                       >
//                         <CIcon icon={cilTrash} />
//                       </CButton>
//                     </div>
//                   </div>
//                   <p className="mb-1">{reply.message}</p>
//                   <small className="text-muted">
//                     Used {reply.usedCount} times • Created {new Date(reply.createdAt).toLocaleDateString()}
//                   </small>
//                 </div>
//               ))
//             )}
//           </div>
//         </CModalBody>
//         <CModalFooter>
//           <CButton color="secondary" onClick={() => setShowFixedReplyModal(false)}>
//             Close
//           </CButton>
//         </CModalFooter>
//       </CModal>
//     </>
//   );
// };

// export default LiveChat;

import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CCol,
  CRow,
  CButton,
  CFormInput,
  CListGroup,
  CListGroupItem,
  CBadge,
  CSpinner,
  CAlert,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormSelect,
  CInputGroup,
  CInputGroupText,
  CTooltip,
  CProgress,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilSend,
  cilCommentBubble,
  cilUser,
  cilPaperclip,
  cilPlus,
  cilTrash,
  cilPencil,
  cilReload,
  cilWarning,
  cilSignalCellular4,
  cilSignalCellular0,
  cilCloudDownload,
  cilCloudUpload,
} from '@coreui/icons'
import socketService from '../../service/socketService'
import liveChatService from '../../service/liveChatService'
import { useAuth } from '../../context/AuthContext'

const LiveChat = () => {
  const { user, token } = useAuth()
  const [chatRooms, setChatRooms] = useState([])
  const [activeRoom, setActiveRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [typingUser, setTypingUser] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [socketConnected, setSocketConnected] = useState(false)
  const [socketAuthenticated, setSocketAuthenticated] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  const [connectionStats, setConnectionStats] = useState({})
  const [debugMode, setDebugMode] = useState(false)
  const [connectionLog, setConnectionLog] = useState([])
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const logRef = useRef([])

  // Fixed Replies State
  const [fixedReplies, setFixedReplies] = useState([])
  const [showFixedReplies, setShowFixedReplies] = useState(false)
  const [fixedReplyCategory, setFixedReplyCategory] = useState('all')
  const [showFixedReplyModal, setShowFixedReplyModal] = useState(false)
  const [newFixedReply, setNewFixedReply] = useState({
    title: '',
    message: '',
    category: 'general',
  })

  // Filter & Sort State
  const [chatFilter, setChatFilter] = useState('all')
  const [sortBy, setSortBy] = useState('unread')

  const isAdmin = user?.role === 'Admin' || user?.role === 'SubAdmin'
  const isUser = user?.role === 'user'

  // Add to connection log
  const addLog = useCallback((type, message, data = {}) => {
    const logEntry = {
      id: Date.now() + Math.random(),
      type,
      message,
      data,
      timestamp: new Date().toISOString(),
    }

    logRef.current = [...logRef.current.slice(-49), logEntry]
    setConnectionLog(logRef.current)
    console.log(`📝 ${type}: ${message}`, data)
  }, [])

  // Socket connection setup
  // Socket connection setup - Replace your current useEffect with this:
  useEffect(() => {
    if (user && token) {
      console.log('🔌 Socket Connection Debug:', {
        userExists: !!user,
        tokenExists: !!token,
        userId: user?.userId,
        userRole: user?.role,
        socketService: !!socketService,
      })

      const initializeSocket = async () => {
        try {
          addLog('info', 'Starting socket connection process...')

          // Check if socket service is available
          if (!socketService) {
            addLog('error', 'Socket service not available')
            setError('Chat service unavailable. Please refresh the page.')
            return
          }

          // Check current connection status
          const currentStatus = socketService.getConnectionStatus()
          console.log('📊 Current Socket Status:', currentStatus)

          if (!currentStatus.isConnected) {
            addLog('info', 'Attempting to connect to socket server...')
            await socketService.connect(token, user)

            // Setup socket event listeners
            setupSocketEventListeners()

            // Check connection status after attempt
            setTimeout(() => {
              const newStatus = socketService.getConnectionStatus()
              console.log('📊 Socket Status After Connection Attempt:', newStatus)
              updateConnectionState(newStatus)
            }, 2000)
          } else {
            addLog('info', 'Socket already connected, setting up listeners')
            setupSocketEventListeners()
            updateConnectionState(currentStatus)
          }
        } catch (error) {
          console.error('❌ Socket initialization failed:', error)
          addLog('error', 'Socket connection failed', {
            error: error.message,
            stack: error.stack,
          })
          setError(`Connection failed: ${error.message}`)
        }
      }

      const timer = setTimeout(initializeSocket, 1000)
      return () => clearTimeout(timer)
    }
  }, [user, token, addLog])

  // Initialize socket connection
  const initializeSocketConnection = async () => {
    try {
      addLog('info', 'Connecting to socket server...')
      await socketService.connect(token, user)

      // Setup socket event listeners
      setupSocketEventListeners()
    } catch (error) {
      addLog('error', 'Socket connection failed', { error: error.message })
      setError('Failed to connect to chat server. Please refresh the page.')
    }
  }

  // Setup all socket event listeners
  const setupSocketEventListeners = () => {
    if (!socketService.socket) return

    // Connection events
    socketService.on('socket_connected', handleSocketConnected)
    socketService.on('socket_disconnected', handleSocketDisconnected)
    socketService.on('socket_error', handleConnectionError)
    socketService.on('socket_authenticated', handleSocketAuthenticated)
    socketService.on('socket_unauthorized', handleSocketUnauthorized)

    // Chat events
    socketService.on('new_message', handleNewMessage)
    socketService.on('user_typing', handleTypingIndicator)
    socketService.on('messages_read', handleMessagesRead)
    socketService.on('unread_update', handleUnreadUpdate)
    socketService.on('chat_status_changed', handleChatStatusChanged)
    socketService.on('admin_joined_chat', handleAdminJoined)
    socketService.on('chat_closed', handleChatClosed)
    socketService.on('user_joined', handleUserJoined)
    socketService.on('user_left', handleUserLeft)
    socketService.on('room_joined', handleRoomJoined)
    socketService.on('join_error', handleJoinError)
    socketService.on('message_delivered', handleMessageDelivered)
    socketService.on('message_error', handleMessageError)

    // Admin events
    socketService.on('admin:new_chat_created', handleNewChatCreated)
    socketService.on('admin:new_chat_message', handleNewChatMessage)

    // Utility events
    socketService.on('pong', handlePong)
    socketService.on('connection_info', handleConnectionInfo)

    addLog('success', 'All socket event listeners registered')
  }

  // Cleanup socket listeners on unmount
  useEffect(() => {
    return () => {
      if (socketService) {
        socketService.disconnect()
      }
    }
  }, [])

  // Socket event handlers
  const handleSocketConnected = (data) => {
    addLog('success', 'Socket connected', data)
    console.log('success', 'Socket connected', data)
    setSocketConnected(true)
    setConnectionStatus('connected')
    updateConnectionState(socketService.getConnectionStatus())
  }

  const handleSocketDisconnected = (data) => {
    addLog('error', 'Socket disconnected', data)
    setSocketConnected(false)
    setSocketAuthenticated(false)
    setConnectionStatus('disconnected')
    updateConnectionState(socketService.getConnectionStatus())
  }

  const handleConnectionError = (data) => {
    addLog('error', 'Socket connection error', data)
    setConnectionStatus('error')
    setError(`Connection error: ${data.error}`)
  }

  const handleSocketAuthenticated = (data) => {
    addLog('success', 'Socket authenticated', data)
    setSocketAuthenticated(true)
    setConnectionStatus('authenticated')
    updateConnectionState(socketService.getConnectionStatus())

    // Fetch initial data after authentication
    fetchChatRooms()
    if (isAdmin) {
      fetchFixedReplies()
    }
  }

  const handleSocketUnauthorized = (data) => {
    addLog('error', 'Socket unauthorized', data)
    setSocketAuthenticated(false)
    setConnectionStatus('unauthorized')
    setError('Authentication failed. Please refresh the page.')
  }

  const handleNewMessage = (data) => {
    addLog('message', 'New message received', data)

    if (data.roomId === activeRoom?.roomId) {
      setMessages((prev) => [...prev, data])
      // Auto-mark as read if it's the active room and user is viewing
      if (data.senderId !== user.userId && document.visibilityState === 'visible') {
        socketService.markMessagesRead(activeRoom.roomId, user.userId, isUser ? 'user' : 'admin')
      }

      // Auto-scroll to new message
      setTimeout(() => {
        scrollToBottom()
      }, 100)
    }

    // Refresh chat list to update last message and unread counts
    fetchChatRooms()
  }

  const handleTypingIndicator = (data) => {
    addLog('info', 'Typing indicator', data)

    if (data.roomId === activeRoom?.roomId) {
      setIsTyping(data.typing)
      setTypingUser(data.userName || (data.userType === 'user' ? activeRoom.userName : 'Admin'))

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      if (data.typing) {
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false)
          setTypingUser(null)
        }, 3000)
      }
    }
  }

  const handleMessagesRead = (data) => {
    addLog('info', 'Messages read update', data)

    if (data.roomId === activeRoom?.roomId) {
      setMessages((prev) =>
        prev.map((msg) => (msg.senderId !== user.userId ? { ...msg, read: true } : msg)),
      )

      // Update active room unread count
      setActiveRoom((prev) => ({
        ...prev,
        unreadCount: {
          ...prev.unreadCount,
          [isUser ? 'user' : 'admin']: 0,
        },
      }))
    }
  }

  const handleUnreadUpdate = (data) => {
    addLog('info', 'Unread count update', data)

    if (data.roomId === activeRoom?.roomId) {
      setActiveRoom((prev) => ({
        ...prev,
        unreadCount: data.unreadCount,
      }))
    }
    fetchChatRooms()
  }

  const handleChatStatusChanged = (data) => {
    addLog('info', 'Chat status changed', data)

    if (data.roomId === activeRoom?.roomId) {
      setActiveRoom((prev) => ({
        ...prev,
        status: data.status,
      }))
    }
    fetchChatRooms()
  }

  const handleAdminJoined = (data) => {
    addLog('success', 'Admin joined chat', data)

    if (data.roomId === activeRoom?.roomId) {
      setActiveRoom((prev) => ({
        ...prev,
        adminId: data.adminId,
        adminName: data.adminName,
      }))
      setSuccess(`Admin ${data.adminName} joined the chat`)
    }
  }

  const handleChatClosed = (data) => {
    addLog('info', 'Chat closed', data)

    if (data.roomId === activeRoom?.roomId) {
      setActiveRoom((prev) => ({
        ...prev,
        status: 'closed',
      }))
      setSuccess('Chat has been closed')
    }
    fetchChatRooms()
  }

  const handleUserJoined = (data) => {
    addLog('info', 'User joined room', data)
  }

  const handleUserLeft = (data) => {
    addLog('info', 'User left room', data)
  }

  const handleRoomJoined = (data) => {
    addLog('success', 'Room joined successfully', data)
  }

  const handleJoinError = (data) => {
    addLog('error', 'Failed to join room', data)
    setError(`Failed to join room: ${data.error}`)
  }

  const handleMessageDelivered = (data) => {
    addLog('info', 'Message delivery confirmed', data)

    // Update message status in UI
    if (data.messageId) {
      setMessages((prev) =>
        prev.map((msg) => (msg.messageId === data.messageId ? { ...msg, delivered: true } : msg)),
      )
    }
  }

  const handleMessageError = (data) => {
    addLog('error', 'Message delivery failed', data)
    setError(`Failed to send message: ${data.error}`)
  }

  const handleNewChatCreated = (data) => {
    addLog('info', 'New chat created', data)

    if (isAdmin) {
      fetchChatRooms()
      setSuccess(`New chat started by ${data.userName}`)
    }
  }

  const handleNewChatMessage = (data) => {
    addLog('info', 'New message in unassigned chat', data)

    if (isAdmin) {
      fetchChatRooms()
    }
  }

  const handlePong = (data) => {
    addLog('info', 'Pong received', data)
    setConnectionStats((prev) => ({ ...prev, lastPing: data }))
  }

  const handleConnectionInfo = (data) => {
    addLog('info', 'Connection info received', data)
    setConnectionStats((prev) => ({ ...prev, info: data }))
  }

  // Update connection state
  const updateConnectionState = (status) => {
    setSocketConnected(status.isConnected)
    setSocketAuthenticated(status.isAuthenticated)
    setConnectionStats(status)

    if (status.isConnected && status.isAuthenticated) {
      setConnectionStatus('authenticated')
    } else if (status.isConnected) {
      setConnectionStatus('connected')
    } else {
      setConnectionStatus('disconnected')
    }
  }

  // Load initial data
  useEffect(() => {
    if (socketAuthenticated) {
      fetchChatRooms()
      if (isAdmin) {
        fetchFixedReplies()
      }
    }
  }, [socketAuthenticated, isAdmin])

  // Auto-refresh chats
  useEffect(() => {
    const interval = setInterval(() => {
      if (socketAuthenticated) {
        fetchChatRooms()
        if (activeRoom) {
          fetchChatMessages(activeRoom.roomId)
        }
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [activeRoom, chatFilter, sortBy, socketAuthenticated])

  // Join room when active room changes
  useEffect(() => {
    if (activeRoom && user && socketConnected && socketAuthenticated) {
      const success = socketService.joinChat(
        activeRoom.roomId,
        user.userId,
        isUser ? 'user' : 'admin',
      )

      if (success) {
        addLog('info', 'Joining chat room', { roomId: activeRoom.roomId })

        // Mark messages as read when joining room
        if (activeRoom.unreadCount && getUnreadCount(activeRoom) > 0) {
          socketService.markMessagesRead(activeRoom.roomId, user.userId, isUser ? 'user' : 'admin')
        }
      } else {
        addLog('error', 'Failed to join chat room', { roomId: activeRoom.roomId })
      }
    }
  }, [activeRoom, user, socketConnected, socketAuthenticated, isUser, addLog])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchChatRooms = async () => {
    try {
      let response
      if (isAdmin) {
        response = await liveChatService.getAdminChats(chatFilter, sortBy)
      } else {
        response = await liveChatService.getUserChatHistory()
      }

      if (response.success) {
        setChatRooms(response.chatRooms || [])
        addLog('info', 'Chat rooms fetched', { count: response.chatRooms?.length })
      }
    } catch (err) {
      const errorMsg = 'Failed to load chat rooms'
      addLog('error', errorMsg, { error: err.message })
      console.error(errorMsg, err)
    }
  }

  const fetchChatMessages = async (roomId) => {
    setLoading(true)
    try {
      const response = await liveChatService.getChatMessages(roomId)
      if (response.success) {
        setMessages(response.chatRoom.messages || [])

        const room = chatRooms.find((chat) => chat.roomId === roomId) || response.chatRoom
        setActiveRoom(room)

        // Mark messages as read when opening chat
        if (room && getUnreadCount(room) > 0) {
          await liveChatService.markAsRead(roomId)
          fetchChatRooms()
        }

        addLog('info', 'Chat messages fetched', {
          roomId,
          messageCount: response.chatRoom.messages?.length,
        })
      }
    } catch (err) {
      const errorMsg = 'Failed to load messages'
      addLog('error', errorMsg, { error: err.message })
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const fetchFixedReplies = async () => {
    try {
      const response = await liveChatService.getFixedReplies(fixedReplyCategory)
      if (response.success) {
        setFixedReplies(response.fixedReplies || [])
        addLog('info', 'Fixed replies fetched', { count: response.fixedReplies?.length })
      }
    } catch (err) {
      addLog('error', 'Failed to load fixed replies', { error: err.message })
      console.error('Failed to load fixed replies:', err)
    }
  }

  const startNewChat = async () => {
    const message = 'Hello, I need help with my account.'
    setLoading(true)
    try {
      const response = await liveChatService.startChat(message)
      if (response.success) {
        setChatRooms((prev) => [response.chatRoom, ...prev])
        setActiveRoom(response.chatRoom)
        setMessages(response.chatRoom.messages || [])
        setSuccess('Chat started successfully')
        addLog('success', 'New chat started', { roomId: response.chatRoom.roomId })

        // Join the new chat room via socket
        if (socketConnected && socketAuthenticated) {
          socketService.joinChat(response.chatRoom.roomId, user.userId, 'user')
        }
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to start chat'
      addLog('error', errorMsg, { error: err.message })
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || !activeRoom) return

    setLoading(true)
    try {
      let response

      // Create temporary message for immediate UI update
      const tempMessage = {
        _id: `temp_${Date.now()}`,
        senderId: user.userId,
        senderType: isUser ? 'user' : 'admin',
        senderName: user.name || user.firstName || `User_${user.userId}`,
        message: newMessage.trim(),
        messageType: selectedFile ? 'file' : 'text',
        attachment: selectedFile
          ? {
              originalName: selectedFile.name,
              size: selectedFile.size,
              mimetype: selectedFile.type,
            }
          : undefined,
        read: false,
        timestamp: new Date().toISOString(),
        isSending: true,
      }

      // Add temporary message immediately
      setMessages((prev) => [...prev, tempMessage])
      setNewMessage('')

      if (selectedFile) {
        response = await liveChatService.sendMessageWithFile(
          activeRoom.roomId,
          newMessage,
          selectedFile,
          (progress) => {
            // Update progress if needed
            addLog('info', 'File upload progress', { progress })
          },
        )
        setSelectedFile(null)
      } else {
        if (isAdmin) {
          response = await liveChatService.adminSendMessage(activeRoom.roomId, newMessage)
        } else {
          response = await liveChatService.userSendMessage(activeRoom.roomId, newMessage)
        }
      }

      if (response.success) {
        // Replace temporary message with real one
        setMessages((prev) =>
          prev.map((msg) => (msg._id === tempMessage._id ? response.newMessage : msg)),
        )

        // Send real-time message via socket
        if (socketConnected && socketAuthenticated) {
          const success = socketService.sendNewMessage(
            activeRoom.roomId,
            response.newMessage,
            user.userId,
            isUser ? 'user' : 'admin',
          )

          if (success) {
            addLog('message', 'Message sent via socket', {
              roomId: activeRoom.roomId,
              messageId: response.newMessage._id,
            })
          }
        }

        fetchChatRooms()
        setSuccess('Message sent successfully')

        // Start typing indicator
        handleTyping()
      } else {
        // Remove temporary message on error
        setMessages((prev) => prev.filter((msg) => msg._id !== tempMessage._id))
        setError(response.message || 'Failed to send message')
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to send message'
      addLog('error', errorMsg, { error: err.message })
      setError(errorMsg)
      // Remove temporary message on error
      setMessages((prev) => prev.filter((msg) => msg.isSending !== true))
    } finally {
      setLoading(false)
    }
  }

  const sendFixedReply = async (fixedReply) => {
    if (!activeRoom) return

    try {
      const response = await liveChatService.useFixedReply(activeRoom.roomId, fixedReply._id)
      if (response.success) {
        setMessages((prev) => [...prev, response.newMessage])

        // Send real-time message via socket
        if (socketConnected && socketAuthenticated) {
          socketService.sendNewMessage(activeRoom.roomId, response.newMessage, user.userId, 'admin')
        }

        fetchChatRooms()
        setShowFixedReplies(false)
        setSuccess('Quick reply sent successfully')
        addLog('info', 'Fixed reply sent', { fixedReplyId: fixedReply._id })
      }
    } catch (err) {
      addLog('error', 'Failed to send quick reply', { error: err.message })
      setError('Failed to send quick reply')
    }
  }

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        return
      }

      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
      ]

      if (!allowedTypes.includes(file.type)) {
        setError('Invalid file type. Only images, PDFs, and documents are allowed.')
        return
      }

      setSelectedFile(file)
      setError('')
      addLog('info', 'File selected', { fileName: file.name, fileSize: file.size })
    }
  }

  const removeSelectedFile = () => {
    addLog('info', 'File removed', { fileName: selectedFile?.name })
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const createFixedReply = async () => {
    if (!newFixedReply.title.trim() || !newFixedReply.message.trim()) {
      setError('Title and message are required')
      return
    }

    try {
      const response = await liveChatService.createFixedReply(newFixedReply)
      if (response.success) {
        setFixedReplies((prev) => [response.fixedReply, ...prev])
        setNewFixedReply({ title: '', message: '', category: 'general' })
        setShowFixedReplyModal(false)
        setSuccess('Quick reply created successfully')
        addLog('success', 'Fixed reply created', { title: newFixedReply.title })
      }
    } catch (err) {
      addLog('error', 'Failed to create quick reply', { error: err.message })
      setError('Failed to create quick reply')
    }
  }

  const handleTyping = () => {
    if (activeRoom && user && socketConnected && socketAuthenticated) {
      socketService.startTyping(activeRoom.roomId, user.userId, isUser ? 'user' : 'admin')

      // Stop typing after 2 seconds
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      typingTimeoutRef.current = setTimeout(() => {
        socketService.stopTyping(activeRoom.roomId, user.userId, isUser ? 'user' : 'admin')
      }, 2000)
    }
  }

  const closeChat = async () => {
    if (!activeRoom) return

    try {
      const response = isAdmin
        ? await liveChatService.adminCloseChat(activeRoom.roomId)
        : await liveChatService.userCloseChat(activeRoom.roomId)

      if (response.success) {
        setSuccess('Chat closed successfully')
        setActiveRoom((prev) => ({ ...prev, status: 'closed' }))

        // Notify via socket
        if (socketConnected && socketAuthenticated) {
          socketService.updateChatStatus(activeRoom.roomId, 'closed', user.userId)
        }

        fetchChatRooms()
        addLog('info', 'Chat closed', { roomId: activeRoom.roomId })
      }
    } catch (err) {
      addLog('error', 'Failed to close chat', { error: err.message })
      setError('Failed to close chat')
    }
  }

  const assignChat = async (roomId) => {
    try {
      const response = await liveChatService.assignChat(roomId)
      if (response.success) {
        setSuccess('Chat assigned to you')

        // Notify via socket
        if (socketConnected && socketAuthenticated) {
          socketService.notifyAdminAssignment(
            roomId,
            user.userId,
            user.name || user.firstName || `Admin_${user.userId}`,
          )
        }

        fetchChatRooms()
        if (activeRoom && activeRoom.roomId === roomId) {
          setActiveRoom(response.chatRoom)
        }
        addLog('success', 'Chat assigned', { roomId, adminId: user.userId })
      }
    } catch (err) {
      addLog('error', 'Failed to assign chat', { error: err.message })
      setError('Failed to assign chat')
    }
  }

  const getFileIcon = (mimeType) => {
    if (mimeType?.startsWith('image/')) return '🖼️'
    if (mimeType === 'application/pdf') return '📄'
    if (mimeType?.includes('word') || mimeType?.includes('document')) return '📝'
    if (mimeType === 'text/plain') return '📃'
    return '📎'
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getUnreadCount = (room) => {
    if (isAdmin) return room.unreadCount?.admin || 0
    return room.unreadCount?.user || 0
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      waiting: { color: 'warning', text: 'Waiting' },
      active: { color: 'success', text: 'Active' },
      closed: { color: 'secondary', text: 'Closed' },
    }

    const config = statusConfig[status] || statusConfig.waiting
    return <CBadge color={config.color}>{config.text}</CBadge>
  }

  const downloadFile = (attachment) => {
    if (attachment && attachment.url) {
      const link = document.createElement('a')
      link.href = attachment.url
      link.download = attachment.originalName || 'download'
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      addLog('info', 'File downloaded', { fileName: attachment.originalName })
    }
  }

  // Connection management functions
  const testConnection = () => {
    addLog('info', 'Manual connection test requested')
    socketService.testConnection()
  }

  const reconnectSocket = () => {
    addLog('info', 'Manual reconnect requested')
    socketService.reconnect()
  }

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'authenticated':
        return 'success'
      case 'connected':
        return 'info'
      case 'error':
        return 'warning'
      case 'unauthorized':
        return 'danger'
      default:
        return 'secondary'
    }
  }

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'authenticated':
        return 'Authenticated & Connected'
      case 'connected':
        return 'Connected'
      case 'error':
        return 'Connection Error'
      case 'unauthorized':
        return 'Unauthorized'
      default:
        return 'Disconnected'
    }
  }

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'authenticated':
        return cilSignalCellular4
      case 'connected':
        return cilSignalCellular4
      case 'error':
        return cilSignalCellular0
      case 'unauthorized':
        return cilWarning
      default:
        return cilSignalCellular0
    }
  }

  const clearLogs = () => {
    logRef.current = []
    setConnectionLog([])
  }

  // Add CSS styles for better UI
  const styles = `
    .chat-sidebar {
      max-height: 70vh;
      overflow-y: auto;
    }
    .chat-list-item {
      border-left: 3px solid transparent;
      transition: all 0.2s ease;
    }
    .chat-list-item.active {
      border-left-color: #321fdb;
      background-color: #f0f4f8;
    }
    .chat-list-item.unread {
      border-left-color: #e55353;
    }
    .messages-area {
      max-height: 50vh;
      overflow-y: auto;
      padding: 1rem;
    }
    .message-bubble {
      margin-bottom: 1rem;
      padding: 0.75rem;
      border-radius: 0.75rem;
      max-width: 80%;
    }
    .own-message {
      background-color: #321fdb;
      color: white;
      margin-left: auto;
    }
    .other-message {
      background-color: #f0f4f8;
      color: #3c4b64;
    }
    .message-header {
      display: flex;
      justify-content: between;
      align-items: center;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
    }
    .message-time {
      font-size: 0.75rem;
      opacity: 0.7;
    }
    .message-status {
      font-size: 0.75rem;
      margin-top: 0.25rem;
      text-align: right;
    }
    .typing-indicator {
      display: flex;
      align-items: center;
      padding: 0.5rem;
      color: #6c757d;
      font-style: italic;
    }
    .typing-dots {
      display: flex;
      margin-right: 0.5rem;
    }
    .typing-dots span {
      height: 6px;
      width: 6px;
      background-color: #6c757d;
      border-radius: 50%;
      margin: 0 1px;
      animation: typing 1.4s infinite ease-in-out;
    }
    .typing-dots span:nth-child(1) { animation-delay: 0s; }
    .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
    .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes typing {
      0%, 60%, 100% { transform: scale(1); opacity: 0.5; }
      30% { transform: scale(1.2); opacity: 1; }
    }
    .file-attachment {
      display: flex;
      align-items: center;
      padding: 0.5rem;
      background: rgba(255,255,255,0.1);
      border-radius: 0.5rem;
      margin-top: 0.5rem;
    }
    .file-icon {
      font-size: 1.5rem;
      margin-right: 0.5rem;
    }
    .file-info {
      flex-grow: 1;
    }
    .file-name {
      font-weight: 500;
    }
    .file-size {
      font-size: 0.75rem;
      opacity: 0.7;
    }
    .file-preview {
      background: #f8f9fa;
      border: 1px solid #d8dbe0;
      border-radius: 0.375rem;
      padding: 0.75rem;
    }
    .file-preview-content {
      display: flex;
      align-items: center;
      justify-content: between;
    }
    .fixed-replies-panel {
      border: 1px solid #d8dbe0;
      border-radius: 0.375rem;
      margin-top: 1rem;
      max-height: 200px;
      overflow-y: auto;
    }
    .fixed-replies-header {
      padding: 0.75rem;
      background: #f8f9fa;
      border-bottom: 1px solid #d8dbe0;
      display: flex;
      justify-content: between;
      align-items: center;
    }
    .fixed-replies-list {
      padding: 0.5rem;
    }
    .fixed-reply-item {
      padding: 0.5rem;
      border: 1px solid #e9ecef;
      border-radius: 0.375rem;
      margin-bottom: 0.5rem;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }
    .fixed-reply-item:hover {
      background-color: #f8f9fa;
    }
    .fixed-reply-item.admin-view {
      cursor: default;
    }
    .fixed-reply-item.admin-view:hover {
      background-color: transparent;
    }
  `

  return (
    <>
      <style>{`
        /* Base responsive styles */
        .chat-container {
          min-height: 80vh;
        }
        
        .chat-sidebar {
          height: 60vh;
          overflow-y: auto;
          border-right: 1px solid #dee2e6;
        }
        
        .chat-messages-container {
          height: 60vh;
          display: flex;
          flex-direction: column;
        }
        
        .messages-area {
          flex: 1;
          overflow-y: auto;
          min-height: 200px;
          padding: 1rem;
        }
        
        .message-input-container {
          border-top: 1px solid #dee2e6;
          padding-top: 1rem;
          background: white;
        }
        
        /* Message bubbles */
        .message-bubble {
          margin-bottom: 1rem;
          padding: 0.75rem;
          border-radius: 1rem;
          max-width: 85%;
          word-wrap: break-word;
          position: relative;
        }
        
        .own-message {
          background: linear-gradient(135deg, #321fdb, #1f1498);
          color: white;
          margin-left: auto;
          border-bottom-right-radius: 0.25rem;
        }
        
        .other-message {
          background: #f8f9fa;
          color: #2f2f2f;
          border: 1px solid #e9ecef;
          margin-right: auto;
          border-bottom-left-radius: 0.25rem;
        }
        
        .message-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }
        
        .message-content {
          line-height: 1.4;
        }
        
        .message-time {
          font-size: 0.75rem;
          opacity: 0.8;
        }
        
        .message-status {
          font-size: 0.75rem;
          margin-top: 0.25rem;
          text-align: right;
          opacity: 0.8;
        }
        
        /* Typing indicator */
        .typing-indicator {
          display: flex;
          align-items: center;
          padding: 0.5rem 1rem;
          color: #6c757d;
          font-style: italic;
          font-size: 0.875rem;
        }
        
        .typing-dots {
          display: flex;
          margin-right: 0.5rem;
        }
        
        .typing-dots span {
          height: 6px;
          width: 6px;
          background-color: #6c757d;
          border-radius: 50%;
          margin: 0 1px;
          animation: typing 1.4s infinite ease-in-out;
        }
        
        .typing-dots span:nth-child(1) { animation-delay: 0s; }
        .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
        
        @keyframes typing {
          0%, 60%, 100% { transform: scale(1); opacity: 0.5; }
          30% { transform: scale(1.2); opacity: 1; }
        }
        
        /* File attachments */
        .file-attachment {
          display: flex;
          align-items: center;
          padding: 0.75rem;
          background: rgba(255,255,255,0.1);
          border-radius: 0.5rem;
          margin-top: 0.5rem;
        }
        
        .other-message .file-attachment {
          background: rgba(0,0,0,0.05);
        }
        
        .file-icon {
          font-size: 1.5rem;
          margin-right: 0.75rem;
        }
        
        .file-info {
          flex: 1;
          min-width: 0;
        }
        
        .file-name {
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .file-size {
          font-size: 0.75rem;
          opacity: 0.7;
          margin-bottom: 0.25rem;
        }
        
        /* File preview */
        .file-preview {
          background: #f8f9fa;
          border: 1px solid #d8dbe0;
          border-radius: 0.375rem;
          padding: 0.75rem;
          margin-bottom: 1rem;
        }
        
        .file-preview-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }
        
        /* Fixed replies */
        .fixed-replies-panel {
          border: 1px solid #d8dbe0;
          border-radius: 0.375rem;
          margin-top: 1rem;
          max-height: 200px;
          overflow-y: auto;
          background: white;
        }
        
        .fixed-replies-header {
          padding: 0.75rem;
          background: #f8f9fa;
          border-bottom: 1px solid #d8dbe0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .fixed-replies-list {
          padding: 0.5rem;
        }
        
        .fixed-reply-item {
          padding: 0.75rem;
          border: 1px solid #e9ecef;
          border-radius: 0.375rem;
          margin-bottom: 0.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
          background: white;
        }
        
        .fixed-reply-item:hover {
          background-color: #f8f9fa;
          border-color: #321fdb;
        }
        
        .fixed-reply-item.admin-view {
          cursor: default;
        }
        
        .fixed-reply-item.admin-view:hover {
          background-color: white;
          border-color: #e9ecef;
        }
        
        /* Chat list */
        .chat-list-item {
          border-left: 3px solid transparent;
          transition: all 0.2s ease;
          cursor: pointer;
          padding: 1rem;
        }
        
        .chat-list-item.active {
          border-left-color: #321fdb;
          background-color: #f0f4f8;
        }
        
        .chat-list-item.unread {
          border-left-color: #e55353;
          background-color: #fff5f5;
        }
        
        .chat-list-item:hover:not(.active) {
          background-color: #f8f9fa;
        }
        
        /* Connection status */
        .connection-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        
        /* Mobile optimizations */
        @media (max-width: 768px) {
          .chat-container {
            min-height: 100vh;
          }
          
          .chat-sidebar {
            height: 40vh;
            border-right: none;
            border-bottom: 1px solid #dee2e6;
          }
          
          .chat-messages-container {
            height: 50vh;
          }
          
          .messages-area {
            padding: 0.5rem;
          }
          
          .message-bubble {
            max-width: 95%;
            padding: 0.5rem;
          }
          
          .message-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.25rem;
          }
          
          .own-message .message-header {
            align-items: flex-end;
          }
          
          .file-preview-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
          
          .header-controls {
            flex-direction: column;
            gap: 0.5rem;
            align-items: flex-start !important;
          }
          
          .header-controls > div {
            width: 100%;
            justify-content: space-between;
          }
          
          .connection-status {
            justify-content: center;
            margin-bottom: 0.5rem;
          }
          
          .chat-actions {
            flex-wrap: wrap;
            gap: 0.5rem;
          }
          
          .chat-actions .btn {
            flex: 1;
            min-width: 120px;
          }
          
          .fixed-replies-header {
            flex-direction: column;
            gap: 0.5rem;
            align-items: stretch;
          }
          
          .fixed-replies-header h6 {
            margin-bottom: 0;
          }
        }
        
        @media (max-width: 576px) {
          .messages-area {
            padding: 0.25rem;
          }
          
          .message-bubble {
            max-width: 100%;
            margin-bottom: 0.75rem;
          }
          
          .chat-list-item {
            padding: 0.75rem;
          }
          
          .file-attachment {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
          
          .file-icon {
            margin-right: 0;
          }
          
          .input-group {
            flex-direction: column;
          }
          
          .input-group .input-group-text {
            border-radius: 0.375rem 0.375rem 0 0 !important;
            justify-content: center;
          }
          
          .input-group .form-control {
            border-radius: 0 !important;
            border-top: none;
          }
          
          .input-group .btn {
            border-radius: 0 0 0.375rem 0.375rem !important;
          }
        }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .other-message {
            background: #2f2f2f;
            color: #f8f9fa;
            border-color: #444;
          }
          
          .chat-list-item {
            background: #2f2f2f;
            color: #f8f9fa;
          }
          
          .chat-list-item.active {
            background: #3a3a3a;
          }
          
          .chat-list-item:hover:not(.active) {
            background: #363636;
          }
          
          .fixed-reply-item {
            background: #2f2f2f;
            border-color: #444;
            color: #f8f9fa;
          }
          
          .fixed-reply-item:hover {
            background: #3a3a3a;
          }
        }
        
        /* High contrast support */
        @media (prefers-contrast: high) {
          .message-bubble {
            border: 2px solid;
          }
          
          .own-message {
            border-color: #321fdb;
          }
          
          .other-message {
            border-color: #6c757d;
          }
        }
        
        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .typing-dots span {
            animation: none;
          }
          
          .chat-list-item {
            transition: none;
          }
          
          .fixed-reply-item {
            transition: none;
          }
        }
        
        /* Touch device optimizations */
        @media (hover: none) and (pointer: coarse) {
          .chat-list-item {
            padding: 1.25rem 1rem;
          }
          
          .btn {
            min-height: 44px;
            min-width: 44px;
          }
          
          .fixed-reply-item {
            padding: 1rem;
            margin-bottom: 0.75rem;
          }
        }
      `}</style>

      <CRow className="g-3">
        <CCol xs={12}>
          <CCard className="chat-container">
            <CCardHeader>
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center w-100 gap-2">
                <div className="d-flex align-items-center flex-wrap gap-2">
                  <CIcon icon={cilCommentBubble} className="me-2" />
                  <h5 className="mb-0 me-3">Live Chat Support</h5>

                  {/* Connection Status */}
                  <div className="connection-status">
                    <CIcon
                      icon={getConnectionIcon()}
                      className={`text-${getConnectionStatusColor()}`}
                    />
                    <CBadge color={getConnectionStatusColor()}>{getConnectionStatusText()}</CBadge>
                    {connectionStats.socketId && (
                      <small className="text-muted d-none d-md-inline">
                        ID: {connectionStats.socketId}
                      </small>
                    )}
                  </div>

                  {isAdmin && (
                    <CBadge color="primary" className="d-none d-md-flex">
                      {chatRooms.filter((room) => getUnreadCount(room) > 0).length} Unread
                    </CBadge>
                  )}
                </div>

                <div className="header-controls d-flex flex-wrap gap-2 align-items-center w-100 w-md-auto">
                  {/* Connection Controls */}
                  <div className="d-flex gap-1">
                    <CTooltip content="Test Connection">
                      <CButton
                        color="outline-info"
                        size="sm"
                        onClick={testConnection}
                        disabled={!socketConnected}
                      >
                        <CIcon icon={cilCloudDownload} />
                        <span className="d-none d-sm-inline ms-1">Test</span>
                      </CButton>
                    </CTooltip>

                    <CTooltip content="Reconnect">
                      <CButton color="outline-warning" size="sm" onClick={reconnectSocket}>
                        <CIcon icon={cilCloudUpload} />
                        <span className="d-none d-sm-inline ms-1">Reconnect</span>
                      </CButton>
                    </CTooltip>
                  </div>

                  {isAdmin && (
                    <div className="d-flex gap-1 flex-wrap">
                      <CFormSelect
                        size="sm"
                        style={{ minWidth: '120px' }}
                        value={chatFilter}
                        onChange={(e) => setChatFilter(e.target.value)}
                      >
                        <option value="all">All Chats</option>
                        <option value="waiting">Waiting</option>
                        <option value="active">Active</option>
                        <option value="closed">Closed</option>
                      </CFormSelect>

                      <CFormSelect
                        size="sm"
                        style={{ minWidth: '140px' }}
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                      >
                        <option value="unread">Unread First</option>
                        <option value="recent">Most Recent</option>
                      </CFormSelect>

                      <CButton
                        color="primary"
                        size="sm"
                        onClick={() => setShowFixedReplyModal(true)}
                      >
                        <CIcon icon={cilPlus} className="me-1" />
                        <span className="d-none d-md-inline">Add Reply</span>
                      </CButton>
                    </div>
                  )}

                  <div className="d-flex gap-1">
                    <CTooltip content="Refresh Chats">
                      <CButton color="light" size="sm" onClick={fetchChatRooms}>
                        <CIcon icon={cilReload} />
                      </CButton>
                    </CTooltip>

                    <CTooltip content={debugMode ? 'Hide Debug' : 'Show Debug'}>
                      <CButton
                        color={debugMode ? 'info' : 'outline-info'}
                        size="sm"
                        onClick={() => setDebugMode(!debugMode)}
                      >
                        <span className="d-none d-sm-inline">Debug</span>
                        <span className="d-sm-none">🔧</span>
                      </CButton>
                    </CTooltip>

                    {isUser && !activeRoom && (
                      <CButton
                        color="primary"
                        size="sm"
                        onClick={startNewChat}
                        disabled={loading || !socketAuthenticated}
                      >
                        {loading ? <CSpinner size="sm" /> : 'Start Chat'}
                      </CButton>
                    )}
                  </div>
                </div>
              </div>
            </CCardHeader>

            <CCardBody className="p-0">
              {/* Connection Status Bar */}
              {debugMode && (
                <CAlert color="info" className="mb-0 rounded-0">
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <strong>Connection Debug</strong>
                    <div className="d-flex gap-2">
                      <small>
                        Socket: {connectionStats.socketId} | Attempts:{' '}
                        {connectionStats.reconnectAttempts} | Listeners:{' '}
                        {connectionStats.eventListeners}
                      </small>
                      <CButton size="sm" color="danger" onClick={clearLogs}>
                        Clear Logs
                      </CButton>
                    </div>
                  </div>
                </CAlert>
              )}

              {/* Alerts */}
              {error && (
                <CAlert
                  color="danger"
                  dismissible
                  onClose={() => setError('')}
                  className="mb-0 rounded-0"
                >
                  <CIcon icon={cilWarning} className="me-2" />
                  {error}
                </CAlert>
              )}
              {success && (
                <CAlert
                  color="success"
                  dismissible
                  onClose={() => setSuccess('')}
                  className="mb-0 rounded-0"
                >
                  {success}
                </CAlert>
              )}

              {!socketConnected && (
                <CAlert color="warning" className="mb-0 rounded-0">
                  <strong>Connection Issue:</strong> Real-time features are disabled.
                </CAlert>
              )}

              {/* Debug Log Panel */}
              {debugMode && connectionLog.length > 0 && (
                <CCard className="mb-0 rounded-0 border-0">
                  <CCardHeader className="py-2">
                    <h6 className="mb-0">Connection Log (Last 50)</h6>
                  </CCardHeader>
                  <CCardBody className="p-0" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                    <CListGroup flush>
                      {connectionLog.map((log) => (
                        <CListGroupItem
                          key={log.id}
                          className={`p-2 ${log.type === 'error' ? 'text-danger' : log.type === 'success' ? 'text-success' : ''}`}
                        >
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="flex-grow-1">
                              <small>
                                <span className="fw-bold">[{log.type.toUpperCase()}]</span>{' '}
                                {log.message}
                              </small>
                              {Object.keys(log.data).length > 0 && (
                                <pre className="mt-1 mb-0 small">
                                  <code>{JSON.stringify(log.data, null, 2)}</code>
                                </pre>
                              )}
                            </div>
                            <small className="text-muted ms-2">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </small>
                          </div>
                        </CListGroupItem>
                      ))}
                    </CListGroup>
                  </CCardBody>
                </CCard>
              )}

              <CRow className="g-0">
                {/* Chat List Sidebar */}
                <CCol md={4} className="chat-sidebar">
                  <CCard className="h-100 border-0 rounded-0">
                    <CCardHeader className="d-flex justify-content-between align-items-center py-2">
                      <h6 className="mb-0">{isAdmin ? 'Chat Rooms' : 'My Chats'}</h6>
                      <div className="d-flex align-items-center gap-2">
                        <CBadge color="primary">{chatRooms.length}</CBadge>
                        {isAdmin && (
                          <CBadge color="primary" className="d-md-none">
                            {chatRooms.filter((room) => getUnreadCount(room) > 0).length} Unread
                          </CBadge>
                        )}
                      </div>
                    </CCardHeader>
                    <CCardBody className="p-0">
                      {loading && chatRooms.length === 0 ? (
                        <div className="text-center py-4">
                          <CSpinner color="primary" />
                        </div>
                      ) : chatRooms.length === 0 ? (
                        <div className="text-center py-4 text-muted">
                          <CIcon icon={cilCommentBubble} width={32} />
                          <p className="mt-2 mb-3">No chats found</p>
                          {isUser && (
                            <CButton color="primary" size="sm" onClick={startNewChat}>
                              Start Your First Chat
                            </CButton>
                          )}
                        </div>
                      ) : (
                        <CListGroup flush>
                          {chatRooms.map((chat) => (
                            <CListGroupItem
                              key={chat.roomId}
                              className={`chat-list-item ${
                                activeRoom?.roomId === chat.roomId ? 'active' : ''
                              } ${getUnreadCount(chat) > 0 ? 'unread' : ''}`}
                              onClick={() => fetchChatMessages(chat.roomId)}
                            >
                              <div className="d-flex justify-content-between align-items-start w-100">
                                <div className="flex-grow-1 me-2">
                                  <div className="d-flex justify-content-between align-items-start mb-1">
                                    <strong className="text-truncate me-2">
                                      {isAdmin
                                        ? chat.userName
                                        : `Support ${chat.adminName ? `- ${chat.adminName}` : ''}`}
                                    </strong>
                                    {getUnreadCount(chat) > 0 && (
                                      <CBadge color="danger">{getUnreadCount(chat)}</CBadge>
                                    )}
                                  </div>
                                  <p className="mb-1 text-muted small text-truncate">
                                    {chat.lastMessage || 'No messages yet'}
                                  </p>
                                  <div className="d-flex justify-content-between align-items-center">
                                    <small className="text-muted">
                                      {new Date(chat.lastMessageTime).toLocaleTimeString()}
                                    </small>
                                    {getStatusBadge(chat.status)}
                                  </div>
                                </div>
                              </div>

                              {isAdmin &&
                                chat.status === 'waiting' &&
                                chat.adminId !== user.userId && (
                                  <div className="mt-2">
                                    <CButton
                                      size="sm"
                                      color="primary"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        assignChat(chat.roomId)
                                      }}
                                      className="w-100"
                                    >
                                      Take Chat
                                    </CButton>
                                  </div>
                                )}
                            </CListGroupItem>
                          ))}
                        </CListGroup>
                      )}
                    </CCardBody>
                  </CCard>
                </CCol>

                {/* Chat Messages Area */}
                <CCol md={8}>
                  <CCard className="h-100 border-0 rounded-0">
                    <CCardHeader className="d-flex justify-content-between align-items-center py-2">
                      <div className="flex-grow-1">
                        {activeRoom ? (
                          <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-2">
                            <strong className="text-truncate">
                              Chat with{' '}
                              {isAdmin ? activeRoom.userName : activeRoom.adminName || 'Support'}
                            </strong>
                            <div className="d-flex gap-2 flex-wrap">
                              <CBadge
                                color={activeRoom.status === 'active' ? 'success' : 'secondary'}
                              >
                                {activeRoom.status}
                              </CBadge>
                              {getUnreadCount(activeRoom) > 0 && (
                                <CBadge color="danger">{getUnreadCount(activeRoom)} unread</CBadge>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted">Select a chat to start messaging</span>
                        )}
                      </div>

                      {activeRoom && activeRoom.status !== 'closed' && (
                        <div className="chat-actions d-flex gap-1">
                          {isAdmin && (
                            <CButton
                              size="sm"
                              color="info"
                              onClick={() => setShowFixedReplies(!showFixedReplies)}
                              className="d-none d-md-flex"
                            >
                              {showFixedReplies ? 'Hide' : 'Show'} Replies
                            </CButton>
                          )}
                          <CButton size="sm" color="danger" onClick={closeChat}>
                            Close
                          </CButton>
                        </div>
                      )}
                    </CCardHeader>

                    <CCardBody className="chat-messages-container p-0">
                      {!activeRoom ? (
                        <div className="text-center py-5 text-muted h-100 d-flex flex-column justify-content-center">
                          <CIcon icon={cilCommentBubble} width={48} />
                          <p className="mt-3">Select a chat from the list to view messages</p>
                          {isUser && (
                            <div className="mt-3">
                              <CButton color="primary" onClick={startNewChat}>
                                Start New Chat
                              </CButton>
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          {/* Messages Area */}
                          <div className="messages-area">
                            {messages.length === 0 ? (
                              <div className="text-center py-4 text-muted h-100 d-flex flex-column justify-content-center">
                                <p>No messages yet. Start the conversation!</p>
                              </div>
                            ) : (
                              messages.map((message, index) => (
                                <div
                                  key={message._id || index}
                                  className={`message-bubble ${
                                    message.senderId === user.userId
                                      ? 'own-message'
                                      : 'other-message'
                                  } ${!message.read && message.senderId !== user.userId ? 'unread' : ''}`}
                                >
                                  <div className="message-header">
                                    <div className="d-flex align-items-center gap-2">
                                      <strong>{message.senderName}</strong>
                                      {message.messageType === 'fixed_reply' && (
                                        <CBadge color="info" size="sm">
                                          Quick
                                        </CBadge>
                                      )}
                                      {message.isSending && (
                                        <CBadge color="warning" size="sm">
                                          Sending...
                                        </CBadge>
                                      )}
                                    </div>
                                    <span className="message-time">
                                      {new Date(message.timestamp).toLocaleTimeString()}
                                    </span>
                                  </div>

                                  {message.attachment ? (
                                    <div className="file-attachment">
                                      <div className="file-icon">
                                        {getFileIcon(message.attachment.mimetype)}
                                      </div>
                                      <div className="file-info">
                                        <div className="file-name">
                                          {message.attachment.originalName}
                                        </div>
                                        <div className="file-size">
                                          {formatFileSize(message.attachment.size)}
                                        </div>
                                        <CButton
                                          size="sm"
                                          color="primary"
                                          onClick={() => downloadFile(message.attachment)}
                                          className="mt-1"
                                        >
                                          Download
                                        </CButton>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="message-content">{message.message}</div>
                                  )}

                                  {message.senderId === user.userId && (
                                    <div className="message-status">
                                      {message.read
                                        ? '✓✓ Read'
                                        : message.delivered
                                          ? '✓ Delivered'
                                          : '✓ Sent'}
                                    </div>
                                  )}
                                </div>
                              ))
                            )}

                            {/* Typing Indicator */}
                            {isTyping && (
                              <div className="typing-indicator">
                                <div className="typing-dots">
                                  <span></span>
                                  <span></span>
                                  <span></span>
                                </div>
                                <span>{typingUser} is typing...</span>
                              </div>
                            )}

                            <div ref={messagesEndRef} />
                          </div>

                          {/* Fixed Replies Panel */}
                          {showFixedReplies && isAdmin && (
                            <div className="fixed-replies-panel">
                              <div className="fixed-replies-header">
                                <h6 className="mb-0">Quick Replies</h6>
                                <CFormSelect
                                  size="sm"
                                  value={fixedReplyCategory}
                                  onChange={(e) => {
                                    setFixedReplyCategory(e.target.value)
                                    fetchFixedReplies()
                                  }}
                                  style={{ minWidth: '120px' }}
                                >
                                  <option value="all">All</option>
                                  <option value="general">General</option>
                                  <option value="technical">Technical</option>
                                  <option value="billing">Billing</option>
                                  <option value="account">Account</option>
                                </CFormSelect>
                              </div>
                              <div className="fixed-replies-list">
                                {fixedReplies.length === 0 ? (
                                  <div className="text-center py-3 text-muted">
                                    <small>No quick replies found</small>
                                  </div>
                                ) : (
                                  fixedReplies.map((reply) => (
                                    <div
                                      key={reply._id}
                                      className="fixed-reply-item"
                                      onClick={() => sendFixedReply(reply)}
                                    >
                                      <strong>{reply.title}</strong>
                                      <p className="mb-1 text-truncate">{reply.message}</p>
                                      <small className="text-muted">
                                        Used {reply.usedCount} times • {reply.category}
                                      </small>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          )}

                          {/* Message Input */}
                          {activeRoom.status !== 'closed' && (
                            <div className="message-input-container p-3">
                              {/* File Attachment Preview */}
                              {selectedFile && (
                                <div className="file-preview mb-2">
                                  <div className="file-preview-content">
                                    <div className="d-flex align-items-center gap-2">
                                      <span className="file-icon">
                                        {getFileIcon(selectedFile.type)}
                                      </span>
                                      <span className="file-name text-truncate">
                                        {selectedFile.name}
                                      </span>
                                    </div>
                                    <CButton color="danger" size="sm" onClick={removeSelectedFile}>
                                      Remove
                                    </CButton>
                                  </div>
                                </div>
                              )}

                              <div className="d-flex gap-2">
                                <CInputGroup>
                                  <CInputGroupText>
                                    <CTooltip content="Attach file">
                                      <CButton
                                        color="light"
                                        size="sm"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-0"
                                      >
                                        <CIcon icon={cilPaperclip} />
                                      </CButton>
                                    </CTooltip>
                                    <input
                                      type="file"
                                      ref={fileInputRef}
                                      onChange={handleFileSelect}
                                      style={{ display: 'none' }}
                                      accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
                                    />
                                  </CInputGroupText>

                                  <CFormInput
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    onInput={handleTyping}
                                    placeholder="Type your message..."
                                    disabled={loading || !socketConnected}
                                    className="border-0"
                                  />

                                  <CButton
                                    color="primary"
                                    onClick={sendMessage}
                                    disabled={
                                      (!newMessage.trim() && !selectedFile) ||
                                      loading ||
                                      !socketConnected
                                    }
                                    className="px-3"
                                  >
                                    {loading ? <CSpinner size="sm" /> : <CIcon icon={cilSend} />}
                                  </CButton>
                                </CInputGroup>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </CCardBody>
                  </CCard>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Fixed Reply Management Modal - Make it responsive */}
      <CModal
        size="lg"
        visible={showFixedReplyModal}
        onClose={() => setShowFixedReplyModal(false)}
        className="fixed-reply-modal"
      >
        <CModalHeader closeButton>
          <CModalTitle>Manage Quick Replies</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="mb-4">
            <h6>Add New Quick Reply</h6>
            <div className="row g-3">
              <div className="col-12">
                <CFormInput
                  placeholder="Title"
                  value={newFixedReply.title}
                  onChange={(e) =>
                    setNewFixedReply((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="col-12">
                <CFormInput
                  as="textarea"
                  rows={3}
                  placeholder="Message"
                  value={newFixedReply.message}
                  onChange={(e) =>
                    setNewFixedReply((prev) => ({
                      ...prev,
                      message: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="col-12 col-md-6">
                <CFormSelect
                  value={newFixedReply.category}
                  onChange={(e) =>
                    setNewFixedReply((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                >
                  <option value="general">General</option>
                  <option value="technical">Technical</option>
                  <option value="billing">Billing</option>
                  <option value="account">Account</option>
                  <option value="other">Other</option>
                </CFormSelect>
              </div>
              <div className="col-12 col-md-6 d-flex align-items-end">
                <CButton
                  color="primary"
                  className="w-100"
                  onClick={createFixedReply}
                  disabled={!newFixedReply.title.trim() || !newFixedReply.message.trim()}
                >
                  Add Quick Reply
                </CButton>
              </div>
            </div>
          </div>

          <hr />

          <h6>Existing Quick Replies</h6>
          <div className="fixed-replies-list">
            {fixedReplies.length === 0 ? (
              <div className="text-center py-3 text-muted">
                <small>No quick replies created yet</small>
              </div>
            ) : (
              fixedReplies.map((reply) => (
                <div key={reply._id} className="fixed-reply-item admin-view">
                  <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <strong>{reply.title}</strong>
                      <CBadge color="secondary">{reply.category}</CBadge>
                    </div>
                    <div className="d-flex gap-1">
                      <CButton
                        size="sm"
                        color="warning"
                        onClick={async () => {
                          const newTitle = prompt('Enter new title:', reply.title)
                          if (newTitle) {
                            try {
                              await liveChatService.updateFixedReply(reply._id, {
                                ...reply,
                                title: newTitle,
                              })
                              fetchFixedReplies()
                              setSuccess('Quick reply updated successfully')
                            } catch (err) {
                              setError('Failed to update quick reply')
                            }
                          }
                        }}
                      >
                        <CIcon icon={cilPencil} />
                      </CButton>
                      <CButton
                        size="sm"
                        color="danger"
                        onClick={async () => {
                          if (window.confirm('Are you sure you want to delete this quick reply?')) {
                            try {
                              await liveChatService.deleteFixedReply(reply._id)
                              setFixedReplies((prev) => prev.filter((r) => r._id !== reply._id))
                              setSuccess('Quick reply deleted successfully')
                            } catch (err) {
                              setError('Failed to delete quick reply')
                            }
                          }
                        }}
                      >
                        <CIcon icon={cilTrash} />
                      </CButton>
                    </div>
                  </div>
                  <p className="mb-1 mt-2">{reply.message}</p>
                  <small className="text-muted">
                    Used {reply.usedCount} times • Created{' '}
                    {new Date(reply.createdAt).toLocaleDateString()}
                  </small>
                </div>
              ))
            )}
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowFixedReplyModal(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default LiveChat
