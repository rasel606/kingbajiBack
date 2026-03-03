// import { useState, useCallback } from "react";

// const useFilters = (initialConfig, initialDataFetcher) => {
//   const [filters, setFilters] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [results, setResults] = useState([]);
//   const [total, setTotal] = useState(0);

//   const resetFilters = useCallback(() => setFilters({}), []);

//   const fetchData = useCallback(async () => {
//     if (!initialDataFetcher) return;

//     setLoading(true);
//     try {
//       const response = await initialDataFetcher(filters);
//       setResults(response.data.transactions || []);
//       setTotal(response.data.total?.total || 0);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     } finally {
//       setLoading(false);
//     }
//   }, [filters, initialDataFetcher]);

//   return {
//     filters,
//     setFilters,
//     resetFilters,
//     fetchData,
//     results,
//     total,
//     loading,
//   };
// };

// export default useFilters;

import { useState, useCallback } from 'react'

const useFilters = (initialConfig, initialDataFetcher) => {
  const [filters, setFilters] = useState({})
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [total, setTotal] = useState(0)

  const resetFilters = useCallback(() => setFilters({}), [])

  const fetchData = useCallback(async () => {
    if (!initialDataFetcher) return
    setLoading(true)
    try {
      const response = await initialDataFetcher(filters)
      setResults(response.data.transactions || [])
      setTotal(response.data.total?.total || 0)
    } finally {
      setLoading(false)
    }
  }, [filters, initialDataFetcher])

  return { filters, setFilters, resetFilters, fetchData, results, total, loading }
}

export default useFilters
