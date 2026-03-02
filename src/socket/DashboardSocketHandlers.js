// Socket.io Event Handlers for Real-Time Dashboard Updates
const DashboardAnalyticsController = require('../controllers/DashboardAnalyticsController');

class DashboardSocketHandlers {
  constructor(io) {
    this.io = io;
    this.dashboardNamespace = io.of('/dashboard');
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  setupMiddleware() {
    // Authentication middleware for dashboard namespace
    this.dashboardNamespace.use((socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication failed'));
      }
      socket.userId = socket.handshake.auth.userId;
      socket.role = socket.handshake.auth.role;
      next();
    });
  }

  setupEventHandlers() {
    this.dashboardNamespace.on('connection', (socket) => {
      console.log(`Dashboard socket connected: ${socket.id} (User: ${socket.userId})`);

      // Join user to their own room
      socket.join(`user_${socket.userId}`);
      socket.join(`role_${socket.role}`);
      socket.join('dashboard_all');

      /**
       * Join Dashboard Event
       * Notifies when user enters dashboard
       */
      socket.on('join_dashboard', (data) => {
        socket.userId = data.userId;
        socket.role = data.role;
        
        console.log(`User joined dashboard: ${data.userId} (${data.role})`);
        
        // Notify admin that someone joined dashboard
        this.dashboardNamespace.to('role_admin').emit('user_joined_dashboard', {
          userId: data.userId,
          role: data.role,
          timestamp: new Date()
        });
      });

      /**
       * Request Metrics Update
       * User requests specific metrics data in real-time
       */
      socket.on('request_metrics', async (params) => {
        try {
          const metrics = await this.getMetricsUpdate(params);
          socket.emit('metrics_update', metrics);
        } catch (error) {
          socket.emit('error', { message: 'Failed to fetch metrics' });
        }
      });

      /**
       * Subscribe to Real-Time Metrics
       * Continuously sends metric updates
       */
      socket.on('subscribe_metrics', async (params) => {
        socket.metricsInterval = setInterval(async () => {
          try {
            const metrics = await this.getMetricsUpdate(params);
            socket.emit('dashboard_update', {
              type: 'metrics',
              data: metrics,
              timestamp: new Date()
            });
          } catch (error) {
            console.error('Error sending metrics update:', error);
            clearInterval(socket.metricsInterval);
          }
        }, 30000); // Update every 30 seconds

        socket.on('unsubscribe_metrics', () => {
          clearInterval(socket.metricsInterval);
          console.log(`Unsubscribed ${socket.userId} from metrics`);
        });
      });

      /**
       * Real-Time Transaction Broadcast
       * Called when a new transaction occurs
       */
      socket.on('transaction_created', async (transactionData) => {
        if (socket.role !== 'admin' && socket.role !== 'moderator') return;

        const transaction = {
          id: transactionData._id,
          type: transactionData.type,
          amount: transactionData.amount,
          status: transactionData.status,
          userId: transactionData.userId,
          timestamp: new Date()
        };

        // Broadcast to all dashboard connections
        this.dashboardNamespace.to('dashboard_all').emit('transaction_update', transaction);

        // Emit to specific role
        this.dashboardNamespace.to(`role_${socket.role}`).emit('transaction_notification', {
          message: `New ${transaction.type} transaction: $${transaction.amount}`,
          transaction
        });
      });

      /**
       * Real-Time User Activity
       * Tracks active users and their activities
       */
      socket.on('user_activity', (activity) => {
        const activityData = {
          userId: socket.userId,
          type: activity.type,
          detail: activity.detail,
          timestamp: new Date()
        };

        // Broadcast to admins
        this.dashboardNamespace.to('role_admin').emit('user_activity_logged', activityData);

        // Update global count
        this.updateActiveUserCount();
      });

      /**
       * Bet Placed Event
       * Real-time bet notifications
       */
      socket.on('bet_placed', (betData) => {
        const bet = {
          id: betData._id,
          userId: betData.userId,
          amount: betData.amount,
          odds: betData.odds,
          game: betData.game,
          timestamp: new Date()
        };

        // Broadcast to all admins
        this.dashboardNamespace.to('role_admin').emit('bet_created', {
          message: `New bet placed: $${bet.amount} @ ${bet.odds} odds`,
          bet
        });

        // Update betting metrics
        this.updateBettingMetrics();
      });

      /**
       * Withdrawal Request Event
       * Real-time withdrawal notifications
       */
      socket.on('withdrawal_request', (withdrawalData) => {
        const withdrawal = {
          id: withdrawalData._id,
          userId: withdrawalData.userId,
          amount: withdrawalData.amount,
          method: withdrawalData.method,
          timestamp: new Date()
        };

        // Notify admins
        this.dashboardNamespace.to('role_admin').emit('withdrawal_alert', {
          message: `Withdrawal request: $${withdrawal.amount}`,
          withdrawal
        });

        // Update transaction flow
        this.updateTransactionFlow();
      });

      /**
       * Refresh Request
       * Manual dash board refresh
       */
      socket.on('request_refresh', async () => {
        try {
          const freshData = await this.getAllDashboardData();
          socket.emit('refresh_complete', freshData);
        } catch (error) {
          socket.emit('refresh_error', { message: 'Refresh failed' });
        }
      });

      /**
       * Filter Change Event
       * Send updated data based on new filters
       */
      socket.on('filter_changed', async (newFilters) => {
        try {
          const filteredData = await this.getFilteredMetrics(newFilters);
          socket.emit('filtered_data', filteredData);
        } catch (error) {
          socket.emit('error', { message: 'Filter update failed' });
        }
      });

      /**
       * System Status Request
       */
      socket.on('request_system_status', () => {
        const status = {
          database: 'connected',
          cache: 'active',
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          timestamp: new Date()
        };
        socket.emit('system_status', status);
      });

      /**
       * Online Users Count Request
       */
      socket.on('request_online_users', async () => {
        const onlineCount = this.dashboardNamespace.sockets.size;
        socket.emit('online_users_count', { count: onlineCount });
      });

      /**
       * Disconnect Handler
       */
      socket.on('disconnect', () => {
        console.log(`Dashboard socket disconnected: ${socket.id}`);
        
        // Clear any intervals
        if (socket.metricsInterval) {
          clearInterval(socket.metricsInterval);
        }

        // Update online count
        this.updateActiveUserCount();

        // Notify others
        this.dashboardNamespace.to('dashboard_all').emit('user_left_dashboard', {
          userId: socket.userId,
          timestamp: new Date()
        });
      });

      /**
       * Error Handler
       */
      socket.on('error', (error) => {
        console.error(`Socket error for ${socket.id}:`, error);
      });
    });
  }

