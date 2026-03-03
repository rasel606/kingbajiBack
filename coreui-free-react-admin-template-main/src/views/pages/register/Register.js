// import React, { useState } from 'react'
// import {
//   CButton,
//   CCard,
//   CCardBody,
//   CCol,
//   CContainer,
//   CForm,
//   CFormInput,
//   CInputGroup,
//   CInputGroupText,
//   CRow,
//   CAlert,
//   CSpinner
// } from '@coreui/react'
// import CIcon from '@coreui/icons-react'
// import { cilLockLocked, cilUser } from '@coreui/icons'
// import { useAuth } from '../../../context/AuthContext'
// import { Link, useNavigate } from 'react-router-dom'

// const Register = () => {
//   const { register } = useAuth()
//   const navigate = useNavigate()

//   const [step, setStep] = useState(1)
//   const [formData, setFormData] = useState({
//     userId: '',
//     password: '',
//     confirmPassword: '',
//     currencyType: '8',
//     firstName: '',
//     lastName: '',
//     dateOfBirth: '',
//     callingCode: '880',
//     phoneNumber: '',
//     email: '',
//     contactType: '',
//     contactTypeValue: '',
//     referralCode: '',
//     captcha: ''
//   })
//   const [errors, setErrors] = useState({})
//   const [isLoading, setIsLoading] = useState(false)
//   const [captchaSrc, setCaptchaSrc] = useState('/captcha/af')

//   const handleChange = (e) => {
//     const { name, value } = e.target
//     setFormData(prev => ({ ...prev, [name]: value }))
//     if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
//   }

//   const refreshCaptcha = () => {
//     setCaptchaSrc(`/captcha/af?${Math.random()}`)
//   }

//   const validateStep = (stepNumber) => {
//     const newErrors = {}

//     if (stepNumber === 1) {
//       if (!formData.userId.trim()) newErrors.userId = 'Username is required'
//       else if (formData.userId.length < 3) newErrors.userId = 'Username must be at least 3 characters'

//       if (!formData.password) newErrors.password = 'Password is required'
//       else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'

//       if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password'
//       else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
//     }

//     if (stepNumber === 2) {
//       if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
//       if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'

//       if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required'
//       else {
//         const dob = new Date(formData.dateOfBirth)
//         const today = new Date()
//         const minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate())
//         const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())

//         if (dob > maxDate) newErrors.dateOfBirth = 'You must be at least 18 years old'
//         if (dob < minDate) newErrors.dateOfBirth = 'Please enter a valid date of birth'
//       }
//     }

//     if (stepNumber === 3) {
//       if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required'
//       if (!formData.email.trim()) newErrors.email = 'Email is required'
//       else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email address'
//       if (!formData.captcha) newErrors.captcha = 'Verification code is required'
//     }

//     setErrors(newErrors)
//     return Object.keys(newErrors).length === 0
//   }

//   const handleNext = () => {
//     if (validateStep(step)) setStep(step + 1)
//   }

//   const handlePrevious = () => setStep(step - 1)

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     if (!validateStep(3)) return

//     setIsLoading(true)
//     try {
//       await register(formData)
//       navigate('/login') // redirect after success
//     } catch (error) {
//       setErrors({ submit: error.message })
//       refreshCaptcha()
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
//       <CContainer>
//         <CRow className="justify-content-center">
//           <CCol md={8}>
//             <CCard className="p-4">
//               <CCardBody>
//                 <CForm onSubmit={handleSubmit}>
//                   <h1>Register</h1>
//                   <p className="text-body-secondary">Create your account</p>

//                   {errors.submit && <CAlert color="danger">{errors.submit}</CAlert>}

//                   {step === 1 && (
//                     <>
//                       <CInputGroup className="mb-3">
//                         <CInputGroupText><CIcon icon={cilUser} /></CInputGroupText>
//                         <CFormInput
//                           placeholder="Username"
//                           name="userId"
//                           value={formData.userId}
//                           onChange={handleChange}
//                         />
//                       </CInputGroup>
//                       <CInputGroup className="mb-3">
//                         <CInputGroupText><CIcon icon={cilLockLocked} /></CInputGroupText>
//                         <CFormInput
//                           type="password"
//                           placeholder="Password"
//                           name="password"
//                           value={formData.password}
//                           onChange={handleChange}
//                         />
//                       </CInputGroup>
//                       <CInputGroup className="mb-3">
//                         <CInputGroupText><CIcon icon={cilLockLocked} /></CInputGroupText>
//                         <CFormInput
//                           type="password"
//                           placeholder="Confirm Password"
//                           name="confirmPassword"
//                           value={formData.confirmPassword}
//                           onChange={handleChange}
//                         />
//                       </CInputGroup>
//                       <CButton color="primary" onClick={handleNext}>Next</CButton>
//                     </>
//                   )}

