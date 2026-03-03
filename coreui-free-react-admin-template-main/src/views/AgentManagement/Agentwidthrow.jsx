import React from 'react'
import BaseWidthrawalView from '../widthrawalView/BaseWidthrawalView'
import { subAdminServices } from '../../service/subAdminServices'
import { adminServices } from '../../service/adminServices'

const Agentwidthrow = () => (
  <BaseWidthrawalView
    title="Admin Withdrawal Management"
    fetchTransactions={adminServices.AgentWithdrawList}
    updateTransactionStatus={adminServices.updateDepositwidthrowalStatus}
  />
)

export default Agentwidthrow
