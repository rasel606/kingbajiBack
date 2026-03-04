import React from 'react'
import BaseUserManagementView from '../UserManagement/BaseUserManagementView'
import { adminServices } from '../../service/adminServices'
import { subAdminServices } from '../../service/subAdminServices'

const SubAminUserList = () => (
  <BaseUserManagementView
    title="User Management"
    fetchUsers={subAdminServices.SubAdminUserList}
    updateUserStatus={adminServices.updateUserStatus}
  />
)

export default SubAminUserList
