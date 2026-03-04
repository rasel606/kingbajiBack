import { useState, useCallback } from 'react';

export default (initialPage = 1, initialItemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
  }, []);

  const handleItemsPerPageChange = useCallback((newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  }, []);

  const resetPagination = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const getPaginationParams = useCallback((additionalParams = {}) => {
    return {
      page: currentPage,
      limit: itemsPerPage,
      ...additionalParams
    };
  }, [currentPage, itemsPerPage]);

  const getSliceIndices = useCallback((totalItems) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    return { startIndex, endIndex };
  }, [currentPage, itemsPerPage]);

  return {
    currentPage,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,
    resetPagination,
    getPaginationParams,
    getSliceIndices,
  };
};