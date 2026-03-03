import React, { useEffect, useState } from 'react'
import { CCard, CCardHeader, CCardBody, CButton, CFormInput, CSpinner } from '@coreui/react'
import DataTable from '../base/DataTable/DataTable'
import axios from 'axios'

const SocialLinksPage = () => {
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [editRow, setEditRow] = useState(null)
  const [saving, setSaving] = useState(false)

  // Fetch links on mount
  useEffect(() => {
    fetchLinks()
  }, [])

  const fetchLinks = async () => {
    try {
      setLoading(true)
      const res = await axios.get('/api/social-links')
      setLinks(res.data.data || [])
    } catch (error) {
      console.error('Error fetching social links:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (row) => {
    setEditRow({ ...row }) // make editable copy
  }

  const handleChange = (key, value) => {
    setEditRow((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await axios.post('/api/social-links', editRow)
      await fetchLinks()
      setEditRow(null)
    } catch (error) {
      console.error('Error saving social link:', error)
    } finally {
      setSaving(false)
    }
  }

  const tableConfig = [
    { key: 'index', label: '#' },
    {
      key: 'telegram',
      label: 'Telegram',
      render: (value, row) =>
        editRow?.user === row.user ? (
          <CFormInput
            size="sm"
            value={editRow.telegram || ''}
            onChange={(e) => handleChange('telegram', e.target.value)}
          />
        ) : (
          value || '-'
        ),
    },
    {
      key: 'facebook',
      label: 'Facebook',
      render: (value, row) =>
        editRow?.user === row.user ? (
          <CFormInput
            size="sm"
            value={editRow.facebook || ''}
            onChange={(e) => handleChange('facebook', e.target.value)}
          />
        ) : (
          value || '-'
        ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (value, row) =>
        editRow?.user === row.user ? (
          <CFormInput
            size="sm"
            value={editRow.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
          />
        ) : (
          value || '-'
        ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) =>
        editRow?.user === row.user ? (
          <>
            <CButton
              size="sm"
              color="success"
              className="me-2"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <CSpinner size="sm" /> : 'Save'}
            </CButton>
            <CButton size="sm" color="secondary" onClick={() => setEditRow(null)}>
              Cancel
            </CButton>
          </>
        ) : (
          <CButton size="sm" color="primary" onClick={() => handleEdit(row)}>
            Edit
          </CButton>
        ),
    },
  ]

  return (
    <CCard>
      <CCardHeader>Social Links</CCardHeader>
      <CCardBody>
        {loading ? (
          <div className="text-center">
            <CSpinner />
          </div>
        ) : (
          <DataTable data={links} config={tableConfig} />
        )}
      </CCardBody>
    </CCard>
  )
}

export default SocialLinksPage
