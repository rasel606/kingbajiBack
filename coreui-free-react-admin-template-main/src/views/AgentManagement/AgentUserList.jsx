import React from 'react'
import BaseUserManagementView from '../UserManagement/BaseUserManagementView'
import { adminServices } from '../../service/adminServices'
import { subAdminServices } from '../../service/subAdminServices'

const AgentUserList = () => (
  <BaseUserManagementView
    title="User Management"
    fetchUsers={adminServices.AgentUserList}
    updateUserStatus={adminServices.updateUserStatus}
  />
)

export default AgentUserList
