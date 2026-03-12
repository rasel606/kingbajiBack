import { useState, useCallback } from 'react';

/**
 * A custom hook to handle API requests, encapsulating loading and error states.
 * @param {Function} apiFunc - The API function to be called (e.g., from `src/services/api.js`).
 * @returns {Object} An object containing:
 *  - `data`: The response data from the API call.
 *  - `error`: The error message if the call fails.
 *  - `loading`: A boolean indicating if the request is in progress.
 *  - `request`: A function to trigger the API call. It accepts the same arguments as the original `apiFunc`.
 *  - `setError`: A function to manually set or clear the error state.
 */
export const useApi = (apiFunc) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const request = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFunc(...args);
      setData(response.data);
      return response.data; // Also return data for promise chaining or immediate use
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An unexpected error occurred.';
      setError(errorMessage);
      throw err; // Re-throw for the calling component to handle if needed
    } finally {
      setLoading(false);
    }
  }, [apiFunc]);

  return { data, error, loading, request, setError };
};