  /**
   * Helper Methods
   */

  async getMetricsUpdate(params = {}) {
    try {
      const startDate = params.startDate || new Date(Date.now() - 24 * 60 * 60 * 1000);
      const endDate = params.endDate || new Date();

      const dateRange = {
        start: new Date(startDate),
        end: new Date(endDate)
      };

      return {
        onlineUsers: this.dashboardNamespace.sockets.size,
        activeBets: Math.floor(Math.random() * 1000), // Replace with actual count
        pendingWithdrawals: Math.floor(Math.random() * 50), // Replace with actual count
        recentTransactions: [], // Populate from database
        systemHealth: {
          database: 'healthy',
          cache: 'healthy',
          uptime: process.uptime()
        }
      };
    } catch (error) {
      console.error('Error getting metrics update:', error);
      throw error;
    }
  }

  async getAllDashboardData() {
    // Retrieve all dashboard data
    return {
      summary: {},
      charts: {},
      tables: {},
      timestamp: new Date()
    };
  }

  async getFilteredMetrics(filters) {
    // Apply filters and return filtered metrics
    return {
      filtered: true,
      filters,
      data: {},
      timestamp: new Date()
    };
  }

  updateActiveUserCount() {
    const count = this.dashboardNamespace.sockets.size;
    this.dashboardNamespace.emit('active_users_updated', { count });
  }

  updateBettingMetrics() {
    // Calculate and broadcast betting metrics
    this.dashboardNamespace.to('role_admin').emit('betting_metrics_updated', {
      timestamp: new Date()
    });
  }

  updateTransactionFlow() {
    // Calculate and broadcast transaction flow
    this.dashboardNamespace.to('role_admin').emit('transaction_flow_updated', {
      timestamp: new Date()
    });
  }

  /**
   * Public Methods for Controller to Emit Events
   */

  broadcastTransactionUpdate(transactionData) {
    this.dashboardNamespace.emit('transaction_update', transactionData);
  }

  broadcastMetricsUpdate(metricsData) {
    this.dashboardNamespace.emit('metrics_update', metricsData);
  }

  broadcastUserActivity(activityData) {
    this.dashboardNamespace.emit('user_activity_logged', activityData);
  }

  broadcastAlert(alertData) {
    this.dashboardNamespace.emit('alert', alertData);
  }

  notifyAdmins(notification) {
    this.dashboardNamespace.to('role_admin').emit('admin_notification', notification);
  }
}

module.exports = DashboardSocketHandlers;
