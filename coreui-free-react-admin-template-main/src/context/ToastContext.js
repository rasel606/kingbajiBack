import React, { createContext, useContext, useState, useCallback } from 'react'
import { CToaster, CToast, CToastHeader, CToastBody } from '@coreui/react'

const ToastContext = createContext()

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, color = 'success') => {
    setToasts((prev) => [...prev, { id: Date.now(), message, color }])
  }, [])

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* ✅ Global Toaster */}
      <CToaster placement="top-end">
        {toasts.map((toast) => (
          <CToast
            key={toast.id}
            autohide
            visible
            color={toast.color}
            className="text-white"
            onClose={() => removeToast(toast.id)}
          >
            <CToastHeader closeButton>
              {toast.color === 'success'
                ? '✅ Success'
                : toast.color === 'danger'
                  ? '⚠️ Error'
                  : 'ℹ️ Info'}
            </CToastHeader>
            <CToastBody>{toast.message}</CToastBody>
          </CToast>
        ))}
      </CToaster>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
