// import React from "react";
// import {
//   CModal,
//   CModalHeader,
//   CModalTitle,
//   CModalBody,
//   CModalFooter,
//   CButton,
//   CRow,
//   CCol,
//   CCard,
//   CCardBody,
//   CBadge,
//   CListGroup,
//   CListGroupItem,
// } from "@coreui/react";

// const BonusDetailsModal = ({ show, onClose, bonus }) => {
//   if (!bonus) return null;

//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A";
//     return new Date(dateString).toLocaleDateString();
//   };

//   const renderSteps = (steps) => {
//     if (!steps || typeof steps !== 'object') return null;

//     return Object.entries(steps).map(([key, value]) => (
//       value && (
//         <CListGroupItem key={key}>
//           <strong>{key}:</strong> {value}
//         </CListGroupItem>
//       )
//     )).filter(Boolean);
//   };

//   return (
//     <CModal visible={show} onClose={onClose} size="lg">
//       <CModalHeader>
//         <CModalTitle>Bonus Details</CModalTitle>
//       </CModalHeader>
//       <CModalBody>
//         <CCard className="mb-3">
//           <CCardBody>
//             <CRow className="mb-3">
//               <CCol md={6}>
//                 <strong>Name:</strong> {bonus.name}
//               </CCol>
//               <CCol md={6}>
//                 <strong>Type:</strong>{" "}
//                 <CBadge color="info">{bonus.bonusType}</CBadge>
//               </CCol>
//             </CRow>

//             <div className="mb-3">
//               <strong>Description:</strong>
//               <p>{bonus.description}</p>
//             </div>

//             {bonus.img && (
//               <div className="mb-3">
//                 <strong>Image:</strong>
//                 <div className="mt-2">
//                   <img
//                     src={bonus.img}
//                     alt="Bonus"
//                     style={{ maxWidth: '200px' }}
//                     className="img-fluid"
//                   />
//                 </div>
//               </div>
//             )}
//           </CCardBody>
//         </CCard>

//         {/* Bonus Configuration */}
//         <CCard className="mb-3">
//           <CCardBody>
//             <h6>Bonus Configuration</h6>
//             <CRow>
//               {bonus.percentage && (
//                 <CCol md={4}>
//                   <strong>Percentage:</strong> {bonus.percentage}%
//                 </CCol>
//               )}
//               {bonus.fixedAmount && (
//                 <CCol md={4}>
//                   <strong>Fixed Amount:</strong> ${bonus.fixedAmount}
//                 </CCol>
//               )}
//               {bonus.minDeposit && (
//                 <CCol md={4}>
//                   <strong>Min Deposit:</strong> ${bonus.minDeposit}
//                 </CCol>
//               )}
//             </CRow>

//             <CRow className="mt-2">
//               {bonus.maxBonus && (
//                 <CCol md={4}>
//                   <strong>Max Bonus:</strong> ${bonus.maxBonus}
//                 </CCol>
//               )}
//               {bonus.wageringRequirement && (
//                 <CCol md={4}>
//                   <strong>Wagering:</strong> {bonus.wageringRequirement}x
//                 </CCol>
//               )}
//               {bonus.validDays && (
//                 <CCol md={4}>
//                   <strong>Valid Days:</strong> {bonus.validDays}
//                 </CCol>
//               )}
//             </CRow>

//             {/* Referral Levels */}
//             {(bonus.level1Percent || bonus.level2Percent || bonus.level3Percent) && (
//               <div className="mt-3">
//                 <h6>Referral Commission</h6>
//                 <CRow>
//                   {bonus.level1Percent && (
//                     <CCol md={4}>
//                       <strong>Level 1:</strong> {bonus.level1Percent}%
//                     </CCol>
//                   )}
//                   {bonus.level2Percent && (
//                     <CCol md={4}>
//                       <strong>Level 2:</strong> {bonus.level2Percent}%
//                     </CCol>
//                   )}
//                   {bonus.level3Percent && (
//                     <CCol md={4}>
//                       <strong>Level 3:</strong> {bonus.level3Percent}%
//                     </CCol>
//                   )}
//                 </CRow>
//               </div>
//             )}
//           </CCardBody>
//         </CCard>

