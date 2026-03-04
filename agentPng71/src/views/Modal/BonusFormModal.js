// import React, { useState, useEffect, useMemo } from "react";
// import {
//   CModal,
//   CModalHeader,
//   CModalTitle,
//   CModalBody,
//   CModalFooter,
//   CForm,
//   CFormInput,
//   CFormSelect,
//   CFormTextarea,
//   CFormSwitch,
//   CButton,
//   CRow,
//   CCol,
//   CFormCheck,
//   CCollapse,
// } from "@coreui/react";

// const bonusTypes = [
//   "deposit",
//   "dailyRebate",
//   "weeklyBonus",
//   "vip",
//   "referral",
//   "referralRebate",
//   "signup",
//   "birthday",
//   "other",
// ];

// const VIP_LEVELS = ["bronze", "silver", "gold", "diamond", "elite"];

// const BonusFormModal = ({ show, onClose, onSave, bonus, cetegorys = [] }) => {
//   const [form, setForm] = useState({
//     name: "",
//     description: "",
//     bonusType: "",
//     percentage: "",
//     fixedAmount: "",
//     minDeposit: "",
//     maxBonus: "",
//     minTurnover: "",
//     maxTurnover: "",
//     wageringRequirement: 1,
//     validDays: "",
//     eligibleGames: [],
//     isActive: true,
//     startDate: "",
//     endDate: "",
//     level1Percent: "",
//     level2Percent: "",
//     level3Percent: "",
//     // VIP levels
//     bronze: { monthlyTurnoverRequirement: "", vpConversionRate: "", loyaltyBonus: "" },
//     silver: { monthlyTurnoverRequirement: "", vpConversionRate: "", loyaltyBonus: "" },
//     gold: { monthlyTurnoverRequirement: "", vpConversionRate: "", loyaltyBonus: "" },
//     diamond: { monthlyTurnoverRequirement: "", vpConversionRate: "", loyaltyBonus: "" },
//     elite: { monthlyTurnoverRequirement: "", vpConversionRate: "", loyaltyBonus: "" },
//   });

//   const [expandedCategories, setExpandedCategories] = useState([]);
//   const [searchQuery, setSearchQuery] = useState("");

//   useEffect(() => {
//     if (bonus) setForm((prev) => ({ ...prev, ...bonus }));
//   }, [bonus]);

//   const handleChange = (key, value) => {
//     setForm((prev) => ({ ...prev, [key]: value }));
//   };

//   /** 🔎 Filter categories & providers */
//   const filteredCategories = useMemo(() => {
//     if (!searchQuery) return cetegorys;
//     const lowerQuery = searchQuery.toLowerCase();
//     return cetegorys
//       .map((category) => {
//         const filteredProviders = category.gamelist.filter((provider) =>
//           provider.name.toLowerCase().includes(lowerQuery)
//         );
//         if (
//           category.category_name.toLowerCase().includes(lowerQuery) ||
//           filteredProviders.length > 0
//         ) {
//           return { ...category, gamelist: filteredProviders };
//         }
//         return null;
//       })
//       .filter(Boolean);
//   }, [searchQuery, cetegorys]);

//   /** ✅ Select/Deselect all */
//   const handleSelectAll = (selectAll) => {
//     let newEligibleGames = [];
//     if (selectAll) {
//       cetegorys.forEach((category) => {
//         newEligibleGames.push(category.category_code);
//         category.gamelist.forEach((provider) => newEligibleGames.push(provider.p_code));
//       });
//     }
//     setForm((prev) => ({ ...prev, eligibleGames: newEligibleGames }));
//   };

//   /** ✅ Toggle Category */
//   const handleCategoryToggle = (category) => {
//     let newEligibleGames = [...form.eligibleGames];
//     const isSelected = newEligibleGames.includes(category.category_code);
//     if (isSelected) {
//       newEligibleGames = newEligibleGames.filter(
//         (code) =>
//           code !== category.category_code &&
//           !category.gamelist.some((g) => g.p_code === code)
//       );
//     } else {
//       newEligibleGames.push(category.category_code);
//       category.gamelist.forEach((g) => {
//         if (!newEligibleGames.includes(g.p_code)) newEligibleGames.push(g.p_code);
//       });
//     }
//     setForm((prev) => ({ ...prev, eligibleGames: newEligibleGames }));
//   };

