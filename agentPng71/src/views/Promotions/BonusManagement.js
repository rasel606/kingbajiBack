import React, { useState, useEffect } from "react";
import {
  CCard,
  CCardHeader,
  CCardBody,
  CButton,
  CSpinner,
  CAlert,
} from "@coreui/react";
import DataTable from "../base/DataTable/DataTable";
import { bonusTableConfig } from "../base/tableConfig/bonusTableConfig";
import BonusFormModal from "../base/Modal/BonusFormModal";
import { adminServices } from "../../service/adminServices";

const BonusManagement = () => {
  const [bonuses, setBonuses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedBonus, setSelectedBonus] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchBonuses = async () => {
    setLoading(true);
    try {
      const data = await adminServices.getBonuses();
      setBonuses(data);
    } catch (err) {
      setError("Failed to load bonuses.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await adminServices.getCategoriesWithProvidersAndGames();
      setCategories(data);
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  };

  const handleSave = async (bonusData) => {
    try {
      if (bonusData._id) {
        await adminServices.updateBonus(bonusData._id, bonusData);
      } else {
        await adminServices.createBonus(bonusData);
      }
      fetchBonuses();
      setShowModal(false);
    } catch (err) {
      setError("Failed to save bonus.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this bonus?")) return;
    try {
      await adminServices.deleteBonus(id);
      fetchBonuses();
    } catch (err) {
      setError("Failed to delete bonus.");
    }
  };

  useEffect(() => {
    fetchBonuses();
    fetchCategories();
  }, []);

  return (
    <>
      <CCard>
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Bonus Management</h5>
          <CButton
            color="primary"
            onClick={() => {
              setSelectedBonus(null);
              setShowModal(true);
            }}
          >
            + Add Bonus
          </CButton>
        </CCardHeader>
        <CCardBody>
          {error && <CAlert color="danger">{error}</CAlert>}
          {loading ? (
            <div className="text-center py-5">
              <CSpinner color="primary" />
              <p>Loading bonuses...</p>
            </div>
          ) : (
            <DataTable
              data={bonuses}
              config={bonusTableConfig({
                onEdit: (bonus) => {
                  setSelectedBonus(bonus);
                  setShowModal(true);
                },
                onDelete: handleDelete,
              })}
            />
          )}
        </CCardBody>
      </CCard>

      {showModal && (
        <BonusFormModal
          show={showModal}
          bonus={selectedBonus}
          cetegorys={categories}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default BonusManagement;
















// import React, { useState, useEffect } from "react";
// import {
//   CCard,
//   CCardHeader,
//   CCardBody,
//   CButton,
//   CSpinner,
//   CAlert,
// } from "@coreui/react";
// import DataTable from "../base/DataTable/DataTable";
// import { bonusTableConfig } from "../base/tableConfig/bonusTableConfig";
// import BonusFormModal from "../base/Modal/BonusFormModal";
// import { adminServices } from "../../service/adminServices";

// const BonusManagement = () => {
//   const [bonuses, setBonuses] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [selectedBonus, setSelectedBonus] = useState(null);
//   const [showModal, setShowModal] = useState(false);

//   const fetchBonuses = async () => {
//     setLoading(true);
//     try {
//       const data = await adminServices.getBonuses();
//       setBonuses(data);
//     } catch (err) {
//       setError("Failed to load bonuses.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSave = async (bonusData) => {
//     try {
//       if (bonusData._id) {
//         console.log(bonusData._id);
//         await adminServices.updateBonus(bonusData._id, bonusData);
//       } else {
//         await adminServices.createBonus(bonusData);
//       }
//       fetchBonuses();
//       setShowModal(false);
//     } catch (err) {
//       setError("Failed to save bonus.");
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this bonus?")) return;
//     try {
//       await adminServices.deleteBonus(id);
//       fetchBonuses();
//     } catch (err) {
//       setError("Failed to delete bonus.");
//     }
//   };

//   useEffect(() => {
//     fetchBonuses();
//   }, []);

//   return (
//     <>
//       <CCard>
//         <CCardHeader className="d-flex justify-content-between align-items-center">
//           <h5 className="mb-0">Bonus Management</h5>
//           <CButton
//             color="primary"
//             onClick={() => {
//               setSelectedBonus(null);
//               setShowModal(true);
//             }}
//           >
//             + Add Bonus
//           </CButton>
//         </CCardHeader>
//         <CCardBody>
//           {error && <CAlert color="danger">{error}</CAlert>}
//           {loading ? (
//             <div className="text-center py-5">
//               <CSpinner color="primary" />
//               <p>Loading bonuses...</p>
//             </div>
//           ) : (
//             <DataTable
//               data={bonuses}
//               config={bonusTableConfig({
//                 onEdit: (bonus) => {
//                   setSelectedBonus(bonus);
//                   setShowModal(true);
//                 },
//                 onDelete: handleDelete,
//               })}
//             />
//           )}
//         </CCardBody>
//       </CCard>

//       {showModal && (
//         <BonusFormModal
//           show={showModal}
//           bonus={selectedBonus}
//           onClose={() => setShowModal(false)}
//           onSave={handleSave}
//         />
//       )}
//     </>
//   );
// };

// export default BonusManagement;
