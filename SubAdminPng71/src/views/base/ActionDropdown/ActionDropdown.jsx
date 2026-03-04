// components/common/ActionDropdown/ActionDropdown.js
import React, { useState } from 'react';
import {
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CSpinner,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';

const ActionDropdown = ({ 
  item, 
  availableActions = [], 
  onAction, 
  loading = false,
  size = 'sm',
  align = 'end',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = async (actionType) => {
    setIsOpen(false);
    await onAction(actionType, item);
  };

  const getActionIcon = (icon) => {
    if (typeof icon === 'string') {
      return icon;
    }
    return icon;
  };

  return (
    <CDropdown 
      variant="btn-group" 
      alignment={align}
      visible={isOpen}
      onShow={() => setIsOpen(true)}
      onHide={() => setIsOpen(false)}
      className={className}
    >
      <CDropdownToggle 
        color="outline-primary" 
        size={size}
        disabled={loading}
        className="d-flex align-items-center"
      >
        {loading ? <CSpinner size="sm" /> : 'Actions'}
      </CDropdownToggle>
      <CDropdownMenu>
        {availableActions.map((action, index) => (
          <CDropdownItem 
            key={index}
            onClick={() => handleAction(action.type)}
            className={`text-${action.color} d-flex align-items-center`}
            disabled={action.disabled}
          >
            {action.icon && (
              <CIcon icon={getActionIcon(action.icon)} className="me-2" />
            )}
            {action.label}
            {action.shortcut && (
              <small className="text-muted ms-auto">{action.shortcut}</small>
            )}
          </CDropdownItem>
        ))}
      </CDropdownMenu>
    </CDropdown>
  );
};

// Pre-configured action sets
export const depositActions = {
  pending: [
    { type: "accept", label: "Accept", icon: "cilCheckCircle", color: "success" },
    { type: "reject", label: "Reject", icon: "cilXCircle", color: "danger" },
    { type: "view", label: "View Details", icon: "cilInfo", color: "info" },
  ],
  approved: [
    { type: "deposit", label: "Mark as Deposited", icon: "cilArrowThickToBottom", color: "info" },
    { type: "view", label: "View Details", icon: "cilInfo", color: "info" },
  ],
  deposited: [
    { type: "withdraw", label: "Mark as Withdrawn", icon: "cilArrowThickFromBottom", color: "secondary" },
    { type: "view", label: "View Details", icon: "cilInfo", color: "info" },
  ],
  default: [
    { type: "view", label: "View Details", icon: "cilInfo", color: "info" },
  ]
};

export const userActions = {
  active: [
    { type: "suspend", label: "Suspend", icon: "cilBan", color: "warning" },
    { type: "view", label: "View Profile", icon: "cilUser", color: "info" },
  ],
  inactive: [
    { type: "activate", label: "Activate", icon: "cilCheckCircle", color: "success" },
    { type: "view", label: "View Profile", icon: "cilUser", color: "info" },
  ],
  suspended: [
    { type: "activate", label: "Reactivate", icon: "cilCheckCircle", color: "success" },
    { type: "view", label: "View Profile", icon: "cilUser", color: "info" },
  ]
};

export default ActionDropdown;