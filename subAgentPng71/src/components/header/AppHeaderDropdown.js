
import React, { useState, useEffect } from "react";
import {
  CAvatar,
  CBadge,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from "@coreui/react";
import {
  cilBell,
  cilCreditCard,
  cilCommentSquare,
  cilEnvelopeOpen,
  cilFile,
  cilSettings,
  cilTask,
  cilUser,
  cilPeople,
} from "@coreui/icons";
import CIcon from "@coreui/icons-react";

import avatar8 from "./../../assets/images/avatars/8.jpg";
import UserCreationFormModal from "../../views/base/Modal/UserCreationFormModal";
import { authService } from "../../service/authService";
import { useAuth } from "../../context/AuthContext";

const AppHeaderDropdown = () => {
  const { user } = useAuth();

  const [showUserCreationModal, setShowUserCreationModal] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState('');

  // Set default userType when user data is available
  useEffect(() => {
    if (user?.role && !selectedUserType) {
      const creatableRoles = getCreatableRoles();
      if (creatableRoles.length > 0) {
        setSelectedUserType(creatableRoles[0].type);
      }
    }
  }, [user, selectedUserType]);

  const handleUserCreationClick = (userType) => {
    // Ensure we always have a userType
    const finalUserType = userType || selectedUserType;
    setSelectedUserType(finalUserType);
    setShowUserCreationModal(true);
  };

  const handleCloseModal = () => {
    setShowUserCreationModal(false);
  };

  const handleLogout = () => {
    authService.logout();
    window.location.reload();
  };

  // Define creatable roles based on current user's role
  const getCreatableRoles = () => {
    if (!user) return [];

    const rolePermissions = {
      SubAgent: [
        { type: 'User', label: 'End User', icon: cilUser, description: 'Create end user account' },
      ]
    };

    return rolePermissions[user.role] || [];
  };

  const creatableRoles = getCreatableRoles();

  return (
    <>
      <CDropdown variant="nav-item">
        <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
          <CAvatar src={avatar8} size="md" />
        </CDropdownToggle>
        <CDropdownMenu className="pt-0" placement="bottom-end">
          <CDropdownHeader className="bg-body-secondary fw-semibold mb-2">
            <div>
              <div>Account</div>
              <small className="text-muted">
                {user ? `${user.firstName} ${user.lastName}` : 'Loading...'}
              </small>
              <div>
                <CBadge color="primary" className="text-uppercase">
                  {user?.role}
                </CBadge>
              </div>
            </div>
          </CDropdownHeader>
          
          <CDropdownItem href="#">
            <CIcon icon={cilUser} className="me-2" />
            Profile
          </CDropdownItem>
          <CDropdownItem href="#">
            <CIcon icon={cilSettings} className="me-2" />
            Settings
          </CDropdownItem>

          <CDropdownDivider />

          {/* USER CREATION BASED ON ROLE PERMISSIONS */}
          {creatableRoles.length > 0 && (
            <>
              <CDropdownHeader className="bg-body-secondary fw-semibold my-2">
                Create New User
              </CDropdownHeader>
              {creatableRoles.map((role) => (
                <CDropdownItem 
                  key={role.type} 
                  onClick={() => handleUserCreationClick(role.type)}
                  className="d-flex align-items-center"
                >
                  <div className="me-3">
                    <CIcon icon={role.icon} />
                  </div>
                  <div className="flex-grow-1">
                    <div className="fw-semibold">{role.label}</div>
                    <small className="text-muted">{role.description}</small>
                  </div>
                </CDropdownItem>
              ))}
              <CDropdownDivider />
            </>
          )}

          {/* LOGOUT */}
          <CDropdownItem onClick={handleLogout}>
            <CIcon icon={cilSettings} className="me-2" />
            Logout
          </CDropdownItem>
        </CDropdownMenu>
      </CDropdown>
      
      <UserCreationFormModal
        userType={selectedUserType}
        show={showUserCreationModal && !!selectedUserType}
        onClose={handleCloseModal}
        currentUserRole={user?.role}
        ParentUser={user}
      />
    </>
  );
};

export default AppHeaderDropdown;