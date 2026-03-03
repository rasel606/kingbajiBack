
// import React, { useState } from "react";
// import {
//   CAvatar,
//   CBadge,
//   CDropdown,
//   CDropdownDivider,
//   CDropdownHeader,
//   CDropdownItem,
//   CDropdownMenu,
//   CDropdownToggle,
// } from "@coreui/react";
// import {
//   cilBell,
//   cilCreditCard,
//   cilCommentSquare,
//   cilEnvelopeOpen,
//   cilFile,
//   cilSettings,
//   cilTask,
//   cilUser,
//   cilPeople,
// } from "@coreui/icons";
// import CIcon from "@coreui/icons-react";

// import avatar8 from "./../../assets/images/avatars/8.jpg";
// import UserCreationFormModal from "../../views/base/Modal/UserCreationFormModal";
// import { authService } from "../../service/authService";
// import { useAuth } from "../../context/AuthContext";

// const AppHeaderDropdown = () => {
//   const { user } = useAuth();
//   console.log("Current user:", user);

//   const [showUserCreationModal, setShowUserCreationModal] = useState(false);
//   const [selectedUserType, setSelectedUserType] = useState('');

//   const handleUserCreationClick = (userType) => {
//     setSelectedUserType(userType);
//     setShowUserCreationModal(true);
//   };

//   const handleLogout = () => {
//     authService.logout();
//     window.location.reload();
//   };

//   // Define creatable roles based on current user's role
//   const getCreatableRoles = () => {
//     if (!user) return [];

//     const rolePermissions = {
//       // Admin: [
//       //   { type: 'SubAdmin', label: 'Sub Admin', icon: cilPeople, description: 'Create sub-administrator with specific permissions' },
//       //   { type: 'Agent', label: 'Agent', icon: cilUser, description: 'Create gaming agent' },
//       //   { type: 'SubAgent', label: 'Sub Agent', icon: cilUser, description: 'Create sub-agent under an agent' },
//       //   { type: 'Affiliate', label: 'Affiliate', icon: cilPeople, description: 'Create affiliate partner' },
//       //   { type: 'User', label: 'End User', icon: cilUser, description: 'Create end user account' },
//       // ],
//       // SubAdmin: [
//       //   { type: 'Agent', label: 'Agent', icon: cilUser, description: 'Create gaming agent' },
//       //   { type: 'SubAgent', label: 'Sub Agent', icon: cilUser, description: 'Create sub-agent under an agent' },
//       //   { type: 'Affiliate', label: 'Affiliate', icon: cilPeople, description: 'Create affiliate partner' },
//       //   { type: 'User', label: 'End User', icon: cilUser, description: 'Create end user account' },
//       // ],
//       Agent: [ // Fixed: Changed from 'agent' to 'Agent'
//         { type: 'SubAgent', label: 'Sub Agent', icon: cilUser, description: 'Create sub-agent under your account' },
//         { type: 'User', label: 'User', icon: cilUser, description: 'Create end user account' },
//       ]
//     };

//     return rolePermissions[user.role] || [];
//   };

//   const creatableRoles = getCreatableRoles();
//   console.log("Creatable roles:", creatableRoles);

//   return (
//     <>
//       <CDropdown variant="nav-item">
//         <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
//           <CAvatar src={avatar8} size="md" />
//         </CDropdownToggle>
//         <CDropdownMenu className="pt-0" placement="bottom-end">
//           <CDropdownHeader className="bg-body-secondary fw-semibold mb-2">
//             <div>
//               <div>Account</div>
//               <small className="text-muted">
//                 {user ? `${user.firstName} ${user.lastName}` : 'Loading...'}
//               </small>
//               <div>
//                 <CBadge color="primary" className="text-uppercase">
//                   {user?.role}
//                 </CBadge>
//               </div>
//             </div>
//           </CDropdownHeader>
          
//           <CDropdownItem href="#">
//             <CIcon icon={cilUser} className="me-2" />
//             Profile
//           </CDropdownItem>
//           <CDropdownItem href="#">
//             <CIcon icon={cilSettings} className="me-2" />
//             Settings
//           </CDropdownItem>

//           <CDropdownDivider />

//           {/* USER CREATION BASED ON ROLE PERMISSIONS - FIXED CONDITION */}
//           {creatableRoles.length > 0 && (
//             <>
//               <CDropdownHeader className="bg-body-secondary fw-semibold my-2">
//                 Create New User
//               </CDropdownHeader>
//               {creatableRoles.map((role) => (
//                 <CDropdownItem 
//                   key={role.type} 
//                   onClick={() => handleUserCreationClick(role.type)}
//                   className="d-flex align-items-center"
//                 >
//                   <div className="me-3">
//                     <CIcon icon={role.icon} />
//                   </div>
//                   <div className="flex-grow-1">
//                     <div className="fw-semibold">{role.label}</div>
//                     <small className="text-muted">{role.description}</small>
//                   </div>
//                 </CDropdownItem>
//               ))}
//               <CDropdownDivider />
//             </>
//           )}

//           {/* ADMIN SPECIFIC OPTIONS */}
//           {user?.role === 'Admin' && ( // Fixed: Changed from 'Agent' to 'Admin'
//             <>
//               <CDropdownHeader className="bg-body-secondary fw-semibold my-2">
//                 Admin Tools
//               </CDropdownHeader>
//               <CDropdownItem href="#">
//                 <CIcon icon={cilSettings} className="me-2" />
//                 System Settings
//               </CDropdownItem>
//               <CDropdownItem href="#">
//                 <CIcon icon={cilPeople} className="me-2" />
//                 Manage All Users
//               </CDropdownItem>
//               <CDropdownDivider />
//             </>
//           )}

//           {/* LOGOUT */}
//           <CDropdownItem onClick={handleLogout}>
//             <CIcon icon={cilSettings} className="me-2" />
//             Logout
//           </CDropdownItem>
//         </CDropdownMenu>
//       </CDropdown>
      
//       <UserCreationFormModal
//         userType={selectedUserType}
//         show={showUserCreationModal}
//         onClose={() => setShowUserCreationModal(false)}
//         currentUserRole={user?.role}
//         ParentUser={user}
//       />
//     </>
//   );
// };

// export default AppHeaderDropdown;



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
      Agent: [
        { type: 'SubAgent', label: 'Sub Agent', icon: cilUser, description: 'Create sub-agent under your account' },
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