//   /** ✅ Toggle Provider */
//   const handleProviderToggle = (provider) => {
//     let newEligibleGames = [...form.eligibleGames];
//     if (newEligibleGames.includes(provider.p_code)) {
//       newEligibleGames = newEligibleGames.filter((code) => code !== provider.p_code);
//     } else {
//       newEligibleGames.push(provider.p_code);
//     }
//     setForm((prev) => ({ ...prev, eligibleGames: newEligibleGames }));
//   };

//   /** Expand/Collapse category */
//   const toggleCategoryCollapse = (categoryCode) => {
//     setExpandedCategories((prev) =>
//       prev.includes(categoryCode)
//         ? prev.filter((c) => c !== categoryCode)
//         : [...prev, categoryCode]
//     );
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onSave(form);
//   };

//   const allSelected = filteredCategories.every(
//     (category) =>
//       form.eligibleGames.includes(category.category_code) &&
//       category.gamelist.every((provider) =>
//         form.eligibleGames.includes(provider.p_code)
//       )
//   );

//   return (
//     <CModal visible={show} onClose={onClose} size="lg">
//       <CModalHeader>
//         <CModalTitle>{bonus ? "Edit Bonus" : "Create Bonus"}</CModalTitle>
//       </CModalHeader>
//       <CModalBody>
//         <CForm onSubmit={handleSubmit}>
//           {/* Name + Bonus Type */}
//           <CRow className="mb-3">
//             <CCol md={6}>
//               <CFormInput
//                 label="Name"
//                 value={form.name}
//                 onChange={(e) => handleChange("name", e.target.value)}
//                 required
//               />
//             </CCol>
//             <CCol md={6}>
//               <CFormSelect
//                 label="Bonus Type"
//                 value={form.bonusType}
//                 onChange={(e) => handleChange("bonusType", e.target.value)}
//                 required
//               >
//                 <option value="">Select Bonus Type</option>
//                 {bonusTypes.map((type) => (
//                   <option key={type} value={type}>
//                     {type}
//                   </option>
//                 ))}
//               </CFormSelect>
//             </CCol>
//           </CRow>

//           {/* Description */}
//           <CFormTextarea
//             label="Description"
//             value={form.description}
//             onChange={(e) => handleChange("description", e.target.value)}
//             rows={3}
//             className="mb-3"
//           />

//           {/* Numeric Fields */}
//           <CRow className="mb-3">
//             <CCol md={4}>
//               <CFormInput
//                 type="number"
//                 label="Percentage %"
//                 value={form.percentage}
//                 onChange={(e) => handleChange("percentage", e.target.value)}
//               />
//             </CCol>
//             <CCol md={4}>
//               <CFormInput
//                 type="number"
//                 label="Fixed Amount"
//                 value={form.fixedAmount}
//                 onChange={(e) => handleChange("fixedAmount", e.target.value)}
//               />
//             </CCol>
//             <CCol md={4}>
//               <CFormInput
//                 type="number"
//                 label="Min Deposit"
//                 value={form.minDeposit}
//                 onChange={(e) => handleChange("minDeposit", e.target.value)}
//               />
//             </CCol>
//           </CRow>

//           <CRow className="mb-3">
//             <CCol md={4}>
//               <CFormInput
//                 type="number"
//                 label="Max Bonus"
//                 value={form.maxBonus}
//                 onChange={(e) => handleChange("maxBonus", e.target.value)}
//               />
//             </CCol>
//             <CCol md={4}>
//               <CFormInput
//                 type="number"
//                 label="Min Turnover"
//                 value={form.minTurnover}
//                 onChange={(e) => handleChange("minTurnover", e.target.value)}
//               />
//             </CCol>
//             <CCol md={4}>
//               <CFormInput
//                 type="number"
//                 label="Max Turnover"
//                 value={form.maxTurnover}
//                 onChange={(e) => handleChange("maxTurnover", e.target.value)}
//               />
//             </CCol>
//           </CRow>

