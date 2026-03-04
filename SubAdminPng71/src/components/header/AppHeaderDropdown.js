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
//   cilLockLocked,
//   cilSettings,
//   cilTask,
//   cilUser,
// } from "@coreui/icons";
// import CIcon from "@coreui/icons-react";

// import avatar8 from "./../../assets/images/avatars/8.jpg";
// import SocialLinksModal from "../../views/base/Modal/SocialLinksModal";
// import UserCreationFormModal from "../../views/base/Modal/UserCreationFormModal";


// const AppHeaderDropdown = () => {
//   const [showSocialModal, setShowSocialModal] = useState(false);
//   const [showUserCreationModal, setShowUserCreationModal] = useState(false);

//   const handleSaveSocialLinks = async (form) => {
//     try {
//       // You can post this to backend (or lift state up)
//       console.log("Saving social links: ", form);
//       // Example API call:
//       // await axios.post("/api/social-links", form);
//       setShowSocialModal(false);
//     } catch (error) {
//       console.error("Failed to save social links", error);
//     }
//   };
//   const handleSaveUserCreation = async (form) => {
//     try {
//       // You can post this to backend (or lift state up)
//       console.log("Saving social links: ", form);
//       // Example API call:
//       // await axios.post("/api/social-links", form);
//       setShowUserCreationModal(false);
//     } catch (error) {
//       console.error("Failed to save social links", error);
//     }
//   };

//   return (
//     <>
//       <CDropdown variant="nav-item">
//         <CDropdownToggle
//           placement="bottom-end"
//           className="py-0 pe-0"
//           caret={false}
//         >
//           <CAvatar src={avatar8} size="md" />
//         </CDropdownToggle>
//         <CDropdownMenu className="pt-0" placement="bottom-end">
//           <CDropdownHeader className="bg-body-secondary fw-semibold mb-2">
//             Account
//           </CDropdownHeader>
//           <CDropdownItem href="#">
//             <CIcon icon={cilBell} className="me-2" />
//             Updates
//             <CBadge color="info" className="ms-2">
//               42
//             </CBadge>
//           </CDropdownItem>
//           <CDropdownItem href="#">
//             <CIcon icon={cilEnvelopeOpen} className="me-2" />
//             Messages
//             <CBadge color="success" className="ms-2">
//               42
//             </CBadge>
//           </CDropdownItem>
//           <CDropdownItem href="#">
//             <CIcon icon={cilTask} className="me-2" />
//             Tasks
//             <CBadge color="danger" className="ms-2">
//               42
//             </CBadge>
//           </CDropdownItem>
//           <CDropdownItem href="#">
//             <CIcon icon={cilCommentSquare} className="me-2" />
//             Comments
//             <CBadge color="warning" className="ms-2">
//               42
//             </CBadge>
//           </CDropdownItem>
//           <CDropdownHeader className="bg-body-secondary fw-semibold my-2">
//             Settings
//           </CDropdownHeader>
//           <CDropdownItem href="#">
//             <CIcon icon={cilUser} className="me-2" />
//             Profile
//           </CDropdownItem>
//           <CDropdownItem href="#">
//             <CIcon icon={cilSettings} className="me-2" />
//             Settings
//           </CDropdownItem>
//           <CDropdownItem href="#">
//             <CIcon icon={cilCreditCard} className="me-2" />
//             Payments
//             <CBadge color="secondary" className="ms-2">
//               42
//             </CBadge>
//           </CDropdownItem>

//           {/* 🚀 SOCIAL LINKS MODAL TRIGGER */}
//           <CDropdownItem onClick={() => setShowSocialModal(true)}>
//             <CIcon icon={cilFile} className="me-2" />
//             Social Links
//           </CDropdownItem>

//           <CDropdownDivider />
//           <CDropdownItem onClick={()=>setShowUserCreationModal(true)}>
//             <CIcon icon={cilUser} className="me-2" />
//             Account
//           </CDropdownItem>
//         </CDropdownMenu>
//       </CDropdown>

//       {/* SOCIAL LINKS MODAL */}
//       <SocialLinksModal
//         show={showSocialModal}
//         onClose={() => setShowSocialModal(false)}
//         onSave={handleSaveSocialLinks}

//         link={null} // You can pass user’s saved links here if available
//       />
//       <UserCreationFormModal
//       userType={"SubAdmin"}
//         show={showUserCreationModal}
//         onClose={() => setShowUserCreationModal(false)}
//         onSave={handleSaveUserCreation}
//         // link={null} // You can pass user’s saved links here if available
        
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
  const {user}= useAuth()
console.log(user)
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [showUserCreationModal, setShowUserCreationModal] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState('');
  const [currentUser, setCurrentUser] = useState(user);


  // useEffect(() => {
  //   // Get current user from localStorage or API
  //   const user = authService.getCurrentUser();
  //   setCurrentUser(user);
  // }, []);



  const handleUserCreationClick = (userType) => {
    setSelectedUserType(userType);
    setShowUserCreationModal(true);
  };

  const handleLogout = () => {
    authService.logout();
    window.location.reload();
  };

  // Define creatable roles based on current user's role
  const getCreatableRoles = () => {
    if (!currentUser) return [];

    const rolePermissions = {
      SubAdmin: [
        { type: 'Agent', label: 'Agent', icon: cilUser, description: 'Create gaming agent' },
        { type: 'SubAgent', label: 'Sub Agent', icon: cilUser, description: 'Create sub-agent under an agent' },
        { type: 'Affiliate', label: 'Affiliate', icon: cilPeople, description: 'Create affiliate partner' },
        { type: 'User', label: 'End User', icon: cilUser, description: 'Create end user account' },
      ],
      agent: [
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
                {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Loading...'}
              </small>
              <div>
                <CBadge color="primary" className="text-uppercase">
                  {currentUser?.role}
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

          {/* SOCIAL LINKS */}
          <CDropdownItem onClick={() => setShowSocialModal(true)}>
            <CIcon icon={cilFile} className="me-2" />
            Social Links
          </CDropdownItem>

          <CDropdownDivider />

          {/* USER CREATION BASED ON ROLE PERMISSIONS */}
          {user?.role === 'SubAdmin' && (
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

          {/* ADMIN SPECIFIC OPTIONS */}
          {user?.role === 'SubAdmin' && (
            <>
              <CDropdownHeader className="bg-body-secondary fw-semibold my-2">
                Admin Tools
              </CDropdownHeader>
              <CDropdownItem href="#">
                <CIcon icon={cilSettings} className="me-2" />
                System Settings
              </CDropdownItem>
              <CDropdownItem href="#">
                <CIcon icon={cilPeople} className="me-2" />
                Manage All Users
              </CDropdownItem>
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
        show={showUserCreationModal}
        onClose={() => setShowUserCreationModal(false)}
        currentUserRole={user?.role || 'Admin'}
        ParentUser={user}
      />
    </>
  );
};

export default AppHeaderDropdown;