import React from 'react'
import BaseWidthrawalView from '../widthrawalView/BaseWidthrawalView'
import { subAdminServices } from '../../service/subAdminServices'
import { adminServices } from '../../service/adminServices'

const SubAdminwidthrow = () => (
  <BaseWidthrawalView
    title="Admin Withdrawal Management"
    fetchTransactions={subAdminServices.SubAdminWithdrawList}
    updateTransactionStatus={adminServices.updateDepositwidthrowalStatus}
  />
)

export default SubAdminwidthrow
