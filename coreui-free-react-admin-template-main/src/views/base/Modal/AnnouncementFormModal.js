import React, { useState, useEffect } from 'react'
import {
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormSelect,
  CFormLabel,
  CButton,
  CAlert,
  CSpinner,
  CRow,
  CCol,
  CFormTextarea,
  CFormSwitch,
  CInputGroup,
  CInputGroupText,
} from '@coreui/react'
import { FaPalette } from 'react-icons/fa'
import announcementService from '../../../service/announcementService'

const defaultAnnouncements = [
  {
    id: 1,
    content: `🎰 যে কোনো স্লট, লাইভ ক্যাসিনো বা স্পোর্টস গেম খেলুন এবং আনলক করুন ১.৫৩% + ১.১৩% + ০.৯৩% ইনস্ট্যান্ট রিবেট! 💸রিয়েল-টাইম বোনাস সেকশন থেকে যেকোনো সময় রিবেট ক্লেইম করুন।🚀 অপ্ট-ইন করুন HEYVIP EVO Crazy Time ইভেন্ট যুদ্ধ 🌐 www.heyvipwin.com 📈 লিডারবোর্ডে উঠুন এবং জিতুন 💰 ক্যাশ বোনাস + 🎁 গ্র্যান্ড প্রাইজ!`,
    color: '#e74c3c',
    fontSize: '16px',
    icon: 'https://img.s628b.com/sb/h5/assets/images/icon-set/index-theme-icon/index-announcement-icon.svg?v=1760412521693',
  },
]

