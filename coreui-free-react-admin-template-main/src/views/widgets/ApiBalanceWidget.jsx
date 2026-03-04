import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CButton,
  CSpinner,
  CProgress,
  CTable,
  CTableBody,
  CTableRow,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CBadge,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilReload, cilCheckCircle, cilWarning } from '@coreui/icons'
import { adminServices } from '../../service/adminServices'
import { format } from 'date-fns'
import { useAuth } from '../../context/AuthContext'

const ApiBalanceWidget = () => {
  const [balanceData, setBalanceData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const { user } = useAuth()

  const fetchApiBalance = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminServices.getApiBalanceStats()
      console.log(data)
      setBalanceData(data)
    } catch (err) {
      setError('Failed to fetch API balance')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  //   const handleUpdateBalance = async () => {
  //     setUpdating(true);
  //     setError(null);
  //     setSuccess(null);

  //     try {
  //       const result = await apiBalanceService.getApiBalanceStats();
  //       setBalanceData({
  //         ...balanceData,
  //         apiBalance: result.apiBalance,
  //         lastApiBalanceUpdate: new Date(),
  //         apiBalanceHistory: [...(balanceData?.apiBalanceHistory || []), {
  //           amount: result.apiBalance,
  //           date: new Date()
  //         }]
  //       });
  //       setSuccess('Balance updated successfully!');
  //       setTimeout(() => setSuccess(null), 3000);
  //     } catch (err) {
  //       setError('Failed to update balance: ' + err.message);
  //     } finally {
  //       setUpdating(false);
  //     }
  //   };

  useEffect(() => {
    fetchApiBalance()

    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchApiBalance, 5 * 1000)

    return () => clearInterval(interval)
  }, [])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2,
    }).format(amount || 0)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Never'
    try {
      return format(new Date(dateString), 'dd MMM yyyy HH:mm:ss')
    } catch (err) {
      return 'Invalid date'
    }
  }

  if (loading && !balanceData) {
    return (
      <CCard>
        <CCardBody className="text-center p-5">
          <CSpinner />
          <div className="mt-3">Loading API balance...</div>
        </CCardBody>
      </CCard>
    )
  }

  return (
    <CCard className="mb-4">
      <CCardBody>
        <div className="text-center mb-4">
          <div className="text-muted mb-2">Current API Balance</div>
          <h2 className={balanceData?.apiBalance < 1000 ? 'text-danger' : 'text-success'}>
            {formatCurrency(balanceData?.apiBalance || 0)}
          </h2>

          {/* Balance Status Indicator */}
          <div className="mt-3">
            <CProgress
              color={
                balanceData?.apiBalance > 5000
                  ? 'success'
                  : balanceData?.apiBalance > 1000
                    ? 'warning'
                    : 'danger'
              }
              value={Math.min(((balanceData?.apiBalance || 0) / 10000) * 100, 100)}
              className="mb-2"
            />
            <small className="text-muted">
              {balanceData?.apiBalance > 5000
                ? 'Healthy'
                : balanceData?.apiBalance > 1000
                  ? 'Low'
                  : 'Critical'}{' '}
              balance level
            </small>
          </div>
        </div>

        {/* Balance History */}
        {/* {balanceData?.apiBalanceHistory && balanceData.apiBalanceHistory.length > 0 && (
          <div className="mt-4">
            <h6 className="mb-3">Balance History (Last 10 entries)</h6>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <CTable striped hover size="sm">
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Date & Time</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">Amount</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {balanceData.apiBalanceHistory
                    .slice(-10)
                    .reverse()
                    .map((history, index) => (
                      <CTableRow key={index}>
                        <CTableDataCell>
                          {formatDate(history.date)}
                        </CTableDataCell>
                        <CTableDataCell className="text-end fw-semibold">
                          {formatCurrency(history.amount)}
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge 
                            color={
                              history.amount > 5000 ? 'success' : 
                              history.amount > 1000 ? 'warning' : 'danger'
                            }
                          >
                            {history.amount > 5000 ? 'Normal' : 
                             history.amount > 1000 ? 'Low' : 'Critical'}
                          </CBadge>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                </CTableBody>
              </CTable>
            </div>
          </div>
        )} */}

        {/* Auto Update Info */}
        {/* <div className="mt-4 pt-3 border-top text-center">
          <small className="text-muted">
            <CIcon icon={cilReload} className="me-1" />
            Auto-updates every 24 hours (midnight) • Next update: {formatDate(
              new Date(new Date().setHours(24, 0, 0, 0))
            )}
          </small>
        </div> */}
      </CCardBody>
    </CCard>
  )
}

export default ApiBalanceWidget
