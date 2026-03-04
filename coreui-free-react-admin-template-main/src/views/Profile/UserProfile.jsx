import React, { useEffect, useState } from 'react'
import axios from 'axios'

const UserProfile = () => {
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    axios
      .get('http://localhost:3001/api/affiliate/Auth/me')
      .then((res) => setProfile(res.data))
      .catch(() => setError('Failed to load profile'))
  }, [])

  if (error) return <div>{error}</div>
  if (!profile) return <div>Loading...</div>

  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      <div>Username: {profile.username}</div>
      <div>Email: {profile.email}</div>
      {/* Add more fields as needed */}
    </div>
  )
}

export default UserProfile
