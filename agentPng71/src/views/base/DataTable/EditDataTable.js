// DataTable.js (updated)
import React, { useState } from "react";
import {
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from "@coreui/react";

const EditDataTable = ({ data, config, onStatusUpdate, onEdit }) => {
  const [selectedRow, setSelectedRow] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleActionClick = (row, actionType) => {
    if (actionType === "view") {
      setSelectedRow(row);
      setShowDetailModal(true);
    } else if (actionType === "edit") {
      onEdit(row);
    } else if (actionType === "status") {
      onStatusUpdate(row);
    }
  };

  return (
    <>
      <div className="table-responsive">
        <CTable hover>
          <CTableHead>
            <CTableRow>
              {config.map((col, idx) => (
                <CTableHeaderCell key={col.key || idx}>{col.label}</CTableHeaderCell>
              ))}
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {data.map((row, index) => (
              <CTableRow key={row.transactionID || index}>
                {config.map((col, idx) => {
                  let value = col.key === "index" ? index + 1 : row[col.key];
                  
                  // Handle action buttons
                  if (col.key === "actions") {
                    return (
                      <CTableDataCell key={col.key || idx} className={col.className || ""}>
                        <CButton 
                          color="info" 
                          size="sm" 
                          className="me-2"
                          onClick={() => handleActionClick(row, "view")}
                        >
                          View Details
                        </CButton>
                        <CButton 
                          color="primary" 
                          size="sm"
                          onClick={() => handleActionClick(row, "edit")}
                        >
                          Edit
                        </CButton>
                      </CTableDataCell>
                    );
                  }
                  
                  // Handle status button
                  if (col.key === "status") {
                    return (
                      <CTableDataCell key={col.key || idx} className={col.className || ""}>
                        <CButton 
                          color={value === 1 ? "success" : "warning"} 
                          size="sm"
                          onClick={() => handleActionClick(row, "status")}
                        >
                          {value === 1 ? "Completed" : "Pending"}
                        </CButton>
                      </CTableDataCell>
                    );
                  }
                  
                  // Regular cell rendering
                  return (
                    <CTableDataCell key={col.key || idx} className={col.className || ""}>
                      {col.render ? col.render(value, row) : value}
                    </CTableDataCell>
                  );
                })}
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </div>

      {selectedRow && (
        <DetailModal
          show={showDetailModal}
          onHide={() => setShowDetailModal(false)}
          data={selectedRow}
          onStatusUpdate={onStatusUpdate}
          onEdit={onEdit}
        />
      )}
    </>
  );
};

export default EditDataTable;