//           {/* Wagering + Valid Days + Active */}
//           <CRow className="mb-3">
//             <CCol md={4}>
//               <CFormInput
//                 type="number"
//                 label="Wagering Requirement"
//                 value={form.wageringRequirement}
//                 onChange={(e) => handleChange("wageringRequirement", e.target.value)}
//               />
//             </CCol>
//             <CCol md={4}>
//               <CFormInput
//                 type="number"
//                 label="Valid Days"
//                 value={form.validDays}
//                 onChange={(e) => handleChange("validDays", e.target.value)}
//               />
//             </CCol>
//             <CCol md={4}>
//               <CFormSwitch
//                 label="Active"
//                 checked={form.isActive}
//                 onChange={(e) => handleChange("isActive", e.target.checked)}
//               />
//             </CCol>
//           </CRow>

//           {/* Search + Select/Deselect All */}
//           <CFormInput
//             placeholder="Search categories or providers..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="mb-3"
//           />
//           <CFormCheck
//             label="Select/Deselect All"
//             checked={allSelected}
//             onChange={() => handleSelectAll(!allSelected)}
//             className="mb-3"
//           />

//           {/* Categories + Providers */}
//           {filteredCategories.map((category) => {
//             const categorySelected = form.eligibleGames.includes(category.category_code);
//             const isExpanded = expandedCategories.includes(category.category_code);
//             return (
//               <div key={category.category_code} className="mb-2 border p-2 rounded">
//                 <div className="d-flex justify-content-between">
//                   <CFormCheck
//                     label={category.category_name}
//                     checked={categorySelected}
//                     onChange={() => handleCategoryToggle(category)}
//                   />
//                   {category.gamelist.length > 0 && (
//                     <CButton
//                       size="sm"
//                       color="secondary"
//                       onClick={() => toggleCategoryCollapse(category.category_code)}
//                     >
//                       {isExpanded ? "Hide Providers" : "Show Providers"}
//                     </CButton>
//                   )}
//                 </div>
//                 <CCollapse visible={isExpanded}>
//                   <div className="ms-4 mt-2 d-flex flex-wrap gap-2">
//                     {category.gamelist.map((provider) => (
//                       <CFormCheck
//                         key={provider.p_code}
//                         label={provider.name}
//                         checked={form.eligibleGames.includes(provider.p_code)}
//                         onChange={() => handleProviderToggle(provider)}
//                       />
//                     ))}
//                   </div>
//                 </CCollapse>
//               </div>
//             );
//           })}

//           {/* Start + End Dates */}
//           <CRow className="mt-3">
//             <CCol md={6}>
//               <CFormInput
//                 type="date"
//                 label="Start Date"
//                 value={form.startDate}
//                 onChange={(e) => handleChange("startDate", e.target.value)}
//               />
//             </CCol>
//             <CCol md={6}>
//               <CFormInput
//                 type="date"
//                 label="End Date"
//                 value={form.endDate}
//                 onChange={(e) => handleChange("endDate", e.target.value)}
//               />
//             </CCol>
//           </CRow>
//         </CForm>
//       </CModalBody>
//       <CModalFooter>
//         <CButton color="secondary" onClick={onClose}>
//           Cancel
//         </CButton>
//         <CButton color="primary" onClick={handleSubmit}>
//           Save
//         </CButton>
//       </CModalFooter>
//     </CModal>
//   );
// };

// export default BonusFormModal;




// // import React, { useState, useEffect } from "react";
// // import {
// //   CModal,
// //   CModalHeader,
// //   CModalTitle,
// //   CModalBody,
// //   CModalFooter,
// //   CForm,
// //   CFormInput,
// //   CFormSelect,
// //   CFormTextarea,
// //   CFormSwitch,
// //   CButton,
// //   CRow,
// //   CCol,
// // } from "@coreui/react";

