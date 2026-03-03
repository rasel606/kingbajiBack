UpdateStatus = (transactionID, userId, status) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          message: `Deposit status updated successfully to ${status === 1 ? 'Approved' : 'Rejected'}`
        }
      })
    }, 500)
  })
}

export default UpdateStatus