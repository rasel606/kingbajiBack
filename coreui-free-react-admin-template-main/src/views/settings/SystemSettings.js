// src/views/settings/SystemSettings.js
import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CSpinner,
  CAlert,
  CForm,
  CFormInput,
  CFormSelect,
  CFormSwitch,
  CFormTextarea,
  CTabs,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilSave,
  cilReload,
  cilSettings,
  cilBank,
  cilDollar,
  cilPeople,
  cilShieldAlt,
  cilEnvelopeClosed,
  cilBell,
} from '@coreui/icons'

import { useToast } from '../../context/ToastContext'
import { settingsService } from '../../services/settingsService'
import { useAuth } from '../../context/AuthContext'

const SystemSettings = () => {
  const { addToast } = useToast()
  const { hasPermission, isSuperAdmin } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState({
    // General Settings
    siteName: 'KingBaji',
    siteUrl: 'https://kingbaji.com',
    siteLogo: '',
    siteFavicon: '',
    siteCurrency: 'BDT',
    currencySymbol: '৳',
    maintenanceMode: false,
    maintenanceMessage: '',

    // Deposit Settings
    minDeposit: 100,
    maxDeposit: 50000,
    depositMethods: [],

    // Withdrawal Settings
    minWithdrawal: 500,
    maxWithdrawal: 50000,
    withdrawalMethods: [],

    // Referral Settings
    referralSettings: {
      level1Percentage: 0.2,
      level2Percentage: 0.07,
      level3Percentage: 0.03,
      minDepositForBonus: 2000,
      minTurnoverForBonus: 5000,
      bonusValidityDays: 7,
    },

    // VIP Settings
    vipSettings: [],

    // Commission Settings
    commissionTiers: [],

    // SMS Settings
    smsSettings: {
      provider: '',
      apiKey: '',
      senderId: '',
    },

    // Email Settings
    emailSettings: {
      provider: '',
      host: '',
      port: 587,
      secure: true,
      user: '',
      password: '',
      fromEmail: '',
      fromName: '',
    },

    // Security Settings
    securitySettings: {
      maxLoginAttempts: 5,
      lockDuration: 30,
      sessionTimeout: 8,
      require2FA: false,
      allowedCountries: [],
      blockedIps: [],
    },

    // Notification Settings
    notificationSettings: {
      pushNotifications: true,
      emailNotifications: true,
      smsNotifications: true,
    },
  })

  // Fetch settings
  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await settingsService.getSystemSettings()
      setSettings(response.settings)
    } catch (error) {
      addToast('Failed to load settings', 'danger')
      console.error('Fetch settings error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Save settings
  const handleSave = async () => {
    setSaving(true)
    try {
      await settingsService.updateSystemSettings(settings)
      addToast('Settings saved successfully', 'success')
    } catch (error) {
      addToast('Failed to save settings', 'danger')
      console.error('Save settings error:', error)
    } finally {
      setSaving(false)
    }
  }

  // Handle input change
  const handleChange = (path, value) => {
    if (path.includes('.')) {
      const [parent, child] = path.split('.')
      setSettings((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }))
    } else {
      setSettings((prev) => ({
        ...prev,
        [path]: value,
      }))
    }
  }

  // Add deposit method
  const handleAddDepositMethod = () => {
    const newMethod = {
      name: '',
      type: '',
      status: 'active',
      minAmount: 0,
      maxAmount: 0,
      feePercentage: 0,
      processingTime: 'Instant',
      instructions: '',
      accountDetails: {},
    }

    setSettings((prev) => ({
      ...prev,
      depositMethods: [...prev.depositMethods, newMethod],
    }))
  }

  // Update deposit method
  const handleUpdateDepositMethod = (index, field, value) => {
    const updatedMethods = [...settings.depositMethods]
    updatedMethods[index][field] = value

    setSettings((prev) => ({
      ...prev,
      depositMethods: updatedMethods,
    }))
  }

  // Remove deposit method
  const handleRemoveDepositMethod = (index) => {
    const updatedMethods = settings.depositMethods.filter((_, i) => i !== index)
    setSettings((prev) => ({
      ...prev,
      depositMethods: updatedMethods,
    }))
  }

  // Add VIP level
  const handleAddVipLevel = () => {
    const newLevel = {
      level: '',
      minTurnover: 0,
      cashbackPercentage: 0,
      birthdayBonus: 0,
      monthlyBonus: 0,
      withdrawalLimit: 0,
      personalManager: false,
      specialGifts: false,
    }

    setSettings((prev) => ({
      ...prev,
      vipSettings: [...prev.vipSettings, newLevel],
    }))
  }

  // Add commission tier
  const handleAddCommissionTier = () => {
    const newTier = {
      tier: settings.commissionTiers.length + 1,
      minTurnover: 0,
      maxTurnover: 0,
      level1Percentage: 0,
      level2Percentage: 0,
      level3Percentage: 0,
    }

    setSettings((prev) => ({
      ...prev,
      commissionTiers: [...prev.commissionTiers, newTier],
    }))
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  if (loading) {
    return (
      <div className="text-center py-5">
        <CSpinner color="primary" size="lg" />
        <p className="mt-3">Loading settings...</p>
      </div>
    )
  }

  return (
    <>
      <h1 className="mb-4">System Settings</h1>

      <CCard className="mb-4">
        <CCardBody>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="mb-0">Configure System Settings</h5>
            <div className="d-flex gap-2">
              <CButton color="secondary" variant="outline" onClick={fetchSettings}>
                <CIcon icon={cilReload} className="me-2" />
                Reload
              </CButton>
              <CButton color="primary" onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <CSpinner size="sm" className="me-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CIcon icon={cilSave} className="me-2" />
                    Save Changes
                  </>
                )}
              </CButton>
            </div>
          </div>

          <CTabs activeTab={activeTab} onActiveTabChange={setActiveTab}>
            <CNav variant="tabs">
              <CNavItem>
                <CNavLink data-tab="general">
                  <CIcon icon={cilSettings} className="me-2" />
                  General
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink data-tab="deposit">
                  <CIcon icon={cilBank} className="me-2" />
                  Deposit
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink data-tab="withdrawal">
                  <CIcon icon={cilDollar} className="me-2" />
                  Withdrawal
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink data-tab="referral">
                  <CIcon icon={cilPeople} className="me-2" />
                  Referral
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink data-tab="vip">
                  <CIcon icon={cilSettings} className="me-2" />
                  VIP Settings
                </CNavLink>
              </CNavItem>
              {isSuperAdmin && (
                <>
                  <CNavItem>
                    <CNavLink data-tab="security">
                      <CIcon icon={cilShieldAlt} className="me-2" />
                      Security
                    </CNavLink>
                  </CNavItem>
                  <CNavItem>
                    <CNavLink data-tab="notifications">
                      <CIcon icon={cilBell} className="me-2" />
                      Notifications
                    </CNavLink>
                  </CNavItem>
                </>
              )}
            </CNav>

            <CTabContent>
              {/* General Settings Tab */}
              <CTabPane visible={activeTab === 'general'}>
                <CRow className="mt-4">
                  <CCol md={6}>
                    <CFormInput
                      label="Site Name"
                      value={settings.siteName}
                      onChange={(e) => handleChange('siteName', e.target.value)}
                      className="mb-3"
                    />
                  </CCol>
                  <CCol md={6}>
                    <CFormInput
                      label="Site URL"
                      value={settings.siteUrl}
                      onChange={(e) => handleChange('siteUrl', e.target.value)}
                      className="mb-3"
                    />
                  </CCol>
                </CRow>

                <CRow>
                  <CCol md={6}>
                    <CFormInput
                      label="Site Logo URL"
                      value={settings.siteLogo}
                      onChange={(e) => handleChange('siteLogo', e.target.value)}
                      className="mb-3"
                    />
                  </CCol>
                  <CCol md={6}>
                    <CFormInput
                      label="Favicon URL"
                      value={settings.siteFavicon}
                      onChange={(e) => handleChange('siteFavicon', e.target.value)}
                      className="mb-3"
                    />
                  </CCol>
                </CRow>

                <CRow>
                  <CCol md={6}>
                    <CFormSelect
                      label="Default Currency"
                      value={settings.siteCurrency}
                      onChange={(e) => handleChange('siteCurrency', e.target.value)}
                      className="mb-3"
                    >
                      <option value="BDT">Bangladeshi Taka (৳)</option>
                      <option value="USD">US Dollar ($)</option>
                      <option value="EUR">Euro (€)</option>
                      <option value="INR">Indian Rupee (₹)</option>
                    </CFormSelect>
                  </CCol>
                  <CCol md={6}>
                    <CFormInput
                      label="Currency Symbol"
                      value={settings.currencySymbol}
                      onChange={(e) => handleChange('currencySymbol', e.target.value)}
                      className="mb-3"
                    />
                  </CCol>
                </CRow>

                <CFormSwitch
                  label="Maintenance Mode"
                  checked={settings.maintenanceMode}
                  onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                  className="mb-3"
                />

                {settings.maintenanceMode && (
                  <CFormTextarea
                    label="Maintenance Message"
                    value={settings.maintenanceMessage}
                    onChange={(e) => handleChange('maintenanceMessage', e.target.value)}
                    rows={3}
                    className="mb-3"
                  />
                )}
              </CTabPane>

              {/* Deposit Settings Tab */}
              <CTabPane visible={activeTab === 'deposit'}>
                <CRow className="mt-4">
                  <CCol md={6}>
                    <CFormInput
                      type="number"
                      label="Minimum Deposit"
                      value={settings.minDeposit}
                      onChange={(e) => handleChange('minDeposit', parseFloat(e.target.value))}
                      className="mb-3"
                    />
                  </CCol>
                  <CCol md={6}>
                    <CFormInput
                      type="number"
                      label="Maximum Deposit"
                      value={settings.maxDeposit}
                      onChange={(e) => handleChange('maxDeposit', parseFloat(e.target.value))}
                      className="mb-3"
                    />
                  </CCol>
                </CRow>

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6>Deposit Methods</h6>
                  <CButton color="primary" size="sm" onClick={handleAddDepositMethod}>
                    <CIcon icon={cilPlus} className="me-2" />
                    Add Method
                  </CButton>
                </div>

                {settings.depositMethods.map((method, index) => (
                  <CCard key={index} className="mb-3">
                    <CCardBody>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="mb-0">Method {index + 1}</h6>
                        <CButton
                          color="danger"
                          size="sm"
                          onClick={() => handleRemoveDepositMethod(index)}
                        >
                          Remove
                        </CButton>
                      </div>

                      <CRow>
                        <CCol md={6}>
                          <CFormInput
                            label="Method Name"
                            value={method.name}
                            onChange={(e) =>
                              handleUpdateDepositMethod(index, 'name', e.target.value)
                            }
                            className="mb-2"
                          />
                        </CCol>
                        <CCol md={6}>
                          <CFormSelect
                            label="Method Type"
                            value={method.type}
                            onChange={(e) =>
                              handleUpdateDepositMethod(index, 'type', e.target.value)
                            }
                            className="mb-2"
                          >
                            <option value="">Select Type</option>
                            <option value="bank">Bank Transfer</option>
                            <option value="mobile">Mobile Banking</option>
                            <option value="card">Credit/Debit Card</option>
                            <option value="crypto">Cryptocurrency</option>
                          </CFormSelect>
                        </CCol>
                      </CRow>

                      <CRow>
                        <CCol md={4}>
                          <CFormInput
                            type="number"
                            label="Minimum Amount"
                            value={method.minAmount}
                            onChange={(e) =>
                              handleUpdateDepositMethod(
                                index,
                                'minAmount',
                                parseFloat(e.target.value),
                              )
                            }
                            className="mb-2"
                          />
                        </CCol>
                        <CCol md={4}>
                          <CFormInput
                            type="number"
                            label="Maximum Amount"
                            value={method.maxAmount}
                            onChange={(e) =>
                              handleUpdateDepositMethod(
                                index,
                                'maxAmount',
                                parseFloat(e.target.value),
                              )
                            }
                            className="mb-2"
                          />
                        </CCol>
                        <CCol md={4}>
                          <CFormInput
                            type="number"
                            label="Fee Percentage"
                            value={method.feePercentage}
                            onChange={(e) =>
                              handleUpdateDepositMethod(
                                index,
                                'feePercentage',
                                parseFloat(e.target.value),
                              )
                            }
                            className="mb-2"
                          />
                        </CCol>
                      </CRow>

                      <CFormTextarea
                        label="Instructions"
                        value={method.instructions}
                        onChange={(e) =>
                          handleUpdateDepositMethod(index, 'instructions', e.target.value)
                        }
                        rows={2}
                        className="mb-2"
                      />

                      <CFormSwitch
                        label="Active"
                        checked={method.status === 'active'}
                        onChange={(e) =>
                          handleUpdateDepositMethod(
                            index,
                            'status',
                            e.target.checked ? 'active' : 'inactive',
                          )
                        }
                      />
                    </CCardBody>
                  </CCard>
                ))}
              </CTabPane>

              {/* Referral Settings Tab */}
              <CTabPane visible={activeTab === 'referral'}>
                <h6 className="mt-4 mb-3">Referral Commission Settings</h6>

                <CRow>
                  <CCol md={4}>
                    <CFormInput
                      type="number"
                      label="Level 1 Commission (%)"
                      value={settings.referralSettings.level1Percentage}
                      onChange={(e) =>
                        handleChange(
                          'referralSettings.level1Percentage',
                          parseFloat(e.target.value),
                        )
                      }
                      className="mb-3"
                    />
                  </CCol>
                  <CCol md={4}>
                    <CFormInput
                      type="number"
                      label="Level 2 Commission (%)"
                      value={settings.referralSettings.level2Percentage}
                      onChange={(e) =>
                        handleChange(
                          'referralSettings.level2Percentage',
                          parseFloat(e.target.value),
                        )
                      }
                      className="mb-3"
                    />
                  </CCol>
                  <CCol md={4}>
                    <CFormInput
                      type="number"
                      label="Level 3 Commission (%)"
                      value={settings.referralSettings.level3Percentage}
                      onChange={(e) =>
                        handleChange(
                          'referralSettings.level3Percentage',
                          parseFloat(e.target.value),
                        )
                      }
                      className="mb-3"
                    />
                  </CCol>
                </CRow>

                <CRow>
                  <CCol md={6}>
                    <CFormInput
                      type="number"
                      label="Minimum Deposit for Bonus"
                      value={settings.referralSettings.minDepositForBonus}
                      onChange={(e) =>
                        handleChange(
                          'referralSettings.minDepositForBonus',
                          parseFloat(e.target.value),
                        )
                      }
                      className="mb-3"
                    />
                  </CCol>
                  <CCol md={6}>
                    <CFormInput
                      type="number"
                      label="Minimum Turnover for Bonus"
                      value={settings.referralSettings.minTurnoverForBonus}
                      onChange={(e) =>
                        handleChange(
                          'referralSettings.minTurnoverForBonus',
                          parseFloat(e.target.value),
                        )
                      }
                      className="mb-3"
                    />
                  </CCol>
                </CRow>

                <CFormInput
                  type="number"
                  label="Bonus Validity Days"
                  value={settings.referralSettings.bonusValidityDays}
                  onChange={(e) =>
                    handleChange('referralSettings.bonusValidityDays', parseInt(e.target.value))
                  }
                  className="mb-3"
                />

                <h6 className="mt-4 mb-3">Commission Tiers</h6>

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <p className="mb-0">Configure commission based on turnover ranges</p>
                  <CButton color="primary" size="sm" onClick={handleAddCommissionTier}>
                    <CIcon icon={cilPlus} className="me-2" />
                    Add Tier
                  </CButton>
                </div>

                {settings.commissionTiers.map((tier, index) => (
                  <CCard key={index} className="mb-3">
                    <CCardBody>
                      <h6>Tier {tier.tier}</h6>

                      <CRow>
                        <CCol md={6}>
                          <CFormInput
                            type="number"
                            label="Minimum Turnover"
                            value={tier.minTurnover}
                            onChange={(e) => {
                              const updatedTiers = [...settings.commissionTiers]
                              updatedTiers[index].minTurnover = parseFloat(e.target.value)
                              setSettings((prev) => ({ ...prev, commissionTiers: updatedTiers }))
                            }}
                            className="mb-2"
                          />
                        </CCol>
                        <CCol md={6}>
                          <CFormInput
                            type="number"
                            label="Maximum Turnover"
                            value={tier.maxTurnover}
                            onChange={(e) => {
                              const updatedTiers = [...settings.commissionTiers]
                              updatedTiers[index].maxTurnover = parseFloat(e.target.value)
                              setSettings((prev) => ({ ...prev, commissionTiers: updatedTiers }))
                            }}
                            className="mb-2"
                          />
                        </CCol>
                      </CRow>

                      <CRow>
                        <CCol md={4}>
                          <CFormInput
                            type="number"
                            label="Level 1 %"
                            value={tier.level1Percentage}
                            onChange={(e) => {
                              const updatedTiers = [...settings.commissionTiers]
                              updatedTiers[index].level1Percentage = parseFloat(e.target.value)
                              setSettings((prev) => ({ ...prev, commissionTiers: updatedTiers }))
                            }}
                            className="mb-2"
                          />
                        </CCol>
                        <CCol md={4}>
                          <CFormInput
                            type="number"
                            label="Level 2 %"
                            value={tier.level2Percentage}
                            onChange={(e) => {
                              const updatedTiers = [...settings.commissionTiers]
                              updatedTiers[index].level2Percentage = parseFloat(e.target.value)
                              setSettings((prev) => ({ ...prev, commissionTiers: updatedTiers }))
                            }}
                            className="mb-2"
                          />
                        </CCol>
                        <CCol md={4}>
                          <CFormInput
                            type="number"
                            label="Level 3 %"
                            value={tier.level3Percentage}
                            onChange={(e) => {
                              const updatedTiers = [...settings.commissionTiers]
                              updatedTiers[index].level3Percentage = parseFloat(e.target.value)
                              setSettings((prev) => ({ ...prev, commissionTiers: updatedTiers }))
                            }}
                            className="mb-2"
                          />
                        </CCol>
                      </CRow>
                    </CCardBody>
                  </CCard>
                ))}
              </CTabPane>

              {/* VIP Settings Tab */}
              <CTabPane visible={activeTab === 'vip'}>
                <div className="d-flex justify-content-between align-items-center mt-4 mb-3">
                  <h6 className="mb-0">VIP Levels Configuration</h6>
                  <CButton color="primary" size="sm" onClick={handleAddVipLevel}>
                    <CIcon icon={cilPlus} className="me-2" />
                    Add VIP Level
                  </CButton>
                </div>

                {settings.vipSettings.map((level, index) => (
                  <CCard key={index} className="mb-3">
                    <CCardBody>
                      <CRow>
                        <CCol md={6}>
                          <CFormInput
                            label="Level Name"
                            value={level.level}
                            onChange={(e) => {
                              const updatedLevels = [...settings.vipSettings]
                              updatedLevels[index].level = e.target.value
                              setSettings((prev) => ({ ...prev, vipSettings: updatedLevels }))
                            }}
                            className="mb-2"
                          />
                        </CCol>
                        <CCol md={6}>
                          <CFormInput
                            type="number"
                            label="Minimum Turnover Required"
                            value={level.minTurnover}
                            onChange={(e) => {
                              const updatedLevels = [...settings.vipSettings]
                              updatedLevels[index].minTurnover = parseFloat(e.target.value)
                              setSettings((prev) => ({ ...prev, vipSettings: updatedLevels }))
                            }}
                            className="mb-2"
                          />
                        </CCol>
                      </CRow>

                      <CRow>
                        <CCol md={4}>
                          <CFormInput
                            type="number"
                            label="Cashback %"
                            value={level.cashbackPercentage}
                            onChange={(e) => {
                              const updatedLevels = [...settings.vipSettings]
                              updatedLevels[index].cashbackPercentage = parseFloat(e.target.value)
                              setSettings((prev) => ({ ...prev, vipSettings: updatedLevels }))
                            }}
                            className="mb-2"
                          />
                        </CCol>
                        <CCol md={4}>
                          <CFormInput
                            type="number"
                            label="Birthday Bonus"
                            value={level.birthdayBonus}
                            onChange={(e) => {
                              const updatedLevels = [...settings.vipSettings]
                              updatedLevels[index].birthdayBonus = parseFloat(e.target.value)
                              setSettings((prev) => ({ ...prev, vipSettings: updatedLevels }))
                            }}
                            className="mb-2"
                          />
                        </CCol>
                        <CCol md={4}>
                          <CFormInput
                            type="number"
                            label="Monthly Bonus"
                            value={level.monthlyBonus}
                            onChange={(e) => {
                              const updatedLevels = [...settings.vipSettings]
                              updatedLevels[index].monthlyBonus = parseFloat(e.target.value)
                              setSettings((prev) => ({ ...prev, vipSettings: updatedLevels }))
                            }}
                            className="mb-2"
                          />
                        </CCol>
                      </CRow>

                      <CRow>
                        <CCol md={6}>
                          <CFormInput
                            type="number"
                            label="Withdrawal Limit"
                            value={level.withdrawalLimit}
                            onChange={(e) => {
                              const updatedLevels = [...settings.vipSettings]
                              updatedLevels[index].withdrawalLimit = parseFloat(e.target.value)
                              setSettings((prev) => ({ ...prev, vipSettings: updatedLevels }))
                            }}
                            className="mb-2"
                          />
                        </CCol>
                      </CRow>

                      <CRow>
                        <CCol md={6}>
                          <CFormSwitch
                            label="Personal Manager"
                            checked={level.personalManager}
                            onChange={(e) => {
                              const updatedLevels = [...settings.vipSettings]
                              updatedLevels[index].personalManager = e.target.checked
                              setSettings((prev) => ({ ...prev, vipSettings: updatedLevels }))
                            }}
                            className="mb-2"
                          />
                        </CCol>
                        <CCol md={6}>
                          <CFormSwitch
                            label="Special Gifts"
                            checked={level.specialGifts}
                            onChange={(e) => {
                              const updatedLevels = [...settings.vipSettings]
                              updatedLevels[index].specialGifts = e.target.checked
                              setSettings((prev) => ({ ...prev, vipSettings: updatedLevels }))
                            }}
                            className="mb-2"
                          />
                        </CCol>
                      </CRow>
                    </CCardBody>
                  </CCard>
                ))}
              </CTabPane>

              {/* Security Settings Tab (Superadmin only) */}
              {isSuperAdmin && (
                <CTabPane visible={activeTab === 'security'}>
                  <h6 className="mt-4 mb-3">Security Configuration</h6>

                  <CRow>
                    <CCol md={6}>
                      <CFormInput
                        type="number"
                        label="Max Login Attempts"
                        value={settings.securitySettings.maxLoginAttempts}
                        onChange={(e) =>
                          handleChange(
                            'securitySettings.maxLoginAttempts',
                            parseInt(e.target.value),
                          )
                        }
                        className="mb-3"
                      />
                    </CCol>
                    <CCol md={6}>
                      <CFormInput
                        type="number"
                        label="Lock Duration (minutes)"
                        value={settings.securitySettings.lockDuration}
                        onChange={(e) =>
                          handleChange('securitySettings.lockDuration', parseInt(e.target.value))
                        }
                        className="mb-3"
                      />
                    </CCol>
                  </CRow>

                  <CRow>
                    <CCol md={6}>
                      <CFormInput
                        type="number"
                        label="Session Timeout (hours)"
                        value={settings.securitySettings.sessionTimeout}
                        onChange={(e) =>
                          handleChange('securitySettings.sessionTimeout', parseInt(e.target.value))
                        }
                        className="mb-3"
                      />
                    </CCol>
                  </CRow>

                  <CFormSwitch
                    label="Require Two-Factor Authentication"
                    checked={settings.securitySettings.require2FA}
                    onChange={(e) => handleChange('securitySettings.require2FA', e.target.checked)}
                    className="mb-3"
                  />

                  <div className="mb-3">
                    <label className="form-label">Allowed Countries</label>
                    <CFormTextarea
                      value={settings.securitySettings.allowedCountries.join(', ')}
                      onChange={(e) =>
                        handleChange(
                          'securitySettings.allowedCountries',
                          e.target.value.split(',').map((country) => country.trim()),
                        )
                      }
                      rows={3}
                      placeholder="Enter country codes separated by commas (e.g., BD, IN, US)"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Blocked IP Addresses</label>
                    <CFormTextarea
                      value={settings.securitySettings.blockedIps.join(', ')}
                      onChange={(e) =>
                        handleChange(
                          'securitySettings.blockedIps',
                          e.target.value.split(',').map((ip) => ip.trim()),
                        )
                      }
                      rows={3}
                      placeholder="Enter IP addresses separated by commas"
                    />
                  </div>
                </CTabPane>
              )}
            </CTabContent>
          </CTabs>
        </CCardBody>
      </CCard>
    </>
  )
}

export default SystemSettings
