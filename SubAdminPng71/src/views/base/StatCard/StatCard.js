// components/common/StatCard/StatCard.js
import React from 'react';
import { CCard, CCardBody } from '@coreui/react';
import CIcon from '@coreui/icons-react';

const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color = 'primary', 
  variant = 'default',
  trend,
  className = '',
  onClick 
}) => {
  const renderTrend = () => {
    if (!trend) return null;
    
    const isPositive = trend.value > 0;
    const trendIcon = isPositive ? 'cilArrowTop' : 'cilArrowBottom';
    const trendColor = isPositive ? 'success' : 'danger';
    
    return (
      <small className={`text-${trendColor}`}>
        <CIcon icon={trendIcon} className="me-1" />
        {Math.abs(trend.value)}% {trend.label}
      </small>
    );
  };

  const getCardClass = () => {
    if (variant === 'filled') {
      return `bg-${color} text-white`;
    }
    if (variant === 'outline') {
      return `border-${color}`;
    }
    return '';
  };

  return (
    <CCard 
      className={`mb-3 ${getCardClass()} ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      style={onClick ? { cursor: 'pointer', transition: 'all 0.2s' } : {}}
    >
      <CCardBody>
        <div className="d-flex justify-content-between align-items-start">
          <div className="flex-grow-1">
            <div className="text-value-lg">{value}</div>
            <div className={`font-weight-bold ${variant === 'filled' ? 'text-white' : ''}`}>
              {title}
            </div>
            {subtitle && (
              <small className={`${variant === 'filled' ? 'text-white-50' : 'text-muted'}`}>
                {subtitle}
              </small>
            )}
            {renderTrend()}
          </div>
          {icon && (
            <div className={`${variant === 'filled' ? 'text-white' : `text-${color}`} p-3 rounded`}>
              <CIcon width={24} icon={icon} />
            </div>
          )}
        </div>
      </CCardBody>
    </CCard>
  );
};

export default StatCard;