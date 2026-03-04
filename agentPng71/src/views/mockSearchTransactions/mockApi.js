// mockData.js

// ---- Mock Data Generators ----
export const generateMockTransactions = (count = 20) => {
  const transactions = [];
  const statuses = [0, 1, 2]; // 0: Pending, 1: Approved, 2: Rejected
  const gateways = ["PayPal", "Stripe", "Bank Transfer", "Crypto"];

  for (let i = 0; i < count; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const gateway = gateways[Math.floor(Math.random() * gateways.length)];
    const amount = Math.floor(Math.random() * 5000) + 100;
    const baseAmount = Math.floor(amount * 0.95);
    const bonusAmount = status === 1 ? Math.floor(amount * 0.05) : 0;

    transactions.push({
      transactionID: `TXN${i + 1}`,
      amount,
      base_amount: baseAmount,
      bonus_amount: bonusAmount,
      gateway_name: gateway,
      status,
      userId: `USER${Math.floor(Math.random() * 900) + 100}`,
      datetime: new Date(
        Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
      ).toISOString(),
    });
  }

  return transactions;
};

// ---- Mock API Endpoints ----
export const mockSearchTransactions = (filters) =>
  new Promise((resolve) => {
    setTimeout(() => {
      let transactions = generateMockTransactions(20);

      // Apply filters
      if (filters.userId)
        transactions = transactions.filter((t) =>
          t.userId.toLowerCase().includes(filters.userId.toLowerCase())
        );

      if (filters.amount)
        transactions = transactions.filter((t) => t.amount >= filters.amount);

      if (filters.gateway_name)
        transactions = transactions.filter((t) => t.gateway_name === filters.gateway_name);

      if (filters.status !== undefined && filters.status !== "")
        transactions = transactions.filter((t) => String(t.status) === String(filters.status));

      if (filters.startDate) {
        const start = new Date(filters.startDate);
        transactions = transactions.filter((t) => new Date(t.datetime) >= start);
      }

      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        transactions = transactions.filter((t) => new Date(t.datetime) <= end);
      }

      resolve({
        data: {
          transactions,
          total: { total: transactions.length },
        },
      });
    }, 500);
  });

export const mockUpdateDepositStatus = (transactionID, userId, status) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          message: `Deposit ${transactionID} updated to ${status === 1 ? "Approved" : "Rejected"}`,
        },
      });
    }, 300);
  });

export const mockGetTransactionDepositTotals = () =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          data: {
            lastDay: Math.floor(Math.random() * 1000) + 500,
            last7Days: Math.floor(Math.random() * 5000) + 3000,
            last30Days: Math.floor(Math.random() * 15000) + 10000,
          },
        },
      });
    }, 300);
  });

export const mockTotalDeposit = () =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: { totalDeposit: Math.floor(Math.random() * 50000) + 25000 } });
    }, 300);
  });