// // const bonusTypes = [
// //   "deposit",
// //   "dailyRebate",
// //   "weeklyBonus",
// //   "vip",
// //   "referral",
// //   "referralRebate",
// //   "signup",
// //   "birthday",
// //   "other",
// // ];

// // const GAMES = ["all", "slots", "live_casino", "sports", "table_games"];

// // const BonusFormModal = ({ show, onClose, onSave, bonus }) => {
// //   const [form, setForm] = useState({
// //     name: "",
// //     description: "",
// //     bonusType: "",
// //     percentage: "",
// //     fixedAmount: "",
// //     minDeposit: "",
// //     maxBonus: "",
// //     minTurnover: "",
// //     maxTurnover: "",
// //     wageringRequirement: 1,
// //     validDays: "",
// //     eligibleGames: [],
// //     isActive: true,
// //     startDate: "",
// //     endDate: "",
// //     level1Percent: "",
// //     level2Percent: "",
// //     level3Percent: "",
// //   });

// //   useEffect(() => {
// //     if (bonus) setForm({ ...form, ...bonus });
// //   }, [bonus]);

// //   const handleChange = (key, value) => {
// //     setForm((prev) => ({ ...prev, [key]: value }));
// //   };

// //   const handleGameSelection = (game) => {
// //     setForm((prev) => {
// //       const exists = prev.eligibleGames.includes(game);
// //       return {
// //         ...prev,
// //         eligibleGames: exists
// //           ? prev.eligibleGames.filter((g) => g !== game)
// //           : [...prev.eligibleGames, game],
// //       };
// //     });
// //   };

// //   // Decide which fields to show based on bonus type
// //   const showFields = () => {
// //     const type = form.bonusType;
// //     return {
// //       showPercentage: ["deposit", "dailyRebate", "weeklyBonus", "vip"].includes(type),
// //       showFixedAmount: ["deposit"].includes(type),
// //       showMinDeposit: ["deposit"].includes(type),
// //       showReferralLevels: ["referralRebate"].includes(type),
// //       showWagering: ["dailyRebate", "weeklyBonus", "vip", "referralRebate"].includes(type),
// //       showValidDays: ["dailyRebate", "weeklyBonus", "vip"].includes(type),
// //     };
// //   };

// //   const fields = showFields();

// //   const handleSubmit = (e) => {
// //     e.preventDefault();
// //     onSave(form);
// //   };

// //   return (
// //     <CModal visible={show} onClose={onClose} size="lg">
// //       <CModalHeader>
// //         <CModalTitle>{bonus ? "Edit Bonus" : "Create Bonus"}</CModalTitle>
// //       </CModalHeader>
// //       <CModalBody>
// //         <CForm onSubmit={handleSubmit}>
// //           <CRow className="mb-3">
// //             <CCol md={6}>
// //               <CFormInput
// //                 label="Name"
// //                 value={form.name}
// //                 onChange={(e) => handleChange("name", e.target.value)}
// //                 required
// //               />
// //             </CCol>
// //             <CCol md={6}>
// //               <CFormSelect
// //                 label="Bonus Type"
// //                 value={form.bonusType}
// //                 onChange={(e) => handleChange("bonusType", e.target.value)}
// //                 required
// //               >
// //                 <option value="">Select Bonus Type</option>
// //                 {bonusTypes.map((type) => (
// //                   <option key={type} value={type}>
// //                     {type}
// //                   </option>
// //                 ))}
// //               </CFormSelect>
// //             </CCol>
// //           </CRow>

// //           <CFormTextarea
// //             label="Description"
// //             value={form.description}
// //             onChange={(e) => handleChange("description", e.target.value)}
// //             rows={3}
// //             className="mb-3"
// //           />