//         {/* Eligibility */}
//         <CCard className="mb-3">
//           <CCardBody>
//             <h6>Eligibility</h6>
//             {bonus.eligibleGames && bonus.eligibleGames.length > 0 && (
//               <div className="mb-2">
//                 <strong>Games:</strong> {bonus.eligibleGames.join(', ')}
//               </div>
//             )}
//             {bonus.cetegory && bonus.cetegory.length > 0 && (
//               <div>
//                 <strong>Categories:</strong> {bonus.cetegory.join(', ')}
//               </div>
//             )}
//           </CCardBody>
//         </CCard>

//         {/* Instructions */}
//         {bonus.howtoClaim && Object.values(bonus.howtoClaim).some(v => v) && (
//           <CCard className="mb-3">
//             <CCardBody>
//               <h6>How to Claim</h6>
//               <CListGroup>
//                 {renderSteps(bonus.howtoClaim)}
//               </CListGroup>
//             </CCardBody>
//           </CCard>
//         )}

//         {/* Validity Period */}
//         <CCard className="mb-3">
//           <CCardBody>
//             <h6>Validity Period</h6>
//             <CRow>
//               <CCol md={6}>
//                 <strong>Start Date:</strong> {formatDate(bonus.startDate)}
//               </CCol>
//               <CCol md={6}>
//                 <strong>End Date:</strong> {formatDate(bonus.endDate) || "No end date"}
//               </CCol>
//             </CRow>
//           </CCardBody>
//         </CCard>

//         {/* Status */}
//         <div className="d-flex justify-content-between align-items-center">
//           <div>
//             <strong>Status:</strong>{" "}
//             <CBadge color={bonus.isActive ? "success" : "secondary"}>
//               {bonus.isActive ? "Active" : "Inactive"}
//             </CBadge>
//           </div>
//           <div>
//             <strong>Created:</strong> {formatDate(bonus.createdAt)}
//           </div>
//         </div>
//       </CModalBody>
//       <CModalFooter>
//         <CButton color="secondary" onClick={onClose}>
//           Close
//         </CButton>
//       </CModalFooter>
//     </CModal>
//   );
// };

// export default BonusDetailsModal;
import React from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CBadge,
  CListGroup,
  CListGroupItem,
  CCardHeader,
  CSpinner,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilCalendar,
  cilDollar,
  cilChartLine,
  cilClock,
  cilCheckCircle,
  cilXCircle,
  cilInfo,
} from '@coreui/icons'

