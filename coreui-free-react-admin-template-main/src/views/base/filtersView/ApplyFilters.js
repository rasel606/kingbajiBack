// utils/filterUtils.js
export default (data, filters) => {
  return data.filter((item) => {
    return Object.entries(filters).every(([key, value]) => {
      if (value === '' || value === null || value === undefined) return true

      if (key.toLowerCase().includes('date')) {
        const date = new Date(item.datetime)
        if (key === 'startDate') return date >= new Date(value)
        if (key === 'endDate') {
          const endDate = new Date(value)
          endDate.setHours(23, 59, 59, 999)
          return date <= endDate
        }
      }

      if (typeof item[key] === 'number') {
        return item[key] === parseInt(value)
      }

      if (typeof item[key] === 'string') {
        return item[key].toLowerCase().includes(String(value).toLowerCase())
      }

      return true
    })
  })
}
