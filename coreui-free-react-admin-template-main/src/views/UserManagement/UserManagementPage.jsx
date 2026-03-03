import React from 'react'
import BaseUserManagementView from './BaseUserManagementView'
import { adminServices } from '../../service/adminServices'
import { userService } from '../../service/userService'

const UserManagement = () => (
  <BaseUserManagementView
    title="User Management"
    fetchUsers={userService.GetUserList}
    updateUserStatus={adminServices.updateUserStatus}
  />
)

export default UserManagement
