// import { useState, useCallback } from 'react';

// export const usePagination = (initialPage = 1, initialItemsPerPage = 10) => {
//   const [currentPage, setCurrentPage] = useState(initialPage);
//   const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

//   const handlePageChange = useCallback((newPage) => {
//     setCurrentPage(newPage);
//   }, []);

//   const handleItemsPerPageChange = useCallback((newItemsPerPage) => {
//     setItemsPerPage(newItemsPerPage);
//     setCurrentPage(1); // Reset to first page when items per page changes
//   }, []);

//   const resetPagination = useCallback(() => {
//     setCurrentPage(1);
//   }, []);

//   const getPaginationParams = useCallback((additionalParams = {}) => {
//     return {
//       page: currentPage,
//       limit: itemsPerPage,
//       ...additionalParams
//     };
//   }, [currentPage, itemsPerPage]);

//   const getSliceIndices = useCallback((totalItems) => {
//     const startIndex = (currentPage - 1) * itemsPerPage;
//     const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
//     return { startIndex, endIndex };
//   }, [currentPage, itemsPerPage]);

//   return {
//     currentPage,
//     itemsPerPage,
//     handlePageChange,
//     handleItemsPerPageChange,
//     resetPagination,
//     getPaginationParams,
//     getSliceIndices,
//   };
// };

// src/hooks/usePagination.js
import { useState, useCallback } from 'react'

export const usePagination = (initialPage = 1, initialItemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage)

  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(Math.max(1, newPage))
  }, [])

  const handleItemsPerPageChange = useCallback((newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1)
  }, [])

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => prev + 1)
  }, [])

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(1, prev - 1))
  }, [])

  const goToFirstPage = useCallback(() => {
    setCurrentPage(1)
  }, [])

  const goToLastPage = useCallback((totalPages) => {
    setCurrentPage(totalPages)
  }, [])

  const resetPagination = useCallback(() => {
    setCurrentPage(1)
  }, [])

  const getPaginationParams = useCallback(
    (additionalParams = {}) => {
      return {
        page: currentPage,
        limit: itemsPerPage,
        ...additionalParams,
      }
    },
    [currentPage, itemsPerPage],
  )

  const getSliceIndices = useCallback(
    (totalItems) => {
      const startIndex = (currentPage - 1) * itemsPerPage
      const endIndex = Math.min(startIndex + itemsPerPage, totalItems)
      return { startIndex, endIndex }
    },
    [currentPage, itemsPerPage],
  )

  const getVisiblePages = useCallback(
    (totalPages) => {
      const delta = 1
      const range = []
      const rangeWithDots = []
      let l

      for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
          range.push(i)
        }
      }

      range.forEach((i) => {
        if (l) {
          if (i - l === 2) {
            rangeWithDots.push(l + 1)
          } else if (i - l !== 1) {
            rangeWithDots.push('...')
          }
        }
        rangeWithDots.push(i)
        l = i
      })

      return rangeWithDots
    },
    [currentPage],
  )

  return {
    currentPage,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,
    resetPagination,
    getPaginationParams,
    getSliceIndices,
    getVisiblePages,
  }
}

export default usePagination
