// // import React from 'react';
// // import { CBadge } from '@coreui/react';

// // const StatusBadge = ({
// //   status,
// //   onUpdate,
// //   statusConfig = {
// //     0: { color: 'warning', text: 'Pending' },
// //     1: { color: 'success', text: 'Approved' },
// //     2: { color: 'danger', text: 'Rejected' },
// //   },
// // }) => {
// //   const config = statusConfig[status] || { color: 'secondary', text: status };

// //   const handleClick = onUpdate ? () => onUpdate(status) : undefined;

// //   return (
// //     <CBadge
// //       color={config.color}
// //       onClick={handleClick}
// //       style={{ cursor: onUpdate ? 'pointer' : 'default' }}
// //     >
// //       {config.text}
// //     </CBadge>
// //   );
// // };

// // export default StatusBadge;

// import React, { useState } from 'react';
// import { CBadge } from '@coreui/react';

// const StatusBadge = ({
//   status,
//   onUpdate,
//   statusConfig = {
//     0: { color: 'warning', text: 'Pending' },
//     1: { color: 'success', text: 'Approved' },
//     2: { color: 'danger', text: 'Rejected' },
//   },
// }) => {
//   const [currentStatus, setCurrentStatus] = useState(status);
//   const [isUpdating, setIsUpdating] = useState(false);

//   const handleClick = async () => {
//     if (!onUpdate || isUpdating) return;
    
//     setIsUpdating(true);
    
//     try {
//       // Determine next status (cycle through available statuses)
//       const statusKeys = Object.keys(statusConfig).map(Number);
//       const currentIndex = statusKeys.indexOf(currentStatus);
//       const nextIndex = (currentIndex + 1) % statusKeys.length;
//       const nextStatus = statusKeys[nextIndex];
      
//       // Call the update function
//       await onUpdate(nextStatus);
      
//       // Update local state if successful
//       setCurrentStatus(nextStatus);
//     } catch (error) {
//       console.error('Failed to update status:', error);
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   const config = statusConfig[currentStatus] || { color: 'secondary', text: 'Unknown' };

//   return (
//     <CBadge
//       color={config.color}
//       onClick={onUpdate ? handleClick : undefined}
//       style={{ 
//         cursor: onUpdate ? 'pointer' : 'default',
//         opacity: isUpdating ? 0.7 : 1
//       }}
//       className="d-flex align-items-center"
//     >
//       {isUpdating ? (
//         <>
//           <span className="spinner-border spinner-border-sm me-1" />
//           Updating...
//         </>
//       ) : (
//         config.text
//       )}
//     </CBadge>
//   );
// };

// export default StatusBadge;


import React from "react";
import { CBadge } from "@coreui/react";

/**
 * StatusBadge component
 * @param {number} status - 0 = Pending, 1 = Approved, 2 = Rejected
 * @param {function} onUpdate - Optional callback for clicking badge (e.g. open modal)
 */
const StatusBadge = ({ status, onUpdate }) => {
  const getBadgeColor = (status) => {
    switch (status) {
      case 1:
        return "success"; // Approved
      case 2:
        return "danger"; // Rejected
      default:
        return "warning"; // Pending
    }
  };

  const getLabel = (status) => {
    switch (status) {
      case 1:
        return "Approved";
      case 2:
        return "Rejected";
      default:
        return "Pending";
    }
  };

  return (
    <CBadge
      color={getBadgeColor(status)}
      style={{ cursor: onUpdate ? "pointer" : "default" }}
      onClick={onUpdate}
    >
      {getLabel(status)}
    </CBadge>
  );
};

export default StatusBadge;
