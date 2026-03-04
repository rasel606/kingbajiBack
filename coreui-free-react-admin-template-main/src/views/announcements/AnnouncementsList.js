import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CButton,
  CBadge,
  CFormSwitch,
  CSpinner,
  CModal,
  CModalBody,
  CModalHeader,
  CModalFooter,
  CAlert,
  CPagination,
  CPaginationItem,
  CRow,
  CCol,
} from '@coreui/react'
import { FaEdit, FaTrash, FaEye, FaPlus } from 'react-icons/fa'
import announcementService from '../../service/announcementService'
import AnnouncementFormModal from '../base/Modal/AnnouncementFormModal'

const AnnouncementsList = ({ token }) => {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetchAnnouncements()
  }, [currentPage])

  const fetchAnnouncements = async () => {
    try {
      setLoading(true)
      const response = await announcementService.getAllAnnouncements(token)
      if (response.success) {
        setAnnouncements(response.data)
        setTotalPages(Math.ceil(response.data.length / itemsPerPage))
      }
    } catch (err) {
      setError('Failed to load announcements')
      console.error('Error fetching announcements:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedAnnouncement(null)
    setShowCreateModal(true)
  }

  const handleEdit = (announcement) => {
    setSelectedAnnouncement(announcement)
    setShowEditModal(true)
  }

  const handleDelete = (announcement) => {
    setSelectedAnnouncement(announcement)
    setShowDeleteModal(true)
  }

  const handleView = (announcement) => {
    setSelectedAnnouncement(announcement)
    setShowViewModal(true)
  }

  const handleToggleStatus = async (id) => {
    try {
      console.log('Toggling status for announcement ID:', id)
      const response = await announcementService.toggleAnnouncementStatus(id)
      console.log('Toggle Status Response in Component:', response)
      setMessage({
        type: 'success',
        text: 'Status updated successfully',
      })
      fetchAnnouncements()
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (err) {
      setMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to update status',
      })
    }
  }

  const confirmDelete = async () => {
    try {
      await announcementService.deleteAnnouncement(selectedAnnouncement._id)
      setMessage({
        type: 'success',
        text: 'Announcement deleted successfully',
      })
      setShowDeleteModal(false)
      fetchAnnouncements()
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (err) {
      setMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to delete announcement',
      })
    }
  }

  const handleSaveSuccess = () => {
    fetchAnnouncements()
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <CBadge color="success">Active</CBadge>
    ) : (
      <CBadge color="secondary">Inactive</CBadge>
    )
  }

  const getTargetUsersBadge = (targetUsers) => {
    const colors = {
      all: 'primary',
      user: 'info',
      affiliate: 'warning',
      subagent: 'success',
      agent: 'danger',
      subadmin: 'dark',
      admin: 'secondary',
    }
    return (
      <CBadge color={colors[targetUsers] || 'primary'}>
        {targetUsers.charAt(0).toUpperCase() + targetUsers.slice(1)}
      </CBadge>
    )
  }

  // Pagination logic
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentAnnouncements = announcements.slice(startIndex, endIndex)

  if (loading) {
    return (
      <div className="text-center my-5">
        <CSpinner color="primary" />
        <p className="mt-2">Loading announcements...</p>
      </div>
    )
  }

  return (
    <>
      <CCard>
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Announcements Management</h5>
          <CButton color="primary" onClick={handleCreate}>
            <FaPlus className="me-2" />
            Create Announcement
          </CButton>
        </CCardHeader>
        <CCardBody>
          {message.text && (
            <CAlert color={message.type} className="mb-3">
              {message.text}
            </CAlert>
          )}

          {error && (
            <CAlert color="danger" className="mb-3">
              {error}
            </CAlert>
          )}

          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>#</CTableHeaderCell>
                <CTableHeaderCell>Content Preview</CTableHeaderCell>
                <CTableHeaderCell>Target Users</CTableHeaderCell>
                <CTableHeaderCell>Status</CTableHeaderCell>
                <CTableHeaderCell>Priority</CTableHeaderCell>
                <CTableHeaderCell>Created</CTableHeaderCell>
                <CTableHeaderCell>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {currentAnnouncements.length === 0 ? (
                <CTableRow>
                  <CTableDataCell colSpan="7" className="text-center">
                    No announcements found
                  </CTableDataCell>
                </CTableRow>
              ) : (
                currentAnnouncements.map((announcement, index) => (
                  <CTableRow key={announcement._id}>
                    <CTableDataCell>{startIndex + index + 1}</CTableDataCell>
                    <CTableDataCell>
                      <div
                        style={{
                          maxWidth: '300px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          color: announcement.color,
                          fontWeight: 'bold',
                        }}
                      >
                        {announcement.content.substring(0, 50)}...
                      </div>
                    </CTableDataCell>
                    <CTableDataCell>{getTargetUsersBadge(announcement.targetUsers)}</CTableDataCell>
                    <CTableDataCell>
                      <div className="d-flex align-items-center">
                        <CFormSwitch
                          checked={announcement.isActive}
                          onChange={() => handleToggleStatus(announcement._id)}
                          className="me-2"
                        />
                        {getStatusBadge(announcement.isActive)}
                      </div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color="info">{announcement.priority}</CBadge>
                    </CTableDataCell>
                    <CTableDataCell>{formatDate(announcement.createdAt)}</CTableDataCell>
                    <CTableDataCell>
                      <div className="d-flex gap-2">
                        <CButton
                          color="info"
                          size="sm"
                          onClick={() => handleView(announcement)}
                          title="View"
                        >
                          <FaEye />
                        </CButton>
                        <CButton
                          color="warning"
                          size="sm"
                          onClick={() => handleEdit(announcement)}
                          title="Edit"
                        >
                          <FaEdit />
                        </CButton>
                        <CButton
                          color="danger"
                          size="sm"
                          onClick={() => handleDelete(announcement)}
                          title="Delete"
                        >
                          <FaTrash />
                        </CButton>
                      </div>
                    </CTableDataCell>
                  </CTableRow>
                ))
              )}
            </CTableBody>
          </CTable>

          {/* Pagination */}
          {totalPages > 1 && (
            <CPagination className="mt-3 justify-content-center">
              <CPaginationItem
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              >
                Previous
              </CPaginationItem>

              {[...Array(totalPages).keys()].map((page) => (
                <CPaginationItem
                  key={page + 1}
                  active={currentPage === page + 1}
                  onClick={() => setCurrentPage(page + 1)}
                >
                  {page + 1}
                </CPaginationItem>
              ))}

              <CPaginationItem
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              >
                Next
              </CPaginationItem>
            </CPagination>
          )}
        </CCardBody>
      </CCard>

      {/* Create Modal */}
      <AnnouncementFormModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleSaveSuccess}
        token={token}
      />

      {/* Edit Modal */}
      {selectedAnnouncement && (
        <AnnouncementFormModal
          show={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveSuccess}
          announcement={selectedAnnouncement}
          token={token}
        />
      )}

      {/* Delete Confirmation Modal */}
      <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <CModalHeader closeButton>Confirm Delete</CModalHeader>
        <CModalBody>
          Are you sure you want to delete this announcement?
          {selectedAnnouncement && (
            <div className="mt-3 p-3 border rounded" style={{ color: selectedAnnouncement.color }}>
              {selectedAnnouncement.content.substring(0, 100)}...
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </CButton>
          <CButton color="danger" onClick={confirmDelete}>
            Delete
          </CButton>
        </CModalFooter>
      </CModal>

      {/* View Modal */}
      <CModal size="lg" visible={showViewModal} onClose={() => setShowViewModal(false)}>
        <CModalHeader closeButton>View Announcement</CModalHeader>
        <CModalBody>
          {selectedAnnouncement && (
            <>
              <div className="mb-3">
                <strong>Content:</strong>
                <div
                  className="p-3 border rounded mt-2"
                  style={{
                    color: selectedAnnouncement.color,
                    fontSize: selectedAnnouncement.fontSize,
                    fontWeight: 'bold',
                    backgroundColor: '#f8f9fa',
                  }}
                >
                  {selectedAnnouncement.content}
                </div>
              </div>

              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <strong>Status:</strong>
                    <div className="mt-1">{getStatusBadge(selectedAnnouncement.isActive)}</div>
                  </div>
                </CCol>
                <CCol md={6}>
                  <div className="mb-3">
                    <strong>Target Users:</strong>
                    <div className="mt-1">
                      {getTargetUsersBadge(selectedAnnouncement.targetUsers)}
                    </div>
                  </div>
                </CCol>
              </CRow>

              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <strong>Priority:</strong>
                    <div className="mt-1">
                      <CBadge color="info">{selectedAnnouncement.priority}</CBadge>
                    </div>
                  </div>
                </CCol>
                <CCol md={6}>
                  <div className="mb-3">
                    <strong>Color:</strong>
                    <div className="mt-1 d-flex align-items-center">
                      <div
                        className="me-2"
                        style={{
                          width: '20px',
                          height: '20px',
                          backgroundColor: selectedAnnouncement.color,
                          border: '1px solid #ccc',
                        }}
                      />
                      {selectedAnnouncement.color}
                    </div>
                  </div>
                </CCol>
              </CRow>

              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <strong>Font Size:</strong>
                    <div className="mt-1">{selectedAnnouncement.fontSize}</div>
                  </div>
                </CCol>
                <CCol md={6}>
                  <div className="mb-3">
                    <strong>Icon URL:</strong>
                    <div className="mt-1">
                      <a href={selectedAnnouncement.icon} target="_blank" rel="noopener noreferrer">
                        View Icon
                      </a>
                    </div>
                  </div>
                </CCol>
              </CRow>

              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <strong>Start Date:</strong>
                    <div className="mt-1">{formatDate(selectedAnnouncement.startDate)}</div>
                  </div>
                </CCol>
                <CCol md={6}>
                  <div className="mb-3">
                    <strong>End Date:</strong>
                    <div className="mt-1">
                      {selectedAnnouncement.endDate
                        ? formatDate(selectedAnnouncement.endDate)
                        : 'No end date'}
                    </div>
                  </div>
                </CCol>
              </CRow>

              <div className="mb-3">
                <strong>Created At:</strong>
                <div className="mt-1">{formatDate(selectedAnnouncement.createdAt)}</div>
              </div>

              {selectedAnnouncement.updatedAt && (
                <div className="mb-3">
                  <strong>Last Updated:</strong>
                  <div className="mt-1">{formatDate(selectedAnnouncement.updatedAt)}</div>
                </div>
              )}
            </>
          )}
        </CModalBody>
      </CModal>
    </>
  )
}

export default AnnouncementsList