const AnnouncementFormModal = ({ show, onClose, onSave, announcement, token }) => {
  const isEditMode = Boolean(announcement)

  const [formData, setFormData] = useState({
    content: '',
    color: '#e74c3c',
    fontSize: '16px',
    icon: 'https://img.s628b.com/sb/h5/assets/images/icon-set/index-theme-icon/index-announcement-icon.svg?v=1760412521693',
    isActive: true,
    priority: 1,
    targetUsers: 'all',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [preview, setPreview] = useState('')

  // Color presets
  const colorPresets = [
    { name: 'Red', value: '#e74c3c' },
    { name: 'Blue', value: '#3498db' },
    { name: 'Green', value: '#2ecc71' },
    { name: 'Orange', value: '#e67e22' },
    { name: 'Purple', value: '#9b59b6' },
    { name: 'Gold', value: '#f1c40f' },
    { name: 'Pink', value: '#e84393' },
  ]

  // Font size options
  const fontSizeOptions = [
    { label: 'Small (14px)', value: '14px' },
    { label: 'Medium (16px)', value: '16px' },
    { label: 'Large (18px)', value: '18px' },
    { label: 'Extra Large (20px)', value: '20px' },
    { label: 'XXL (24px)', value: '24px' },
  ]

  // Target user options
  const targetUserOptions = [
    { label: 'All Users', value: 'all' },
    { label: 'Regular Users', value: 'user' },
    { label: 'Affiliates', value: 'affiliate' },
    { label: 'Sub Agents', value: 'subagent' },
    { label: 'Agents', value: 'agent' },
    { label: 'Sub Admins', value: 'subadmin' },
    { label: 'Admins', value: 'admin' },
  ]

  // Priority options
  const priorityOptions = Array.from({ length: 10 }, (_, i) => ({
    label: `Priority ${i + 1}`,
    value: i + 1,
  }))

  // Initialize form
  useEffect(() => {
    if (show) {
      if (isEditMode && announcement) {
        setFormData({
          content: announcement.content,
          color: announcement.color,
          fontSize: announcement.fontSize,
          icon: announcement.icon,
          isActive: announcement.isActive,
          priority: announcement.priority,
          targetUsers: announcement.targetUsers,
          startDate: announcement.startDate
            ? new Date(announcement.startDate).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          endDate: announcement.endDate
            ? new Date(announcement.endDate).toISOString().split('T')[0]
            : '',
        })
      } else {
        setFormData({
          content: '',
          color: '#e74c3c',
          fontSize: '16px',
          icon: 'https://img.s628b.com/sb/h5/assets/images/icon-set/index-theme-icon/index-announcement-icon.svg?v=1760412521693',
          isActive: true,
          priority: 1,
          targetUsers: 'all',
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
        })
      }
      setMessage({ type: '', text: '' })
    }
  }, [show, announcement, isEditMode])

  // Update preview
  useEffect(() => {
    setPreview(formData.content)
  }, [formData.content, formData.color, formData.fontSize])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleColorSelect = (color) => {
    setFormData((prev) => ({
      ...prev,
      color,
    }))
  }

  const loadDefaultTemplate = (index = 0) => {
    const template = defaultAnnouncements[index]
    if (template) {
      setFormData((prev) => ({
        ...prev,
        content: template.content,
        color: template.color,
        fontSize: template.fontSize,
        icon: template.icon,
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      // Validation
      if (!formData.content.trim()) {
        setMessage({
          type: 'danger',
          text: 'Content is required',
        })
        setLoading(false)
        return
      }

      const submissionData = {
        ...formData,
        content: formData.content.trim(),
        startDate: formData.startDate
          ? new Date(formData.startDate).toISOString()
          : new Date().toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      }

      let response
      if (isEditMode) {
        response = await announcementService.updateAnnouncement(
          announcement._id,
          submissionData,
          token,
        )
      } else {
        response = await announcementService.createAnnouncement(submissionData, token)
      }

      if (response.success) {
        setMessage({
          type: 'success',
          text:
            response.message || `Announcement ${isEditMode ? 'updated' : 'created'} successfully!`,
        })

        // Reset form and close modal after success
        setTimeout(() => {
          onSave()
          onClose()
        }, 1500)
      }
    } catch (error) {
      console.error('Error saving announcement:', error)
      setMessage({
        type: 'danger',
        text:
          error.response?.data?.message ||
          `Failed to ${isEditMode ? 'update' : 'create'} announcement`,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <CModal visible={show} onClose={onClose} size="lg" backdrop="static">
      <CModalHeader closeButton>
        <h5 className="mb-0">{isEditMode ? 'Edit Announcement' : 'Create New Announcement'}</h5>
      </CModalHeader>
      <CModalBody>
        {message.text && (
          <CAlert color={message.type} className="mb-3">
            {message.text}
          </CAlert>
        )}

        <CForm onSubmit={handleSubmit}>
          {/* Content */}
          <div className="mb-3">
            <CFormLabel htmlFor="content" className="fw-semibold">
              Announcement Content <span className="text-danger">*</span>
            </CFormLabel>
            <CFormTextarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              required
              rows={5}
              placeholder="Enter announcement content..."
            />
            <div className="form-text">
              You can use emojis and special characters. Maximum 5000 characters.
            </div>
          </div>

          {/* Color Selection */}
          <div className="mb-3">
            <CFormLabel className="fw-semibold">
              Text Color <span className="text-danger">*</span>
            </CFormLabel>
            <div className="d-flex flex-wrap gap-2 mb-2">
              {colorPresets.map((color) => (
                <CButton
                  key={color.value}
                  type="button"
                  style={{
                    backgroundColor: color.value,
                    color: '#fff',
                    border: formData.color === color.value ? '3px solid #000' : '1px solid #ccc',
                    width: '40px',
                    height: '40px',
                  }}
                  onClick={() => handleColorSelect(color.value)}
                  title={color.name}
                />
              ))}
            </div>
            <CInputGroup>
              <CInputGroupText>
                <FaPalette />
              </CInputGroupText>
              <CFormInput
                type="text"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                placeholder="#e74c3c"
                pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
              />
            </CInputGroup>
            <div className="form-text">Enter hex color code or select from presets above</div>
          </div>

          {/* Font Size */}
          <div className="mb-3">
            <CFormLabel htmlFor="fontSize" className="fw-semibold">
              Font Size
            </CFormLabel>
            <CFormSelect
              id="fontSize"
              name="fontSize"
              value={formData.fontSize}
              onChange={handleInputChange}
            >
              {fontSizeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </CFormSelect>
          </div>

          {/* Icon URL */}
          <div className="mb-3">
            <CFormLabel htmlFor="icon" className="fw-semibold">
              Icon URL
            </CFormLabel>
            <CFormInput
              type="url"
              id="icon"
              name="icon"
              value={formData.icon}
              onChange={handleInputChange}
              placeholder="https://example.com/icon.png"
            />
            <div className="form-text">Leave empty to use default icon</div>
          </div>

          {/* Settings Grid */}
          <CRow>
            <CCol md={6}>
              {/* Priority */}
              <div className="mb-3">
                <CFormLabel htmlFor="priority" className="fw-semibold">
                  Priority
                </CFormLabel>
                <CFormSelect
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                >
                  {priorityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </CFormSelect>
                <div className="form-text">Higher priority announcements appear first</div>
              </div>
            </CCol>
            <CCol md={6}>
              {/* Target Users */}
              <div className="mb-3">
                <CFormLabel htmlFor="targetUsers" className="fw-semibold">
                  Target Users
                </CFormLabel>
                <CFormSelect
                  id="targetUsers"
                  name="targetUsers"
                  value={formData.targetUsers}
                  onChange={handleInputChange}
                >
                  {targetUserOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </CFormSelect>
              </div>
            </CCol>
          </CRow>

          {/* Date Range */}
          <CRow>
            <CCol md={6}>
              <div className="mb-3">
                <CFormLabel htmlFor="startDate" className="fw-semibold">
                  Start Date
                </CFormLabel>
                <CFormInput
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                />
              </div>
            </CCol>
            <CCol md={6}>
              <div className="mb-3">
                <CFormLabel htmlFor="endDate" className="fw-semibold">
                  End Date (Optional)
                </CFormLabel>
                <CFormInput
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  min={formData.startDate}
                />
                <div className="form-text">Leave empty for no expiration</div>
              </div>
            </CCol>
          </CRow>

          {/* Active Status */}
          <div className="mb-3">
            <CFormSwitch
              id="isActive"
              name="isActive"
              label="Active Announcement"
              checked={formData.isActive}
              onChange={handleInputChange}
            />
            <div className="form-text">Inactive announcements won't be shown to users</div>
          </div>

          {/* Preview Section */}
          <div className="mb-3">
            <CFormLabel className="fw-semibold">Preview</CFormLabel>
            <div
              className="p-3 border rounded"
              style={{
                color: formData.color,
                fontSize: formData.fontSize,
                fontWeight: 'bold',
                backgroundColor: '#f8f9fa',
                minHeight: '60px',
              }}
            >
              {preview || 'Announcement preview will appear here...'}
            </div>
          </div>

          {/* Template Section */}
          {!isEditMode && (
            <div className="mb-3">
              <CFormLabel className="fw-semibold">Quick Templates</CFormLabel>
              <div className="d-flex gap-2">
                <CButton
                  type="button"
                  color="outline-secondary"
                  onClick={() => loadDefaultTemplate(0)}
                >
                  Load Default Template
                </CButton>
              </div>
              <div className="form-text">Load a pre-designed template to get started quickly</div>
            </div>
          )}

          {/* Form Actions */}
          <CModalFooter className="px-0 pt-3">
            <CButton
              type="button"
              color="secondary"
              onClick={onClose}
              disabled={loading}
              variant="outline"
            >
              Cancel
            </CButton>
            <CButton type="submit" color="primary" disabled={loading}>
              {loading ? (
                <>
                  <CSpinner size="sm" />
                  <span className="ms-2">{isEditMode ? 'Updating...' : 'Creating...'}</span>
                </>
              ) : isEditMode ? (
                'Update Announcement'
              ) : (
                'Create Announcement'
              )}
            </CButton>
          </CModalFooter>
        </CForm>
      </CModalBody>
    </CModal>
  )
}

export default AnnouncementFormModal