const BonusDetailsModal = ({ show, onClose, bonus, loading = false }) => {
  if (!bonus) return null

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch (err) {
      return 'Invalid date'
    }
  }

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'Not set'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatPercentage = (value) => {
    if (!value && value !== 0) return 'Not set'
    return `${value}%`
  }

  const renderSteps = (steps, title) => {
    if (!steps || (typeof steps === 'object' && Object.keys(steps).length === 0)) {
      return (
        <div className="text-center py-3 text-muted">
          <CIcon icon={cilInfo} className="me-1" />
          No {title.toLowerCase()} defined
        </div>
      )
    }

    let stepItems = []

    // Handle object format {step1: "...", step2: "..."}
    if (typeof steps === 'object' && !Array.isArray(steps)) {
      stepItems = Object.entries(steps)
        .filter(([key]) => key.startsWith('step'))
        .sort(([a], [b]) => {
          const numA = parseInt(a.replace('step', '')) || 0
          const numB = parseInt(b.replace('step', '')) || 0
          return numA - numB
        })
        .map(([key, value], index) => ({
          order: index + 1,
          text: value,
        }))
    }
    // Handle array format
    else if (Array.isArray(steps)) {
      stepItems = steps
        .filter((step) => step && (step.value || step.text))
        .map((step, index) => ({
          order: step.order || index + 1,
          text: step.value || step.text || step,
        }))
    }

    if (stepItems.length === 0) {
      return <div className="text-center py-3 text-muted">No valid steps found</div>
    }

    return (
      <CListGroup>
        {stepItems.map((step) => (
          <CListGroupItem key={`${title}-${step.order}`}>
            <div className="d-flex align-items-start">
              <CBadge color="primary" className="me-2 mt-1">
                Step {step.order}
              </CBadge>
              <div>{step.text}</div>
            </div>
          </CListGroupItem>
        ))}
      </CListGroup>
    )
  }

  const getBonusTypeLabel = (type) => {
    const typeMap = {
      deposit: 'Deposit Bonus',
      dailyRebate: 'Daily Rebate',
      weeklyBonus: 'Weekly Bonus',
      vip: 'VIP Bonus',
      referral: 'Referral Bonus',
      referralRebate: 'Referral Rebate',
      signup: 'Signup Bonus',
      birthday: 'Birthday Bonus',
      welcomeBonus: 'Welcome Bonus',
      firstDeposit: 'First Deposit',
      freeSpins: 'Free Spins',
      normalDeposit: 'Normal Deposit',
      other: 'Other',
    }
    return typeMap[type] || type
  }

  const getBonusTypeColor = (type) => {
    const colors = {
      deposit: 'primary',
      dailyRebate: 'success',
      weeklyBonus: 'info',
      vip: 'warning',
      referral: 'secondary',
      referralRebate: 'dark',
      signup: 'primary',
      birthday: 'danger',
      welcomeBonus: 'success',
      firstDeposit: 'info',
      freeSpins: 'warning',
      normalDeposit: 'secondary',
      other: 'dark',
    }
    return colors[type] || 'secondary'
  }

  const isExpired = () => {
    if (!bonus.endDate) return false
    try {
      return new Date(bonus.endDate) < new Date()
    } catch (err) {
      return false
    }
  }

  return (
    <CModal visible={show} onClose={onClose} size="lg" scrollable>
      <CModalHeader closeButton>
        <CModalTitle>Bonus Details</CModalTitle>
      </CModalHeader>
      <CModalBody>
        {loading ? (
          <div className="text-center py-5">
            <CSpinner color="primary" />
            <p className="mt-2">Loading bonus details...</p>
          </div>
        ) : (
          <>
            {/* Header with Status */}
            <div className="d-flex justify-content-between align-items-start mb-4">
              <div>
                <h4 className="mb-1">{bonus.name}</h4>
                <div className="d-flex align-items-center gap-2">
                  <CBadge color={getBonusTypeColor(bonus.bonusType)}>
                    {getBonusTypeLabel(bonus.bonusType)}
                  </CBadge>
                  <CBadge color={bonus.isActive ? 'success' : 'secondary'}>
                    {bonus.isActive ? 'Active' : 'Inactive'}
                  </CBadge>
                  {isExpired() && <CBadge color="danger">Expired</CBadge>}
                </div>
              </div>
              <div className="text-end">
                <small className="text-muted">Created: {formatDate(bonus.createdAt)}</small>
              </div>
            </div>

            {/* Description */}
            <CCard className="mb-3">
              <CCardBody>
                <h6 className="mb-2">Description</h6>
                <p className="mb-0">{bonus.description}</p>
              </CCardBody>
            </CCard>

            {/* Image Preview */}
            {bonus.img && (
              <CCard className="mb-3">
                <CCardBody>
                  <h6 className="mb-2">Image</h6>
                  <div className="text-center">
                    <img
                      src={bonus.img}
                      alt={bonus.name}
                      className="img-fluid rounded"
                      style={{ maxHeight: '200px', objectFit: 'contain' }}
                    />
                  </div>
                </CCardBody>
              </CCard>
            )}

            {/* Bonus Configuration */}
            <CCard className="mb-3">
              <CCardHeader>
                <h6 className="mb-0">Bonus Configuration</h6>
              </CCardHeader>
              <CCardBody>
                <CRow>
                  {bonus.percentage !== undefined && bonus.percentage !== null && (
                    <CCol md={4} className="mb-3">
                      <div className="d-flex align-items-center">
                        <CIcon icon={cilChartLine} className="text-primary me-2" />
                        <div>
                          <small className="text-muted">Percentage</small>
                          <div className="fw-bold">{formatPercentage(bonus.percentage)}</div>
                        </div>
                      </div>
                    </CCol>
                  )}

                  {bonus.fixedAmount !== undefined && bonus.fixedAmount !== null && (
                    <CCol md={4} className="mb-3">
                      <div className="d-flex align-items-center">
                        <CIcon icon={cilDollar} className="text-success me-2" />
                        <div>
                          <small className="text-muted">Fixed Amount</small>
                          <div className="fw-bold">{formatCurrency(bonus.fixedAmount)}</div>
                        </div>
                      </div>
                    </CCol>
                  )}

                  {bonus.minDeposit !== undefined && bonus.minDeposit !== null && (
                    <CCol md={4} className="mb-3">
                      <div className="d-flex align-items-center">
                        <CIcon icon={cilDollar} className="text-warning me-2" />
                        <div>
                          <small className="text-muted">Min Deposit</small>
                          <div className="fw-bold">{formatCurrency(bonus.minDeposit)}</div>
                        </div>
                      </div>
                    </CCol>
                  )}

                  {bonus.maxBonus !== undefined && bonus.maxBonus !== null && (
                    <CCol md={4} className="mb-3">
                      <div className="d-flex align-items-center">
                        <CIcon icon={cilDollar} className="text-info me-2" />
                        <div>
                          <small className="text-muted">Max Bonus</small>
                          <div className="fw-bold">{formatCurrency(bonus.maxBonus)}</div>
                        </div>
                      </div>
                    </CCol>
                  )}

                  {bonus.wageringRequirement && (
                    <CCol md={4} className="mb-3">
                      <div className="d-flex align-items-center">
                        <CIcon icon={cilChartLine} className="text-secondary me-2" />
                        <div>
                          <small className="text-muted">Wagering</small>
                          <div className="fw-bold">{bonus.wageringRequirement}x</div>
                        </div>
                      </div>
                    </CCol>
                  )}

                  {bonus.validDays && (
                    <CCol md={4} className="mb-3">
                      <div className="d-flex align-items-center">
                        <CIcon icon={cilClock} className="text-dark me-2" />
                        <div>
                          <small className="text-muted">Valid Days</small>
                          <div className="fw-bold">{bonus.validDays} days</div>
                        </div>
                      </div>
                    </CCol>
                  )}
                </CRow>

                {/* Referral Levels */}
                {(bonus.level1Percent !== undefined ||
                  bonus.level2Percent !== undefined ||
                  bonus.level3Percent !== undefined) && (
                  <div className="mt-3 pt-3 border-top">
                    <h6 className="mb-3">Referral Commission</h6>
                    <CRow>
                      {bonus.level1Percent !== undefined && bonus.level1Percent !== null && (
                        <CCol md={4}>
                          <div className="text-center">
                            <div className="fw-bold text-primary">Level 1</div>
                            <div className="h4">{formatPercentage(bonus.level1Percent)}</div>
                          </div>
                        </CCol>
                      )}
                      {bonus.level2Percent !== undefined && bonus.level2Percent !== null && (
                        <CCol md={4}>
                          <div className="text-center">
                            <div className="fw-bold text-info">Level 2</div>
                            <div className="h4">{formatPercentage(bonus.level2Percent)}</div>
                          </div>
                        </CCol>
                      )}
                      {bonus.level3Percent !== undefined && bonus.level3Percent !== null && (
                        <CCol md={4}>
                          <div className="text-center">
                            <div className="fw-bold text-secondary">Level 3</div>
                            <div className="h4">{formatPercentage(bonus.level3Percent)}</div>
                          </div>
                        </CCol>
                      )}
                    </CRow>
                  </div>
                )}
              </CCardBody>
            </CCard>

            {/* Eligibility */}
            <CCard className="mb-3">
              <CCardHeader>
                <h6 className="mb-0">Eligibility</h6>
              </CCardHeader>
              <CCardBody>
                {bonus.eligibleGames?.length > 0 || bonus.cetegory?.length > 0 ? (
                  <CRow>
                    {bonus.eligibleGames?.length > 0 && (
                      <CCol md={6}>
                        <h6>Eligible Games</h6>
                        <div className="d-flex flex-wrap gap-1">
                          {bonus.eligibleGames.map((game, index) => (
                            <CBadge key={index} color="info" className="mb-1">
                              {game.replace('_', ' ')}
                            </CBadge>
                          ))}
                        </div>
                      </CCol>
                    )}
                    {bonus.cetegory?.length > 0 && (
                      <CCol md={6}>
                        <h6>Categories</h6>
                        <div className="d-flex flex-wrap gap-1">
                          {bonus.cetegory.map((category, index) => (
                            <CBadge key={index} color="success" className="mb-1">
                              {category}
                            </CBadge>
                          ))}
                        </div>
                      </CCol>
                    )}
                  </CRow>
                ) : (
                  <div className="text-center text-muted">
                    <CIcon icon={cilInfo} className="me-1" />
                    No eligibility restrictions
                  </div>
                )}
              </CCardBody>
            </CCard>

            {/* Validity Period */}
            <CCard className="mb-3">
              <CCardHeader>
                <h6 className="mb-0">Validity Period</h6>
              </CCardHeader>
              <CCardBody>
                <CRow>
                  <CCol md={6}>
                    <div className="d-flex align-items-center">
                      <CIcon icon={cilCalendar} className="text-primary me-2" />
                      <div>
                        <small className="text-muted">Start Date</small>
                        <div className="fw-bold">{formatDate(bonus.startDate)}</div>
                      </div>
                    </div>
                  </CCol>
                  <CCol md={6}>
                    <div className="d-flex align-items-center">
                      <CIcon icon={cilCalendar} className="text-primary me-2" />
                      <div>
                        <small className="text-muted">End Date</small>
                        <div className="fw-bold">{formatDate(bonus.endDate)}</div>
                        {isExpired() && <small className="text-danger">(Expired)</small>}
                      </div>
                    </div>
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>

            {/* How to Claim */}
            <CCard className="mb-3">
              <CCardHeader>
                <h6 className="mb-0">How to Claim</h6>
              </CCardHeader>
              <CCardBody>{renderSteps(bonus.howtoClaim, 'How to Claim')}</CCardBody>
            </CCard>

            {/* How to Use */}
            <CCard className="mb-3">
              <CCardHeader>
                <h6 className="mb-0">How to Use</h6>
              </CCardHeader>
              <CCardBody>{renderSteps(bonus.howtoUse, 'How to Use')}</CCardBody>
            </CCard>

            {/* Terms & Conditions */}
            <CCard className="mb-3">
              <CCardHeader>
                <h6 className="mb-0">Terms & Conditions</h6>
              </CCardHeader>
              <CCardBody>{renderSteps(bonus.terms, 'Terms & Conditions')}</CCardBody>
            </CCard>

            {/* Additional Info */}
            <div className="mt-3 pt-3 border-top">
              <small className="text-muted">Last updated: {formatDate(bonus.updatedAt)}</small>
            </div>
          </>
        )}
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>
          Close
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default BonusDetailsModal