// //           <CRow className="mb-3">
// //             {fields.showPercentage && (
// //               <CCol md={4}>
// //                 <CFormInput
// //                   type="number"
// //                   label="Percentage %"
// //                   value={form.percentage}
// //                   onChange={(e) => handleChange("percentage", e.target.value)}
// //                 />
// //               </CCol>
// //             )}
// //             {fields.showFixedAmount && (
// //               <CCol md={4}>
// //                 <CFormInput
// //                   type="number"
// //                   label="Fixed Amount"
// //                   value={form.fixedAmount}
// //                   onChange={(e) => handleChange("fixedAmount", e.target.value)}
// //                 />
// //               </CCol>
// //             )}
// //             {fields.showMinDeposit && (
// //               <CCol md={4}>
// //                 <CFormInput
// //                   type="number"
// //                   label="Min Deposit"
// //                   value={form.minDeposit}
// //                   onChange={(e) => handleChange("minDeposit", e.target.value)}
// //                 />
// //               </CCol>
// //             )}
// //           </CRow>

// //           {fields.showReferralLevels && (
// //             <CRow className="mb-3">
// //               <CCol md={4}>
// //                 <CFormInput
// //                   type="number"
// //                   label="Level 1 Percent"
// //                   value={form.level1Percent}
// //                   onChange={(e) => handleChange("level1Percent", e.target.value)}
// //                 />
// //               </CCol>
// //               <CCol md={4}>
// //                 <CFormInput
// //                   type="number"
// //                   label="Level 2 Percent"
// //                   value={form.level2Percent}
// //                   onChange={(e) => handleChange("level2Percent", e.target.value)}
// //                 />
// //               </CCol>
// //               <CCol md={4}>
// //                 <CFormInput
// //                   type="number"
// //                   label="Level 3 Percent"
// //                   value={form.level3Percent}
// //                   onChange={(e) => handleChange("level3Percent", e.target.value)}
// //                 />
// //               </CCol>
// //             </CRow>
// //           )}

// //           {fields.showWagering && (
// //             <CRow className="mb-3">
// //               <CCol md={6}>
// //                 <CFormInput
// //                   type="number"
// //                   label="Wagering Requirement"
// //                   value={form.wageringRequirement}
// //                   onChange={(e) => handleChange("wageringRequirement", e.target.value)}
// //                 />
// //               </CCol>
// //               {fields.showValidDays && (
// //                 <CCol md={6}>
// //                   <CFormInput
// //                     type="number"
// //                     label="Valid Days"
// //                     value={form.validDays}
// //                     onChange={(e) => handleChange("validDays", e.target.value)}
// //                   />
// //                 </CCol>
// //               )}
// //             </CRow>
// //           )}

// //           {/* Eligible Games */}
// //           <div className="mb-3">
// //             <label className="fw-bold">Eligible Games</label>
// //             <div className="d-flex flex-wrap gap-2">
// //               {GAMES.map((game) => (
// //                 <CButton
// //                   key={game}
// //                   size="sm"
// //                   color={form.eligibleGames.includes(game) ? "primary" : "secondary"}
// //                   variant="outline"
// //                   onClick={() => handleGameSelection(game)}
// //                 >
// //                   {game}
// //                 </CButton>
// //               ))}
// //             </div>
// //           </div>

// //           {/* Start & End Dates */}
// //           <CRow className="mb-3">
// //             <CCol md={6}>
// //               <CFormInput
// //                 type="date"
// //                 label="Start Date"
// //                 value={form.startDate}
// //                 onChange={(e) => handleChange("startDate", e.target.value)}
// //               />
// //             </CCol>
// //             <CCol md={6}>
// //               <CFormInput
// //                 type="date"
// //                 label="End Date"
// //                 value={form.endDate}
// //                 onChange={(e) => handleChange("endDate", e.target.value)}
// //               />
// //             </CCol>
// //           </CRow>

// //           <CFormSwitch
// //             label="Active"
// //             checked={form.isActive}
// //             onChange={(e) => handleChange("isActive", e.target.checked)}
// //           />
// //         </CForm>
// //       </CModalBody>
// //       <CModalFooter>
// //         <CButton color="secondary" onClick={onClose}>
// //           Cancel
// //         </CButton>
// //         <CButton color="primary" onClick={handleSubmit}>
// //           Save
// //         </CButton>
// //       </CModalFooter>
// //     </CModal>
// //   );
// // };

