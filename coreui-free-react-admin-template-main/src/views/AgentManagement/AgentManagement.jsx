import React from 'react'
import BaseUserManagementView from '../UserManagement/BaseUserManagementView'
import { adminServices } from '../../service/adminServices'

const AgentManagement = () => (
  <BaseUserManagementView
    title="User Management"
    fetchUsers={adminServices.AgentList}
    updateUserStatus={adminServices.updateUserStatus}
  />
)

export default AgentManagement
