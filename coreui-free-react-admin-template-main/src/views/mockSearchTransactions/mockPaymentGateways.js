// mockSearchTransactions.js

// Mock data for payment gateways
export const mockPaymentGateways = [
  {
    transactionID: 'txn_001',
    userId: 'user_001',
    email: 'john.doe@example.com',
    gateway_Number: 'GW-1001',
    gateway_name: 'Stripe',
    is_active: true,
    payment_type: 'Credit Card',
    referredBy: 'affiliate_123',

    image_url: 'https://via.placeholder.com/50',
    updatetime: '2023-05-15 14:30:45',
    timestamp: '2023-05-10 09:15:22',
    amount: 150.75,
  },
  {
    transactionID: 'txn_002',
    userId: 'user_002',
    email: 'jane.smith@example.com',
    gateway_Number: 'GW-1002',
    gateway_name: 'PayPal',
    is_active: true,
    payment_type: 'Digital Wallet',
    referredBy: 'organic',

    image_url: 'https://via.placeholder.com/50',
    updatetime: '2023-05-14 11:20:33',
    timestamp: '2023-05-08 13:45:10',
    amount: 89.99,
  },
]

// Mock API functions
export const mockSearchTransactions = async (filters = {}) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Apply filters if any
  let filteredData = [...mockPaymentGateways]

  if (filters.email) {
    filteredData = filteredData.filter((item) =>
      item.email.toLowerCase().includes(filters.email.toLowerCase()),
    )
  }

  if (filters.gateway_name) {
    filteredData = filteredData.filter((item) =>
      item.gateway_name.toLowerCase().includes(filters.gateway_name.toLowerCase()),
    )
  }

  if (filters.status !== undefined) {
    filteredData = filteredData.filter((item) => item.is_active === (filters.status === 'active'))
  }

  if (filters.payment_type) {
    filteredData = filteredData.filter((item) =>
      item.payment_type.toLowerCase().includes(filters.payment_type.toLowerCase()),
    )
  }

  return {
    data: {
      transactions: filteredData,
      total: {
        total: filteredData.length,
        amount: filteredData.reduce((sum, item) => sum + item.amount, 0),
      },
    },
  }
}

export const mockUpdateDepositStatus = async (transactionId, userId, status) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  return {
    data: {
      message: `Transaction ${transactionId} status updated successfully`,
      status: 'success',
    },
  }
}

export const mockGetTransactionDepositTotals = async () => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  return {
    data: {
      data: {
        totalTransactions: mockPaymentGateways.length,
        activeGateways: mockPaymentGateways.filter((g) => g.is_active).length,
        inactiveGateways: mockPaymentGateways.filter((g) => !g.is_active).length,
        totalAmount: mockPaymentGateways.reduce((sum, item) => sum + item.amount, 0),
      },
    },
  }
}

export const mockTotalDeposit = async () => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  const totalDeposit = mockPaymentGateways.reduce((sum, item) => sum + item.amount, 0)

  return {
    data: {
      totalDeposit: totalDeposit,
    },
  }
}
