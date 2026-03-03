// mockSearchDepositTransactions.js

import generateMockDeposits from '../depositView/DepositFullView'
export const mockSearchTransactions = (filters) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let deposits = generateMockDeposits()

      Object.keys(filters).forEach((key) => {
        const value = filters[key]
        if (!value) return

        if (key === 'startDate') {
          const start = new Date(value)
          deposits = deposits.filter((d) => new Date(d.datetime) >= start)
        } else if (key === 'endDate') {
          const end = new Date(value)
          end.setHours(23, 59, 59, 999)
          deposits = deposits.filter((d) => new Date(d.datetime) <= end)
        } else {
          deposits = deposits.filter((d) =>
            String(d[key])?.toLowerCase().includes(String(value).toLowerCase()),
          )
        }
      })

      const total = deposits.reduce((sum, deposit) => sum + deposit.amount, 0)

      resolve({
        data: { transactions: deposits, total: { total } },
      })
    }, 800)
  })
}
