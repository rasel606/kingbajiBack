import React from 'react'
import BaseWidthrawalView from '../widthrawalView/BaseWidthrawalView'
import { subAdminServices } from '../../service/subAdminServices'
import { adminServices } from '../../service/adminServices'

const SubAdminDeposit = () => (
  <BaseWidthrawalView
    title="Admin Withdrawal Management"
    fetchTransactions={subAdminServices.SubAdminDepositList}
    updateTransactionStatus={adminServices.updateDepositwidthrowalStatus}
  />
)

export default SubAdminDeposit