// // export default BonusFormModal;
import React, { useState, useEffect, useMemo } from "react";
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormSelect,
  CFormTextarea,
  CFormSwitch,
  CButton,
  CRow,
  CCol,
  CFormCheck,
  CCollapse,
  CSpinner,
  CAlert
} from "@coreui/react";
import { adminServices } from "../../../service/adminServices";

const bonusTypes = [
  "deposit",
  "dailyRebate",
  "weeklyBonus",
  "vip",
  "referral",
  "referralRebate",
  "signup",
  "birthday",
  "other",
];

const VIP_LEVELS = ["bronze", "silver", "gold", "diamond", "elite"];

const BonusFormModal = ({ show, onClose, onSave, bonus }) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    bonusType: "",
    percentage: "",
    fixedAmount: "",
    minDeposit: "",
    maxBonus: "",
    minTurnover: "",
    maxTurnover: "",
    wageringRequirement: 1,
    validDays: "",
    eligibleGames: [],
    isActive: true,
    startDate: "",
    endDate: "",
    level1Percent: "",
    level2Percent: "",
    level3Percent: "",
    // VIP levels
    bronze: { monthlyTurnoverRequirement: "", vpConversionRate: "", loyaltyBonus: "" },
    silver: { monthlyTurnoverRequirement: "", vpConversionRate: "", loyaltyBonus: "" },
    gold: { monthlyTurnoverRequirement: "", vpConversionRate: "", loyaltyBonus: "" },
    diamond: { monthlyTurnoverRequirement: "", vpConversionRate: "", loyaltyBonus: "" },
    elite: { monthlyTurnoverRequirement: "", vpConversionRate: "", loyaltyBonus: "" },
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedCategories, setExpandedCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch categories and providers when modal opens
  useEffect(() => {
    if (show) {
      fetchCategoriesWithProviders();
    }
  }, [show]);

  // Populate form if editing existing bonus
  useEffect(() => {
    if (bonus) {
      setForm((prev) => ({ ...prev, ...bonus }));
    }
  }, [bonus]);

  const fetchCategoriesWithProviders = async () => {
    try {
      setLoading(true);
      setError("");
      const categoriesData = await adminServices.getCategoriesWithProvidersAndGames();
      setCategories(categoriesData);
    } catch (err) {
      setError("Failed to load categories and providers. Please try again.");
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  /** 🔎 Filter categories & providers */
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories;
    const lowerQuery = searchQuery.toLowerCase();
    return categories
      .map((category) => {
        const filteredProviders = category.gamelist.filter((provider) =>
          provider.name.toLowerCase().includes(lowerQuery)
        );
        if (
          category.category_name.toLowerCase().includes(lowerQuery) ||
          filteredProviders.length > 0
        ) {
          return { ...category, gamelist: filteredProviders };
        }
        return null;
      })
      .filter(Boolean);
  }, [searchQuery, categories]);

  /** ✅ Select/Deselect all */
  const handleSelectAll = (selectAll) => {
    let newEligibleGames = [];
    if (selectAll) {
      categories.forEach((category) => {
        newEligibleGames.push(category.category_code);
        category.gamelist.forEach((provider) => newEligibleGames.push(provider.p_code));
      });
    }
    setForm((prev) => ({ ...prev, eligibleGames: newEligibleGames }));
  };

  /** ✅ Toggle Category */
  const handleCategoryToggle = (category) => {
    let newEligibleGames = [...form.eligibleGames];
    const isSelected = newEligibleGames.includes(category.category_code);
    
    if (isSelected) {
      // Deselect category and all its providers
      newEligibleGames = newEligibleGames.filter(
        (code) =>
          code !== category.category_code &&
          !category.gamelist.some((provider) => provider.p_code === code)
      );
    } else {
      // Select category and all its providers
      newEligibleGames.push(category.category_code);
      category.gamelist.forEach((provider) => {
        if (!newEligibleGames.includes(provider.p_code)) {
          newEligibleGames.push(provider.p_code);
        }
      });
    }
    setForm((prev) => ({ ...prev, eligibleGames: newEligibleGames }));
  };

  /** ✅ Toggle Provider */
  const handleProviderToggle = (provider) => {
    let newEligibleGames = [...form.eligibleGames];
    if (newEligibleGames.includes(provider.p_code)) {
      newEligibleGames = newEligibleGames.filter((code) => code !== provider.p_code);
    } else {
      newEligibleGames.push(provider.p_code);
    }
    setForm((prev) => ({ ...prev, eligibleGames: newEligibleGames }));
  };

  /** Expand/Collapse category */
  const toggleCategoryCollapse = (categoryCode) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryCode)
        ? prev.filter((c) => c !== categoryCode)
        : [...prev, categoryCode]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  const allSelected = filteredCategories.length > 0 && filteredCategories.every(
    (category) =>
      form.eligibleGames.includes(category.category_code) &&
      category.gamelist.every((provider) =>
        form.eligibleGames.includes(provider.p_code)
      )
  );

  const isCategorySelected = (category) => {
    return form.eligibleGames.includes(category.category_code) &&
           category.gamelist.every(provider => 
             form.eligibleGames.includes(provider.p_code)
           );
  };

  const isCategoryPartiallySelected = (category) => {
    const providerCodes = category.gamelist.map(p => p.p_code);
    const selectedProviders = providerCodes.filter(code => 
      form.eligibleGames.includes(code)
    );
    return selectedProviders.length > 0 && selectedProviders.length < providerCodes.length;
  };

  return (
    <CModal visible={show} onClose={onClose} size="lg">
      <CModalHeader>
        <CModalTitle>{bonus ? "Edit Bonus" : "Create Bonus"}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        {error && (
          <CAlert color="danger" className="mb-3">
            {error}
            <CButton 
              color="link" 
              size="sm" 
              onClick={fetchCategoriesWithProviders}
              className="p-0 ms-2"
            >
              Retry
            </CButton>
          </CAlert>
        )}

        {loading && (
          <div className="text-center py-3">
            <CSpinner />
            <div className="mt-2">Loading categories and providers...</div>
          </div>
        )}

        <CForm onSubmit={handleSubmit}>
          {/* Name + Bonus Type */}
          <CRow className="mb-3">
            <CCol md={6}>
              <CFormInput
                label="Name"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </CCol>
            <CCol md={6}>
              <CFormSelect
                label="Bonus Type"
                value={form.bonusType}
                onChange={(e) => handleChange("bonusType", e.target.value)}
                required
              >
                <option value="">Select Bonus Type</option>
                {bonusTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
          </CRow>

          {/* Description */}
          <CFormTextarea
            label="Description"
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={3}
            className="mb-3"
          />

          {/* Numeric Fields */}
          <CRow className="mb-3">
            <CCol md={4}>
              <CFormInput
                type="number"
                label="Percentage %"
                value={form.percentage}
                onChange={(e) => handleChange("percentage", e.target.value)}
                min="0"
                step="0.01"
              />
            </CCol>
            <CCol md={4}>
              <CFormInput
                type="number"
                label="Fixed Amount"
                value={form.fixedAmount}
                onChange={(e) => handleChange("fixedAmount", e.target.value)}
                min="0"
                step="0.01"
              />
            </CCol>
            <CCol md={4}>
              <CFormInput
                type="number"
                label="Min Deposit"
                value={form.minDeposit}
                onChange={(e) => handleChange("minDeposit", e.target.value)}
                min="0"
                step="0.01"
              />
            </CCol>
          </CRow>

          <CRow className="mb-3">
            <CCol md={4}>
              <CFormInput
                type="number"
                label="Max Bonus"
                value={form.maxBonus}
                onChange={(e) => handleChange("maxBonus", e.target.value)}
                min="0"
                step="0.01"
              />
            </CCol>
            <CCol md={4}>
              <CFormInput
                type="number"
                label="Min Turnover"
                value={form.minTurnover}
                onChange={(e) => handleChange("minTurnover", e.target.value)}
                min="0"
                step="0.01"
              />
            </CCol>
            <CCol md={4}>
              <CFormInput
                type="number"
                label="Max Turnover"
                value={form.maxTurnover}
                onChange={(e) => handleChange("maxTurnover", e.target.value)}
                min="0"
                step="0.01"
              />
            </CCol>
          </CRow>

          {/* Wagering + Valid Days + Active */}
          <CRow className="mb-3">
            <CCol md={4}>
              <CFormInput
                type="number"
                label="Wagering Requirement"
                value={form.wageringRequirement}
                onChange={(e) => handleChange("wageringRequirement", e.target.value)}
                min="1"
              />
            </CCol>
            <CCol md={4}>
              <CFormInput
                type="number"
                label="Valid Days"
                value={form.validDays}
                onChange={(e) => handleChange("validDays", e.target.value)}
                min="1"
              />
            </CCol>
            <CCol md={4}>
              <CFormSwitch
                label="Active"
                checked={form.isActive}
                onChange={(e) => handleChange("isActive", e.target.checked)}
              />
            </CCol>
          </CRow>

          {/* Eligible Games Section */}
          {!loading && !error && (
            <>
              <h6 className="mb-3">Eligible Games & Providers</h6>
              
              {/* Search + Select/Deselect All */}
              <CFormInput
                placeholder="Search categories or providers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-3"
              />
              
              {filteredCategories.length > 0 && (
                <CFormCheck
                  label="Select/Deselect All"
                  checked={allSelected}
                  onChange={() => handleSelectAll(!allSelected)}
                  className="mb-3"
                />
              )}

              {/* Categories + Providers */}
              {filteredCategories.length === 0 && !loading ? (
                <div className="text-center py-3 text-muted">
                  No categories found matching your search.
                </div>
              ) : (
                filteredCategories.map((category) => {
                  const categorySelected = isCategorySelected(category);
                  const categoryPartial = isCategoryPartiallySelected(category);
                  const isExpanded = expandedCategories.includes(category.category_code);
                  
                  return (
                    <div key={category.category_code} className="mb-2 border p-2 rounded">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <CFormCheck
                            label={category.category_name}
                            checked={categorySelected}
                            indeterminate={categoryPartial && !categorySelected}
                            onChange={() => handleCategoryToggle(category)}
                            className="me-2"
                          />
                          <small className="text-muted">
                            ({category.gamelist.length} providers)
                          </small>
                        </div>
                        {category.gamelist.length > 0 && (
                          <CButton
                            size="sm"
                            color="secondary"
                            onClick={() => toggleCategoryCollapse(category.category_code)}
                          >
                            {isExpanded ? "Hide" : "Show"} Providers
                          </CButton>
                        )}
                      </div>
                      <CCollapse visible={isExpanded}>
                        <div className="ms-4 mt-2">
                          <div className="row">
                            {category.gamelist.map((provider) => (
                              <div key={provider.p_code} className="col-md-6 mb-2">
                                <CFormCheck
                                  label={`${provider.name} (${provider.company})`}
                                  checked={form.eligibleGames.includes(provider.p_code)}
                                  onChange={() => handleProviderToggle(provider)}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </CCollapse>
                    </div>
                  );
                })
              )}
            </>
          )}

          {/* Start + End Dates */}
          <CRow className="mt-3">
            <CCol md={6}>
              <CFormInput
                type="datetime-local"
                label="Start Date"
                value={form.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
              />
            </CCol>
            <CCol md={6}>
              <CFormInput
                type="datetime-local"
                label="End Date"
                value={form.endDate}
                onChange={(e) => handleChange("endDate", e.target.value)}
              />
            </CCol>
          </CRow>
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>
          Cancel
        </CButton>
        <CButton color="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "Loading..." : "Save"}
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default BonusFormModal;