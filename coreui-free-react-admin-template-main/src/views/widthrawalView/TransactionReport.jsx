import React from 'react'
import BaseWidthrawalView from './BaseWidthrawalView'
import { getWayService } from '../../service/getWayService'
import { adminServices } from '../../service/adminServices'

const TransactionReport = () => (
  <BaseWidthrawalView
    title="Admin TransactionReport Management"
    fetchTransactions={getWayService.TransactionsReport}
    updateTransactionStatus={adminServices.updateDepositwidthrowalStatus}
  />
)

export default TransactionReport