//                   {step === 2 && (
//                     <>

//                       <CFormInput
//                         className="mb-3"
//                         placeholder="Currency Type"
//                         name="currencyType"
//                         value={formData.currencyType}
//                         onChange={handleChange}
//                       />
//                       <CFormInput
//                         className="mb-3"
//                         placeholder="First Name"
//                         name="firstName"
//                         value={formData.firstName}
//                         onChange={handleChange}
//                       />
//                       <CFormInput
//                         className="mb-3"
//                         placeholder="Last Name"
//                         name="lastName"
//                         value={formData.lastName}
//                         onChange={handleChange}
//                       />
//                       <CFormInput
//                         className="mb-3"
//                         type="date"
//                         name="dateOfBirth"
//                         value={formData.dateOfBirth}
//                         onChange={handleChange}
//                       />
//                       <CRow>
//                         <CCol xs={6}><CButton color="secondary" onClick={handlePrevious}>Back</CButton></CCol>
//                         <CCol xs={6} className="text-right"><CButton color="primary" onClick={handleNext}>Next</CButton></CCol>
//                       </CRow>
//                     </>
//                   )}

//                   {step === 3 && (
//                     <>
//                       <CFormInput
//                         className="mb-3"
//                         placeholder="Phone Number"
//                         name="phoneNumber"
//                         value={formData.phoneNumber}
//                         onChange={handleChange}
//                       />
//                       <CFormInput
//                         className="mb-3"
//                         placeholder="Email"
//                         name="email"
//                         value={formData.email}
//                         onChange={handleChange}
//                       />
//                       <img src={captchaSrc} alt="captcha" className="mb-3" />
//                       <CFormInput
//                         className="mb-3"
//                         placeholder="Enter Captcha"
//                         name="captcha"
//                         value={formData.captcha}
//                         onChange={handleChange}
//                       />
//                       <CRow>
//                         <CCol xs={6}><CButton color="secondary" onClick={handlePrevious}>Back</CButton></CCol>
//                         <CCol xs={6} className="text-right">
//                           <CButton color="primary" type="submit" disabled={isLoading}>
//                             {isLoading ? <CSpinner size="sm" /> : 'Register'}
//                           </CButton>
//                         </CCol>
//                       </CRow>
//                     </>
//                   )}
//                 </CForm>
//                 <CCardBody className="text-center">
//                   <div>
//                     <h2>Sign up</h2>
//                     <p>
//                       Already have an account . Please login.
//                     </p>
//                     <Link to="/register">
//                       <CButton color="primary" className="mt-3" active tabIndex={-1}>
//                         Sign up
//                       </CButton>
//                     </Link>
//                   </div>
//                 </CCardBody>
//               </CCardBody>
//             </CCard>

//           </CCol>
//         </CRow>
//       </CContainer>
//     </div>
//   )
// }

// export default Register

// // <CForm>
// //                   <h1>Register</h1>
// //                   <p className="text-body-secondary">Create your account</p>
// //                   <CInputGroup className="mb-3">
// //                     <CInputGroupText>
// //                       <CIcon icon={cilUser} />
// //                     </CInputGroupText>
// //                     <CFormInput placeholder="Username" autoComplete="username" />
// //                   </CInputGroup>
// //                   <CInputGroup className="mb-3">
// //                     <CInputGroupText>@</CInputGroupText>
// //                     <CFormInput placeholder="Email" autoComplete="email" />
// //                   </CInputGroup>
// //                   <CInputGroup className="mb-3">
// //                     <CInputGroupText>
// //                       <CIcon icon={cilLockLocked} />
// //                     </CInputGroupText>
// //                     <CFormInput
// //                       type="password"
// //                       placeholder="Password"
// //                       autoComplete="new-password"
// //                     />
// //                   </CInputGroup>
// //                   <CInputGroup className="mb-4">
// //                     <CInputGroupText>
// //                       <CIcon icon={cilLockLocked} />
// //                     </CInputGroupText>
// //                     <CFormInput
// //                       type="password"
// //                       placeholder="Repeat password"
// //                       autoComplete="new-password"
// //                     />
// //                   </CInputGroup>
// //                   <div className="d-grid">
// //                     <CButton color="success">Create Account</CButton>
// //                   </div>
// //                 </CForm>
