// // import React, { useState, useEffect, useMemo } from "react";
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
// //   CFormCheck,
// //   CCollapse,
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

// // const VIP_LEVELS = ["bronze", "silver", "gold", "diamond", "elite"];

// // const BonusFormModal = ({ show, onClose, onSave, bonus, cetegorys = [] }) => {
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
// //     // VIP levels
// //     bronze: { monthlyTurnoverRequirement: "", vpConversionRate: "", loyaltyBonus: "" },
// //     silver: { monthlyTurnoverRequirement: "", vpConversionRate: "", loyaltyBonus: "" },
// //     gold: { monthlyTurnoverRequirement: "", vpConversionRate: "", loyaltyBonus: "" },
// //     diamond: { monthlyTurnoverRequirement: "", vpConversionRate: "", loyaltyBonus: "" },
// //     elite: { monthlyTurnoverRequirement: "", vpConversionRate: "", loyaltyBonus: "" },
// //   });

// //   const [expandedCategories, setExpandedCategories] = useState([]);
// //   const [searchQuery, setSearchQuery] = useState("");

// //   useEffect(() => {
// //     if (bonus) setForm((prev) => ({ ...prev, ...bonus }));
// //   }, [bonus]);

// //   const handleChange = (key, value) => {
// //     setForm((prev) => ({ ...prev, [key]: value }));
// //   };

// //   /** 🔎 Filter categories & providers */
// //   const filteredCategories = useMemo(() => {
// //     if (!searchQuery) return cetegorys;
// //     const lowerQuery = searchQuery.toLowerCase();
// //     return cetegorys
// //       .map((category) => {
// //         const filteredProviders = category.gamelist.filter((provider) =>
// //           provider.name.toLowerCase().includes(lowerQuery)
// //         );
// //         if (
// //           category.category_name.toLowerCase().includes(lowerQuery) ||
// //           filteredProviders.length > 0
// //         ) {
// //           return { ...category, gamelist: filteredProviders };
// //         }
// //         return null;
// //       })
// //       .filter(Boolean);
// //   }, [searchQuery, cetegorys]);

// //   /** ✅ Select/Deselect all */
// //   const handleSelectAll = (selectAll) => {
// //     let newEligibleGames = [];
// //     if (selectAll) {
// //       cetegorys.forEach((category) => {
// //         newEligibleGames.push(category.category_code);
// //         category.gamelist.forEach((provider) => newEligibleGames.push(provider.p_code));
// //       });
// //     }
// //     setForm((prev) => ({ ...prev, eligibleGames: newEligibleGames }));
// //   };

// //   /** ✅ Toggle Category */
// //   const handleCategoryToggle = (category) => {
// //     let newEligibleGames = [...form.eligibleGames];
// //     const isSelected = newEligibleGames.includes(category.category_code);
// //     if (isSelected) {
// //       newEligibleGames = newEligibleGames.filter(
// //         (code) =>
// //           code !== category.category_code &&
// //           !category.gamelist.some((g) => g.p_code === code)
// //       );
// //     } else {
// //       newEligibleGames.push(category.category_code);
// //       category.gamelist.forEach((g) => {
// //         if (!newEligibleGames.includes(g.p_code)) newEligibleGames.push(g.p_code);
// //       });
// //     }
// //     setForm((prev) => ({ ...prev, eligibleGames: newEligibleGames }));
// //   };

// //   /** ✅ Toggle Provider */
// //   const handleProviderToggle = (provider) => {
// //     let newEligibleGames = [...form.eligibleGames];
// //     if (newEligibleGames.includes(provider.p_code)) {
// //       newEligibleGames = newEligibleGames.filter((code) => code !== provider.p_code);
// //     } else {
// //       newEligibleGames.push(provider.p_code);
// //     }
// //     setForm((prev) => ({ ...prev, eligibleGames: newEligibleGames }));
// //   };

// //   /** Expand/Collapse category */
// //   const toggleCategoryCollapse = (categoryCode) => {
// //     setExpandedCategories((prev) =>
// //       prev.includes(categoryCode)
// //         ? prev.filter((c) => c !== categoryCode)
// //         : [...prev, categoryCode]
// //     );
// //   };

// //   const handleSubmit = (e) => {
// //     e.preventDefault();
// //     onSave(form);
// //   };

// //   const allSelected = filteredCategories.every(
// //     (category) =>
// //       form.eligibleGames.includes(category.category_code) &&
// //       category.gamelist.every((provider) =>
// //         form.eligibleGames.includes(provider.p_code)
// //       )
// //   );

// //   return (
// //     <CModal visible={show} onClose={onClose} size="lg">
// //       <CModalHeader>
// //         <CModalTitle>{bonus ? "Edit Bonus" : "Create Bonus"}</CModalTitle>
// //       </CModalHeader>
// //       <CModalBody>
// //         <CForm onSubmit={handleSubmit}>
// //           {/* Name + Bonus Type */}
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

// //           {/* Description */}
// //           <CFormTextarea
// //             label="Description"
// //             value={form.description}
// //             onChange={(e) => handleChange("description", e.target.value)}
// //             rows={3}
// //             className="mb-3"
// //           />

// //           {/* Numeric Fields */}
// //           <CRow className="mb-3">
// //             <CCol md={4}>
// //               <CFormInput
// //                 type="number"
// //                 label="Percentage %"
// //                 value={form.percentage}
// //                 onChange={(e) => handleChange("percentage", e.target.value)}
// //               />
// //             </CCol>
// //             <CCol md={4}>
// //               <CFormInput
// //                 type="number"
// //                 label="Fixed Amount"
// //                 value={form.fixedAmount}
// //                 onChange={(e) => handleChange("fixedAmount", e.target.value)}
// //               />
// //             </CCol>
// //             <CCol md={4}>
// //               <CFormInput
// //                 type="number"
// //                 label="Min Deposit"
// //                 value={form.minDeposit}
// //                 onChange={(e) => handleChange("minDeposit", e.target.value)}
// //               />
// //             </CCol>
// //           </CRow>

// //           <CRow className="mb-3">
// //             <CCol md={4}>
// //               <CFormInput
// //                 type="number"
// //                 label="Max Bonus"
// //                 value={form.maxBonus}
// //                 onChange={(e) => handleChange("maxBonus", e.target.value)}
// //               />
// //             </CCol>
// //             <CCol md={4}>
// //               <CFormInput
// //                 type="number"
// //                 label="Min Turnover"
// //                 value={form.minTurnover}
// //                 onChange={(e) => handleChange("minTurnover", e.target.value)}
// //               />
// //             </CCol>
// //             <CCol md={4}>
// //               <CFormInput
// //                 type="number"
// //                 label="Max Turnover"
// //                 value={form.maxTurnover}
// //                 onChange={(e) => handleChange("maxTurnover", e.target.value)}
// //               />
// //             </CCol>
// //           </CRow>

// //           {/* Wagering + Valid Days + Active */}
// //           <CRow className="mb-3">
// //             <CCol md={4}>
// //               <CFormInput
// //                 type="number"
// //                 label="Wagering Requirement"
// //                 value={form.wageringRequirement}
// //                 onChange={(e) => handleChange("wageringRequirement", e.target.value)}
// //               />
// //             </CCol>
// //             <CCol md={4}>
// //               <CFormInput
// //                 type="number"
// //                 label="Valid Days"
// //                 value={form.validDays}
// //                 onChange={(e) => handleChange("validDays", e.target.value)}
// //               />
// //             </CCol>
// //             <CCol md={4}>
// //               <CFormSwitch
// //                 label="Active"
// //                 checked={form.isActive}
// //                 onChange={(e) => handleChange("isActive", e.target.checked)}
// //               />
// //             </CCol>
// //           </CRow>

// //           {/* Search + Select/Deselect All */}
// //           <CFormInput
// //             placeholder="Search categories or providers..."
// //             value={searchQuery}
// //             onChange={(e) => setSearchQuery(e.target.value)}
// //             className="mb-3"
// //           />
// //           <CFormCheck
// //             label="Select/Deselect All"
// //             checked={allSelected}
// //             onChange={() => handleSelectAll(!allSelected)}
// //             className="mb-3"
// //           />

// //           {/* Categories + Providers */}
// //           {filteredCategories.map((category) => {
// //             const categorySelected = form.eligibleGames.includes(category.category_code);
// //             const isExpanded = expandedCategories.includes(category.category_code);
// //             return (
// //               <div key={category.category_code} className="mb-2 border p-2 rounded">
// //                 <div className="d-flex justify-content-between">
// //                   <CFormCheck
// //                     label={category.category_name}
// //                     checked={categorySelected}
// //                     onChange={() => handleCategoryToggle(category)}
// //                   />
// //                   {category.gamelist.length > 0 && (
// //                     <CButton
// //                       size="sm"
// //                       color="secondary"
// //                       onClick={() => toggleCategoryCollapse(category.category_code)}
// //                     >
// //                       {isExpanded ? "Hide Providers" : "Show Providers"}
// //                     </CButton>
// //                   )}
// //                 </div>
// //                 <CCollapse visible={isExpanded}>
// //                   <div className="ms-4 mt-2 d-flex flex-wrap gap-2">
// //                     {category.gamelist.map((provider) => (
// //                       <CFormCheck
// //                         key={provider.p_code}
// //                         label={provider.name}
// //                         checked={form.eligibleGames.includes(provider.p_code)}
// //                         onChange={() => handleProviderToggle(provider)}
// //                       />
// //                     ))}
// //                   </div>
// //                 </CCollapse>
// //               </div>
// //             );
// //           })}

// //           {/* Start + End Dates */}
// //           <CRow className="mt-3">
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

// import React, { useState, useEffect } from "react";
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

// const GAMES = ["all", "slots", "live_casino", "sports", "table_games"];

// const BonusFormModal = ({ show, onClose, onSave, bonus }) => {
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
//   });

//   useEffect(() => {
//     if (bonus) setForm({ ...form, ...bonus });
//   }, [bonus]);

//   const handleChange = (key, value) => {
//     setForm((prev) => ({ ...prev, [key]: value }));
//   };

//   const handleGameSelection = (game) => {
//     setForm((prev) => {
//       const exists = prev.eligibleGames.includes(game);
//       return {
//         ...prev,
//         eligibleGames: exists
//           ? prev.eligibleGames.filter((g) => g !== game)
//           : [...prev.eligibleGames, game],
//       };
//     });
//   };

//   // Decide which fields to show based on bonus type
//   const showFields = () => {
//     const type = form.bonusType;
//     return {
//       showPercentage: ["deposit", "dailyRebate", "weeklyBonus", "vip"].includes(type),
//       showFixedAmount: ["deposit"].includes(type),
//       showMinDeposit: ["deposit"].includes(type),
//       showReferralLevels: ["referralRebate"].includes(type),
//       showWagering: ["dailyRebate", "weeklyBonus", "vip", "referralRebate"].includes(type),
//       showValidDays: ["dailyRebate", "weeklyBonus", "vip"].includes(type),
//     };
//   };

//   const fields = showFields();

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onSave(form);
//   };

//   return (
//     <CModal visible={show} onClose={onClose} size="lg">
//       <CModalHeader>
//         <CModalTitle>{bonus ? "Edit Bonus" : "Create Bonus"}</CModalTitle>
//       </CModalHeader>
//       <CModalBody>
//         <CForm onSubmit={handleSubmit}>
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

//           <CFormTextarea
//             label="Description"
//             value={form.description}
//             onChange={(e) => handleChange("description", e.target.value)}
//             rows={3}
//             className="mb-3"
//           />

//           <CRow className="mb-3">
//             {fields.showPercentage && (
//               <CCol md={4}>
//                 <CFormInput
//                   type="number"
//                   label="Percentage %"
//                   value={form.percentage}
//                   onChange={(e) => handleChange("percentage", e.target.value)}
//                 />
//               </CCol>
//             )}
//             {fields.showFixedAmount && (
//               <CCol md={4}>
//                 <CFormInput
//                   type="number"
//                   label="Fixed Amount"
//                   value={form.fixedAmount}
//                   onChange={(e) => handleChange("fixedAmount", e.target.value)}
//                 />
//               </CCol>
//             )}
//             {fields.showMinDeposit && (
//               <CCol md={4}>
//                 <CFormInput
//                   type="number"
//                   label="Min Deposit"
//                   value={form.minDeposit}
//                   onChange={(e) => handleChange("minDeposit", e.target.value)}
//                 />
//               </CCol>
//             )}
//           </CRow>

//           {fields.showReferralLevels && (
//             <CRow className="mb-3">
//               <CCol md={4}>
//                 <CFormInput
//                   type="number"
//                   label="Level 1 Percent"
//                   value={form.level1Percent}
//                   onChange={(e) => handleChange("level1Percent", e.target.value)}
//                 />
//               </CCol>
//               <CCol md={4}>
//                 <CFormInput
//                   type="number"
//                   label="Level 2 Percent"
//                   value={form.level2Percent}
//                   onChange={(e) => handleChange("level2Percent", e.target.value)}
//                 />
//               </CCol>
//               <CCol md={4}>
//                 <CFormInput
//                   type="number"
//                   label="Level 3 Percent"
//                   value={form.level3Percent}
//                   onChange={(e) => handleChange("level3Percent", e.target.value)}
//                 />
//               </CCol>
//             </CRow>
//           )}

//           {fields.showWagering && (
//             <CRow className="mb-3">
//               <CCol md={6}>
//                 <CFormInput
//                   type="number"
//                   label="Wagering Requirement"
//                   value={form.wageringRequirement}
//                   onChange={(e) => handleChange("wageringRequirement", e.target.value)}
//                 />
//               </CCol>
//               {fields.showValidDays && (
//                 <CCol md={6}>
//                   <CFormInput
//                     type="number"
//                     label="Valid Days"
//                     value={form.validDays}
//                     onChange={(e) => handleChange("validDays", e.target.value)}
//                   />
//                 </CCol>
//               )}
//             </CRow>
//           )}

//           {/* Eligible Games */}
//           <div className="mb-3">
//             <label className="fw-bold">Eligible Games</label>
//             <div className="d-flex flex-wrap gap-2">
//               {GAMES.map((game) => (
//                 <CButton
//                   key={game}
//                   size="sm"
//                   color={form.eligibleGames.includes(game) ? "primary" : "secondary"}
//                   variant="outline"
//                   onClick={() => handleGameSelection(game)}
//                 >
//                   {game}
//                 </CButton>
//               ))}
//             </div>
//           </div>

//           {/* Start & End Dates */}
//           <CRow className="mb-3">
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

//           <CFormSwitch
//             label="Active"
//             checked={form.isActive}
//             onChange={(e) => handleChange("isActive", e.target.checked)}
//           />
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

// // import React, { useState, useEffect, useMemo } from "react";
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
// //   CFormCheck,
// //   CCollapse,
// //   CSpinner,
// //   CAlert
// // } from "@coreui/react";
// // import { adminServices } from "../../../service/adminServices";

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

// // const VIP_LEVELS = ["bronze", "silver", "gold", "diamond", "elite"];

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
// //     // VIP levels
// //     bronze: { monthlyTurnoverRequirement: "", vpConversionRate: "", loyaltyBonus: "" },
// //     silver: { monthlyTurnoverRequirement: "", vpConversionRate: "", loyaltyBonus: "" },
// //     gold: { monthlyTurnoverRequirement: "", vpConversionRate: "", loyaltyBonus: "" },
// //     diamond: { monthlyTurnoverRequirement: "", vpConversionRate: "", loyaltyBonus: "" },
// //     elite: { monthlyTurnoverRequirement: "", vpConversionRate: "", loyaltyBonus: "" },
// //   });

// //   const [categories, setCategories] = useState([]);
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState("");
// //   const [expandedCategories, setExpandedCategories] = useState([]);
// //   const [searchQuery, setSearchQuery] = useState("");

// //   // Fetch categories and providers when modal opens
// //   useEffect(() => {
// //     if (show) {
// //       fetchCategoriesWithProviders();
// //     }
// //   }, [show]);

// //   // Populate form if editing existing bonus
// //   useEffect(() => {
// //     if (bonus) {
// //       setForm((prev) => ({ ...prev, ...bonus }));
// //     }
// //   }, [bonus]);

// //   const fetchCategoriesWithProviders = async () => {
// //     try {
// //       setLoading(true);
// //       setError("");
// //       const categoriesData = await adminServices.getCategoriesWithProvidersAndGames();
// //       setCategories(categoriesData);
// //     } catch (err) {
// //       setError("Failed to load categories and providers. Please try again.");
// //       console.error("Error fetching categories:", err);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleChange = (key, value) => {
// //     setForm((prev) => ({ ...prev, [key]: value }));
// //   };

// //   /** 🔎 Filter categories & providers */
// //   const filteredCategories = useMemo(() => {
// //     if (!searchQuery) return categories;
// //     const lowerQuery = searchQuery.toLowerCase();
// //     return categories
// //       .map((category) => {
// //         const filteredProviders = category.gamelist.filter((provider) =>
// //           provider.name.toLowerCase().includes(lowerQuery)
// //         );
// //         if (
// //           category.category_name.toLowerCase().includes(lowerQuery) ||
// //           filteredProviders.length > 0
// //         ) {
// //           return { ...category, gamelist: filteredProviders };
// //         }
// //         return null;
// //       })
// //       .filter(Boolean);
// //   }, [searchQuery, categories]);

// //   /** ✅ Select/Deselect all */
// //   const handleSelectAll = (selectAll) => {
// //     let newEligibleGames = [];
// //     if (selectAll) {
// //       categories.forEach((category) => {
// //         newEligibleGames.push(category.category_code);
// //         category.gamelist.forEach((provider) => newEligibleGames.push(provider.p_code));
// //       });
// //     }
// //     setForm((prev) => ({ ...prev, eligibleGames: newEligibleGames }));
// //   };

// //   /** ✅ Toggle Category */
// //   const handleCategoryToggle = (category) => {
// //     let newEligibleGames = [...form.eligibleGames];
// //     const isSelected = newEligibleGames.includes(category.category_code);

// //     if (isSelected) {
// //       // Deselect category and all its providers
// //       newEligibleGames = newEligibleGames.filter(
// //         (code) =>
// //           code !== category.category_code &&
// //           !category.gamelist.some((provider) => provider.p_code === code)
// //       );
// //     } else {
// //       // Select category and all its providers
// //       newEligibleGames.push(category.category_code);
// //       category.gamelist.forEach((provider) => {
// //         if (!newEligibleGames.includes(provider.p_code)) {
// //           newEligibleGames.push(provider.p_code);
// //         }
// //       });
// //     }
// //     setForm((prev) => ({ ...prev, eligibleGames: newEligibleGames }));
// //   };

// //   /** ✅ Toggle Provider */
// //   const handleProviderToggle = (provider) => {
// //     let newEligibleGames = [...form.eligibleGames];
// //     if (newEligibleGames.includes(provider.p_code)) {
// //       newEligibleGames = newEligibleGames.filter((code) => code !== provider.p_code);
// //     } else {
// //       newEligibleGames.push(provider.p_code);
// //     }
// //     setForm((prev) => ({ ...prev, eligibleGames: newEligibleGames }));
// //   };

// //   /** Expand/Collapse category */
// //   const toggleCategoryCollapse = (categoryCode) => {
// //     setExpandedCategories((prev) =>
// //       prev.includes(categoryCode)
// //         ? prev.filter((c) => c !== categoryCode)
// //         : [...prev, categoryCode]
// //     );
// //   };

// //   const handleSubmit = (e) => {
// //     e.preventDefault();
// //     onSave(form);
// //   };

// //   const allSelected = filteredCategories.length > 0 && filteredCategories.every(
// //     (category) =>
// //       form.eligibleGames.includes(category.category_code) &&
// //       category.gamelist.every((provider) =>
// //         form.eligibleGames.includes(provider.p_code)
// //       )
// //   );

// //   const isCategorySelected = (category) => {
// //     return form.eligibleGames.includes(category.category_code) &&
// //            category.gamelist.every(provider =>
// //              form.eligibleGames.includes(provider.p_code)
// //            );
// //   };

// //   const isCategoryPartiallySelected = (category) => {
// //     const providerCodes = category.gamelist.map(p => p.p_code);
// //     const selectedProviders = providerCodes.filter(code =>
// //       form.eligibleGames.includes(code)
// //     );
// //     return selectedProviders.length > 0 && selectedProviders.length < providerCodes.length;
// //   };

// //   return (
// //     <CModal visible={show} onClose={onClose} size="lg">
// //       <CModalHeader>
// //         <CModalTitle>{bonus ? "Edit Bonus" : "Create Bonus"}</CModalTitle>
// //       </CModalHeader>
// //       <CModalBody>
// //         {error && (
// //           <CAlert color="danger" className="mb-3">
// //             {error}
// //             <CButton
// //               color="link"
// //               size="sm"
// //               onClick={fetchCategoriesWithProviders}
// //               className="p-0 ms-2"
// //             >
// //               Retry
// //             </CButton>
// //           </CAlert>
// //         )}

// //         {loading && (
// //           <div className="text-center py-3">
// //             <CSpinner />
// //             <div className="mt-2">Loading categories and providers...</div>
// //           </div>
// //         )}

// //         <CForm onSubmit={handleSubmit}>
// //           {/* Name + Bonus Type */}
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
// //                     {type.charAt(0).toUpperCase() + type.slice(1)}
// //                   </option>
// //                 ))}
// //               </CFormSelect>
// //             </CCol>
// //           </CRow>

// //           {/* Description */}
// //           <CFormTextarea
// //             label="Description"
// //             value={form.description}
// //             onChange={(e) => handleChange("description", e.target.value)}
// //             rows={3}
// //             className="mb-3"
// //           />

// //           {/* Numeric Fields */}
// //           <CRow className="mb-3">
// //             <CCol md={4}>
// //               <CFormInput
// //                 type="number"
// //                 label="Percentage %"
// //                 value={form.percentage}
// //                 onChange={(e) => handleChange("percentage", e.target.value)}
// //                 min="0"
// //                 step="0.01"
// //               />
// //             </CCol>
// //             <CCol md={4}>
// //               <CFormInput
// //                 type="number"
// //                 label="Fixed Amount"
// //                 value={form.fixedAmount}
// //                 onChange={(e) => handleChange("fixedAmount", e.target.value)}
// //                 min="0"
// //                 step="0.01"
// //               />
// //             </CCol>
// //             <CCol md={4}>
// //               <CFormInput
// //                 type="number"
// //                 label="Min Deposit"
// //                 value={form.minDeposit}
// //                 onChange={(e) => handleChange("minDeposit", e.target.value)}
// //                 min="0"
// //                 step="0.01"
// //               />
// //             </CCol>
// //           </CRow>

// //           <CRow className="mb-3">
// //             <CCol md={4}>
// //               <CFormInput
// //                 type="number"
// //                 label="Max Bonus"
// //                 value={form.maxBonus}
// //                 onChange={(e) => handleChange("maxBonus", e.target.value)}
// //                 min="0"
// //                 step="0.01"
// //               />
// //             </CCol>
// //             <CCol md={4}>
// //               <CFormInput
// //                 type="number"
// //                 label="Min Turnover"
// //                 value={form.minTurnover}
// //                 onChange={(e) => handleChange("minTurnover", e.target.value)}
// //                 min="0"
// //                 step="0.01"
// //               />
// //             </CCol>
// //             <CCol md={4}>
// //               <CFormInput
// //                 type="number"
// //                 label="Max Turnover"
// //                 value={form.maxTurnover}
// //                 onChange={(e) => handleChange("maxTurnover", e.target.value)}
// //                 min="0"
// //                 step="0.01"
// //               />
// //             </CCol>
// //           </CRow>

// //           {/* Wagering + Valid Days + Active */}
// //           <CRow className="mb-3">
// //             <CCol md={4}>
// //               <CFormInput
// //                 type="number"
// //                 label="Wagering Requirement"
// //                 value={form.wageringRequirement}
// //                 onChange={(e) => handleChange("wageringRequirement", e.target.value)}
// //                 min="1"
// //               />
// //             </CCol>
// //             <CCol md={4}>
// //               <CFormInput
// //                 type="number"
// //                 label="Valid Days"
// //                 value={form.validDays}
// //                 onChange={(e) => handleChange("validDays", e.target.value)}
// //                 min="1"
// //               />
// //             </CCol>
// //             <CCol md={4}>
// //               <CFormSwitch
// //                 label="Active"
// //                 checked={form.isActive}
// //                 onChange={(e) => handleChange("isActive", e.target.checked)}
// //               />
// //             </CCol>
// //           </CRow>

// //           {/* Eligible Games Section */}
// //           {!loading && !error && (
// //             <>
// //               <h6 className="mb-3">Eligible Games & Providers</h6>

// //               {/* Search + Select/Deselect All */}
// //               <CFormInput
// //                 placeholder="Search categories or providers..."
// //                 value={searchQuery}
// //                 onChange={(e) => setSearchQuery(e.target.value)}
// //                 className="mb-3"
// //               />

// //               {filteredCategories.length > 0 && (
// //                 <CFormCheck
// //                   label="Select/Deselect All"
// //                   checked={allSelected}
// //                   onChange={() => handleSelectAll(!allSelected)}
// //                   className="mb-3"
// //                 />
// //               )}

// //               {/* Categories + Providers */}
// //               {filteredCategories.length === 0 && !loading ? (
// //                 <div className="text-center py-3 text-muted">
// //                   No categories found matching your search.
// //                 </div>
// //               ) : (
// //                 filteredCategories.map((category) => {
// //                   const categorySelected = isCategorySelected(category);
// //                   const categoryPartial = isCategoryPartiallySelected(category);
// //                   const isExpanded = expandedCategories.includes(category.category_code);

// //                   return (
// //                     <div key={category.category_code} className="mb-2 border p-2 rounded">
// //                       <div className="d-flex justify-content-between align-items-center">
// //                         <div className="d-flex align-items-center">
// //                           <CFormCheck
// //                             label={category.category_name}
// //                             checked={categorySelected}
// //                             indeterminate={categoryPartial && !categorySelected}
// //                             onChange={() => handleCategoryToggle(category)}
// //                             className="me-2"
// //                           />
// //                           <small className="text-muted">
// //                             ({category.gamelist.length} providers)
// //                           </small>
// //                         </div>
// //                         {category.gamelist.length > 0 && (
// //                           <CButton
// //                             size="sm"
// //                             color="secondary"
// //                             onClick={() => toggleCategoryCollapse(category.category_code)}
// //                           >
// //                             {isExpanded ? "Hide" : "Show"} Providers
// //                           </CButton>
// //                         )}
// //                       </div>
// //                       <CCollapse visible={isExpanded}>
// //                         <div className="ms-4 mt-2">
// //                           <div className="row">
// //                             {category.gamelist.map((provider) => (
// //                               <div key={provider.p_code} className="col-md-6 mb-2">
// //                                 <CFormCheck
// //                                   label={`${provider.name} (${provider.company})`}
// //                                   checked={form.eligibleGames.includes(provider.p_code)}
// //                                   onChange={() => handleProviderToggle(provider)}
// //                                 />
// //                               </div>
// //                             ))}
// //                           </div>
// //                         </div>
// //                       </CCollapse>
// //                     </div>
// //                   );
// //                 })
// //               )}
// //             </>
// //           )}

// //           {/* Start + End Dates */}
// //           <CRow className="mt-3">
// //             <CCol md={6}>
// //               <CFormInput
// //                 type="datetime-local"
// //                 label="Start Date"
// //                 value={form.startDate}
// //                 onChange={(e) => handleChange("startDate", e.target.value)}
// //               />
// //             </CCol>
// //             <CCol md={6}>
// //               <CFormInput
// //                 type="datetime-local"
// //                 label="End Date"
// //                 value={form.endDate}
// //                 onChange={(e) => handleChange("endDate", e.target.value)}
// //               />
// //             </CCol>
// //           </CRow>
// //         </CForm>
// //       </CModalBody>
// //       <CModalFooter>
// //         <CButton color="secondary" onClick={onClose}>
// //           Cancel
// //         </CButton>
// //         <CButton color="primary" onClick={handleSubmit} disabled={loading}>
// //           {loading ? "Loading..." : "Save"}
// //         </CButton>
// //       </CModalFooter>
// //     </CModal>
// //   );
// // };

// // export default BonusFormModal;

import React, { useState, useEffect } from 'react'
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
  CCard,
  CCardBody,
  CAlert,
  CCardHeader,
  CCardFooter,
  CFormLabel,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilPlus,
  cilMinus,
  cilArrowThickTop,
  cilArrowThickBottom,
  cilCloudUpload,
} from '@coreui/icons'

const bonusTypes = [
  { value: 'deposit', label: 'Deposit Bonus' },
  { value: 'dailyRebate', label: 'Daily Rebate' },
  { value: 'weeklyBonus', label: 'Weekly Bonus' },
  { value: 'vip', label: 'VIP Bonus' },
  { value: 'referral', label: 'Referral Bonus' },
  { value: 'referralRebate', label: 'Referral Rebate' },
  { value: 'signup', label: 'Signup Bonus' },
  { value: 'birthday', label: 'Birthday Bonus' },
  { value: 'welcomeBonus', label: 'Welcome Bonus' },
  { value: 'firstDeposit', label: 'First Deposit Bonus' },
  { value: 'freeSpins', label: 'Free Spins' },
  { value: 'normalDeposit', label: 'Normal Deposit' },
  { value: 'other', label: 'Other' },
]

const GAME_CATEGORIES = [
  { id: 'slots', label: 'Slots' },
  { id: 'live_casino', label: 'Live Casino' },
  { id: 'sports', label: 'Sports' },
  { id: 'table_games', label: 'Table Games' },
  { id: 'virtual_games', label: 'Virtual Games' },
  { id: 'lottery', label: 'Lottery' },
]

const BonusFormModal = ({ show, onClose, onSave, bonus, categories = [] }) => {
  // console.log("BonusFormModal categories:", categories , "bonus:", bonus, "show:", show , "onClose:", onClose, "onSave:", onSave);
  const [form, setForm] = useState({
    name: '',
    description: '',
    bonusType: '',
    level1Percent: '',
    level2Percent: '',
    level3Percent: '',
    img: '',
    percentage: '',
    fixedAmount: '',
    minDeposit: '',
    maxBonus: '',
    minTurnover: '',
    maxTurnover: '',
    wageringRequirement: 1,
    validDays: '',
    eligibleGames: [],
    cetegory: [],
    isActive: true,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  })

  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  // Initialize step fields as array of objects
  const [stepFields, setStepFields] = useState({
    howtoClaim: [{ id: 1, order: 1, value: '' }],
    howtoUse: [{ id: 1, order: 1, value: '' }],
    terms: [{ id: 1, order: 1, value: '' }],
  })

  // Generate unique ID for steps
  const generateId = () => Date.now() + Math.random()

  useEffect(() => {
    if (bonus) {
      // Set form data
      const formData = {
        ...bonus,
        startDate: bonus.startDate ? new Date(bonus.startDate).toISOString().split('T')[0] : '',
        endDate: bonus.endDate ? new Date(bonus.endDate).toISOString().split('T')[0] : '',
      }

      setForm(formData)

      // Initialize step fields from existing data
      const initializeSteps = (section, data) => {
        if (!data) return [{ id: generateId(), order: 1, value: '' }]

        try {
          // If data is an object (from backend)
          if (typeof data === 'object' && !Array.isArray(data)) {
            const steps = Object.entries(data)
              .filter(([key]) => key.startsWith('step'))
              .sort(([a], [b]) => {
                const numA = parseInt(a.replace('step', '')) || 0
                const numB = parseInt(b.replace('step', '')) || 0
                return numA - numB
              })
              .map(([, value], index) => ({
                id: generateId(),
                order: index + 1,
                value: String(value || ''),
              }))

            return steps.length > 0 ? steps : [{ id: generateId(), order: 1, value: '' }]
          }

          // If data is already an array
          if (Array.isArray(data)) {
            return data.map((item, index) => ({
              id: generateId(),
              order: index + 1,
              value: typeof item === 'object' ? item.value || '' : String(item || ''),
            }))
          }
        } catch (err) {
          console.error(`Error parsing ${section}:`, err)
        }

        return [{ id: generateId(), order: 1, value: '' }]
      }

      setStepFields({
        howtoClaim: initializeSteps('howtoClaim', bonus.howtoClaim),
        howtoUse: initializeSteps('howtoUse', bonus.howtoUse),
        terms: initializeSteps('terms', bonus.terms),
      })
    } else {
      // Reset form for new bonus
      resetForm()
    }
  }, [bonus])

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      bonusType: '',
      level1Percent: '',
      level2Percent: '',
      level3Percent: '',
      img: '',
      percentage: '',
      fixedAmount: '',
      minDeposit: '',
      maxBonus: '',
      minTurnover: '',
      maxTurnover: '',
      wageringRequirement: 1,
      validDays: '',
      eligibleGames: [],
      cetegory: [],
      isActive: true,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
    })

    setStepFields({
      howtoClaim: [{ id: generateId(), order: 1, value: '' }],
      howtoUse: [{ id: generateId(), order: 1, value: '' }],
      terms: [{ id: generateId(), order: 1, value: '' }],
    })

    setError('')
  }

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const addStep = (section) => {
    const steps = stepFields[section]
    const newStep = {
      id: generateId(),
      order: steps.length + 1,
      value: '',
    }

    setStepFields((prev) => ({
      ...prev,
      [section]: [...steps, newStep],
    }))
  }

  const removeStep = (section, index) => {
    const steps = stepFields[section]
    if (steps.length <= 1) return

    const updatedSteps = steps
      .filter((_, i) => i !== index)
      .map((step, idx) => ({ ...step, order: idx + 1 }))

    setStepFields((prev) => ({
      ...prev,
      [section]: updatedSteps,
    }))
  }

  const updateStep = (section, index, value) => {
    const updatedSteps = [...stepFields[section]]
    updatedSteps[index] = { ...updatedSteps[index], value }
    setStepFields((prev) => ({ ...prev, [section]: updatedSteps }))
  }

  const moveStep = (section, index, direction) => {
    const steps = stepFields[section]
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === steps.length - 1)
    ) {
      return
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1
    const updatedSteps = [...steps]

    // Swap steps
    ;[updatedSteps[index], updatedSteps[newIndex]] = [updatedSteps[newIndex], updatedSteps[index]]

    // Update order numbers
    updatedSteps.forEach((step, idx) => {
      step.order = idx + 1
    })

    setStepFields((prev) => ({
      ...prev,
      [section]: updatedSteps,
    }))
  }

  const handleGameSelection = (gameId) => {
    setForm((prev) => {
      const exists = prev.eligibleGames.includes(gameId)
      return {
        ...prev,
        eligibleGames: exists
          ? prev.eligibleGames.filter((g) => g !== gameId)
          : [...prev.eligibleGames, gameId],
      }
    })
  }

  const handleCategorySelection = (categoryName) => {
    setForm((prev) => {
      const exists = prev.cetegory.includes(categoryName)
      return {
        ...prev,
        cetegory: exists
          ? prev.cetegory.filter((c) => c !== categoryName)
          : [...prev.cetegory, categoryName],
      }
    })
  }

  const showFields = () => {
    const type = form.bonusType
    return {
      showPercentage: [
        'deposit',
        'dailyRebate',
        'weeklyBonus',
        'vip',
        'referralRebate',
        'signup',
        'firstDeposit',
        'welcomeBonus',
      ].includes(type),
      showFixedAmount: ['deposit', 'firstDeposit', 'welcomeBonus', 'birthday'].includes(type),
      showMinDeposit: ['deposit', 'firstDeposit'].includes(type),
      showReferralLevels: ['referral', 'referralRebate'].includes(type),
      showWagering: [
        'deposit',
        'dailyRebate',
        'weeklyBonus',
        'vip',
        'referralRebate',
        'signup',
        'firstDeposit',
        'welcomeBonus',
      ].includes(type),
      showValidDays: [
        'deposit',
        'dailyRebate',
        'weeklyBonus',
        'vip',
        'firstDeposit',
        'welcomeBonus',
        'birthday',
      ].includes(type),
      showTurnover: ['deposit', 'firstDeposit', 'welcomeBonus'].includes(type),
      showMaxBonus: [
        'deposit',
        'firstDeposit',
        'welcomeBonus',
        'weeklyBonus',
        'dailyRebate',
      ].includes(type),
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, GIF)')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB')
      return
    }

    setUploading(true)
    try {
      // Simulate upload - replace with actual upload service
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const imageUrl = URL.createObjectURL(file)
      handleChange('img', imageUrl)
      setError('')
    } catch (err) {
      setError('Failed to upload image. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  // const processStepData = (steps) => {
  //   const processed = {};
  //   steps.forEach((step) => {
  //     if (step.value && step.value.trim()) {
  //       processed[`step${step.order}`] = step.value.trim();
  //     }
  //   });
  //   return Object.keys(processed).length > 0 ? processed : undefined;
  // };

  const processStepData = (steps) => {
    const processed = {}
    steps.forEach((step) => {
      if (step.value && step.value.trim()) {
        processed[`step${step.order}`] = step.value.trim()
      }
    })
    return Object.keys(processed).length > 0 ? processed : undefined
  }

  const validateForm = () => {
    if (!form.name.trim()) return 'Bonus name is required'
    if (!form.description.trim()) return 'Description is required'
    if (!form.bonusType) return 'Bonus type is required'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

    // Prepare step data
    const howtoClaimData = processStepData(stepFields.howtoClaim)
    const howtoUseData = processStepData(stepFields.howtoUse)
    const termsData = processStepData(stepFields.terms)

    // Create final bonus data
    const bonusData = {
      _id: bonus ? bonus._id : undefined,
      name: form.name.trim(),
      description: form.description.trim(),
      bonusType: form.bonusType,
      ...(howtoClaimData.length > 0 && { howtoClaim: howtoClaimData }),
      ...(howtoUseData.length > 0 && { howtoUse: howtoUseData }),
      ...(termsData.length > 0 && { terms: termsData }),
      ...(form.level1Percent !== '' && { level1Percent: parseFloat(form.level1Percent) }),
      ...(form.level2Percent !== '' && { level2Percent: parseFloat(form.level2Percent) }),
      ...(form.level3Percent !== '' && { level3Percent: parseFloat(form.level3Percent) }),
      ...(form.img && { img: form.img }),
      ...(form.percentage !== '' && { percentage: parseFloat(form.percentage) }),
      ...(form.fixedAmount !== '' && { fixedAmount: parseFloat(form.fixedAmount) }),
      ...(form.minDeposit !== '' && { minDeposit: parseFloat(form.minDeposit) }),
      ...(form.maxBonus !== '' && { maxBonus: parseFloat(form.maxBonus) }),
      ...(form.minTurnover !== '' && { minTurnover: parseFloat(form.minTurnover) }),
      ...(form.maxTurnover !== '' && { maxTurnover: parseFloat(form.maxTurnover) }),
      ...(form.wageringRequirement && {
        wageringRequirement: parseFloat(form.wageringRequirement),
      }),
      ...(form.validDays !== '' && { validDays: parseInt(form.validDays) }),
      ...(form.eligibleGames.length > 0 && { eligibleGames: form.eligibleGames }),
      ...(form.cetegory.length > 0 && { cetegory: form.cetegory }),
      isActive: form.isActive,
      startDate: form.startDate,
      ...(form.endDate && { endDate: form.endDate }),
    }

    try {
      await onSave(bonusData)
      if (!bonus) {
        resetForm()
      }
    } catch (err) {
      setError(err.message || 'Failed to save bonus')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const fields = showFields()

  const renderStepFields = (title, section) => {
    const steps = stepFields[section]

    return (
      <CCard className="mb-3">
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0">{title}</h6>
          <CButton size="sm" color="primary" onClick={() => addStep(section)} disabled={loading}>
            <CIcon icon={cilPlus} className="me-1" />
            Add Step
          </CButton>
        </CCardHeader>
        <CCardBody>
          {steps.length === 0 ? (
            <div className="text-center py-3 text-muted">
              No steps added yet. Click "Add Step" to create one.
            </div>
          ) : (
            steps.map((step, index) => (
              <div key={step.id} className="mb-3 step-item">
                <div className="d-flex align-items-start gap-2">
                  <div className="d-flex flex-column gap-1">
                    <CButton
                      size="sm"
                      color="secondary"
                      variant="outline"
                      disabled={index === 0 || loading}
                      onClick={() => moveStep(section, index, 'up')}
                      title="Move up"
                    >
                      <CIcon icon={cilArrowThickTop} />
                    </CButton>
                    <CButton
                      size="sm"
                      color="secondary"
                      variant="outline"
                      disabled={index === steps.length - 1 || loading}
                      onClick={() => moveStep(section, index, 'down')}
                      title="Move down"
                    >
                      <CIcon icon={cilArrowThickBottom} />
                    </CButton>
                  </div>

                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center mb-1">
                      <CFormLabel className="mb-0 me-2 fw-bold">Step {step.order}:</CFormLabel>
                      <small className={`text-${step.value.trim() ? 'success' : 'muted'}`}>
                        {step.value.trim() ? `${step.value.length} characters` : 'Empty'}
                      </small>
                    </div>
                    <CFormInput
                      placeholder={`Enter ${title.toLowerCase()} step ${step.order}...`}
                      value={step.value}
                      onChange={(e) => updateStep(section, index, e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  {steps.length > 1 && (
                    <CButton
                      color="danger"
                      size="sm"
                      variant="outline"
                      onClick={() => removeStep(section, index)}
                      disabled={loading}
                      title="Remove step"
                      className="mt-3"
                    >
                      <CIcon icon={cilMinus} />
                    </CButton>
                  )}
                </div>
              </div>
            ))
          )}

          {steps.some((step) => step.value.trim()) && (
            <div className="mt-3">
              <h6>Preview:</h6>
              <div className="bg-green p-3 rounded">
                {steps
                  .filter((step) => step.value.trim())
                  .map((step) => (
                    <div key={`preview-${step.id}`} className="mb-2">
                      <strong>Step {step.order}:</strong> {step.value}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </CCardBody>
        {steps.length > 0 && (
          <CCardFooter>
            <div className="d-flex justify-content-between align-items-center">
              <small className="text-muted">
                {steps.filter((step) => step.value.trim()).length} of {steps.length} steps filled
              </small>
              <CButton
                size="sm"
                color="secondary"
                variant="ghost"
                onClick={() => addStep(section)}
                disabled={loading}
              >
                <CIcon icon={cilPlus} className="me-1" />
                Add Another Step
              </CButton>
            </div>
          </CCardFooter>
        )}
      </CCard>
    )
  }

  return (
    <CModal visible={show} onClose={handleClose} size="xl" scrollable backdrop="static">
      <CModalHeader closeButton>
        <CModalTitle>{bonus ? 'Edit Bonus' : 'Create New Bonus'}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        {error && (
          <CAlert color="danger" dismissible onClose={() => setError('')}>
            {error}
          </CAlert>
        )}

        <CForm onSubmit={handleSubmit} id="bonus-form">
          {/* Basic Information */}
          <CCard className="mb-3">
            <CCardBody>
              <h5 className="mb-4">Basic Information</h5>
              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormInput
                    label="Bonus Name *"
                    value={form.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                    disabled={loading}
                    placeholder="Enter bonus name"
                  />
                </CCol>
                <CCol md={6}>
                  <CFormSelect
                    label="Bonus Type *"
                    value={form.bonusType}
                    onChange={(e) => handleChange('bonusType', e.target.value)}
                    required
                    disabled={loading}
                  >
                    <option value="">Select Bonus Type</option>
                    {bonusTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
              </CRow>

              <CFormTextarea
                label="Description *"
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                className="mb-3"
                required
                disabled={loading}
                placeholder="Enter detailed description of the bonus"
              />

              {/* Image Upload */}
              <div className="mb-3">
                <CFormLabel>Bonus Image</CFormLabel>
                <div className="d-flex align-items-center gap-3">
                  <CFormInput
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={loading || uploading}
                    className="flex-grow-1"
                  />
                  {uploading && <CSpinner size="sm" />}
                </div>
                {form.img && (
                  <div className="mt-2 d-flex align-items-center">
                    <img
                      src={form.img}
                      alt="Bonus preview"
                      style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'cover' }}
                      className="img-thumbnail"
                    />
                    <CButton
                      color="danger"
                      size="sm"
                      className="ms-2"
                      onClick={() => handleChange('img', '')}
                      disabled={loading}
                    >
                      Remove
                    </CButton>
                  </div>
                )}
                <small className="text-muted">Recommended: 800x400px, JPG/PNG, max 5MB</small>
              </div>
            </CCardBody>
          </CCard>

          {/* Bonus Amount Configuration */}
          {form.bonusType && (
            <CCard className="mb-3">
              <CCardBody>
                <h5 className="mb-4">Bonus Configuration</h5>
                <CRow className="mb-3">
                  {fields.showPercentage && (
                    <CCol md={4}>
                      <CFormInput
                        type="number"
                        step="0.01"
                        min="0"
                        max="1000"
                        label="Percentage %"
                        value={form.percentage}
                        onChange={(e) => handleChange('percentage', e.target.value)}
                        placeholder="e.g., 10"
                        disabled={loading}
                      />
                    </CCol>
                  )}
                  {fields.showFixedAmount && (
                    <CCol md={4}>
                      <CFormInput
                        type="number"
                        step="0.01"
                        min="0"
                        label="Fixed Amount ($)"
                        value={form.fixedAmount}
                        onChange={(e) => handleChange('fixedAmount', e.target.value)}
                        placeholder="e.g., 100"
                        disabled={loading}
                      />
                    </CCol>
                  )}
                  {fields.showMinDeposit && (
                    <CCol md={4}>
                      <CFormInput
                        type="number"
                        step="0.01"
                        min="0"
                        label="Minimum Deposit ($)"
                        value={form.minDeposit}
                        onChange={(e) => handleChange('minDeposit', e.target.value)}
                        placeholder="e.g., 20"
                        disabled={loading}
                      />
                    </CCol>
                  )}
                </CRow>

                <CRow className="mb-3">
                  {fields.showMaxBonus && (
                    <CCol md={4}>
                      <CFormInput
                        type="number"
                        step="0.01"
                        min="0"
                        label="Maximum Bonus ($)"
                        value={form.maxBonus}
                        onChange={(e) => handleChange('maxBonus', e.target.value)}
                        placeholder="e.g., 500"
                        disabled={loading}
                      />
                    </CCol>
                  )}
                  {fields.showTurnover && (
                    <>
                      <CCol md={4}>
                        <CFormInput
                          type="number"
                          step="0.01"
                          min="0"
                          label="Minimum Turnover ($)"
                          value={form.minTurnover}
                          onChange={(e) => handleChange('minTurnover', e.target.value)}
                          placeholder="e.g., 100"
                          disabled={loading}
                        />
                      </CCol>
                      <CCol md={4}>
                        <CFormInput
                          type="number"
                          step="0.01"
                          min="0"
                          label="Maximum Turnover ($)"
                          value={form.maxTurnover}
                          onChange={(e) => handleChange('maxTurnover', e.target.value)}
                          placeholder="e.g., 5000"
                          disabled={loading}
                        />
                      </CCol>
                    </>
                  )}
                </CRow>

                {/* Referral Levels */}
                {fields.showReferralLevels && (
                  <div className="mt-4">
                    <h6 className="mb-3">Referral Commission Levels</h6>
                    <CRow>
                      <CCol md={4}>
                        <CFormInput
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          label="Level 1 Percent (%)"
                          value={form.level1Percent}
                          onChange={(e) => handleChange('level1Percent', e.target.value)}
                          placeholder="e.g., 0.2"
                          disabled={loading}
                        />
                      </CCol>
                      <CCol md={4}>
                        <CFormInput
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          label="Level 2 Percent (%)"
                          value={form.level2Percent}
                          onChange={(e) => handleChange('level2Percent', e.target.value)}
                          placeholder="e.g., 0.07"
                          disabled={loading}
                        />
                      </CCol>
                      <CCol md={4}>
                        <CFormInput
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          label="Level 3 Percent (%)"
                          value={form.level3Percent}
                          onChange={(e) => handleChange('level3Percent', e.target.value)}
                          placeholder="e.g., 0.03"
                          disabled={loading}
                        />
                      </CCol>
                    </CRow>
                  </div>
                )}
              </CCardBody>
            </CCard>
          )}

          {/* Requirements */}
          {(fields.showWagering || fields.showValidDays) && (
            <CCard className="mb-3">
              <CCardBody>
                <h5 className="mb-4">Requirements</h5>
                <CRow className="mb-3">
                  {fields.showWagering && (
                    <CCol md={6}>
                      <CFormInput
                        type="number"
                        step="0.1"
                        min="0"
                        label="Wagering Requirement (X times)"
                        value={form.wageringRequirement}
                        onChange={(e) => handleChange('wageringRequirement', e.target.value)}
                        disabled={loading}
                      />
                    </CCol>
                  )}
                  {fields.showValidDays && (
                    <CCol md={6}>
                      <CFormInput
                        type="number"
                        min="0"
                        label="Valid Days"
                        value={form.validDays}
                        onChange={(e) => handleChange('validDays', e.target.value)}
                        placeholder="e.g., 30"
                        disabled={loading}
                      />
                    </CCol>
                  )}
                </CRow>
              </CCardBody>
            </CCard>
          )}

          {/* Eligible Games */}
          <CCard className="mb-3">
            <CCardBody>
              <h5 className="mb-3">Eligible Games</h5>
              <div className="d-flex flex-wrap gap-2 mb-3">
                {GAME_CATEGORIES.map((game) => (
                  <CButton
                    key={game.id}
                    size="sm"
                    color={form.eligibleGames.includes(game.id) ? 'primary' : 'secondary'}
                    variant="outline"
                    onClick={() => handleGameSelection(game.id)}
                    className="game-tag"
                    disabled={loading}
                  >
                    {game.label}
                    {form.eligibleGames.includes(game.id) && <span className="ms-1">✓</span>}
                  </CButton>
                ))}
              </div>
              {form.eligibleGames.length > 0 && (
                <div className="alert alert-info py-2">
                  <small>
                    <strong>Selected:</strong>{' '}
                    {form.eligibleGames
                      .map((id) => GAME_CATEGORIES.find((g) => g.id === id)?.label || id)
                      .join(', ')}
                  </small>
                </div>
              )}
            </CCardBody>
          </CCard>

          {/* Categories */}
          {categories.length > 0 && (
            <CCard className="mb-3">
              <CCardBody>
                <h5 className="mb-3">Categories</h5>
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {categories.map((category) => (
                    <CButton
                      key={category._id || category.name}
                      size="sm"
                      color={form.cetegory.includes(category.name) ? 'primary' : 'secondary'}
                      variant="outline"
                      onClick={() => handleCategorySelection(category.name)}
                      disabled={loading}
                    >
                      {category.name}
                      {form.cetegory.includes(category.name) && <span className="ms-1">✓</span>}
                    </CButton>
                  ))}
                </div>
              </CCardBody>
            </CCard>
          )}

          {/* Step-by-step Instructions */}
          <h5 className="mt-4 mb-3">Instructions & Terms</h5>
          {renderStepFields('How to Claim', 'howtoClaim')}
          {renderStepFields('How to Use', 'howtoUse')}
          {renderStepFields('Terms & Conditions', 'terms')}

          {/* Validity Period */}
          <CCard className="mb-3">
            <CCardBody>
              <h5 className="mb-4">Validity Period</h5>
              <CRow>
                <CCol md={6}>
                  <CFormInput
                    type="date"
                    label="Start Date"
                    value={form.startDate}
                    onChange={(e) => handleChange('startDate', e.target.value)}
                    required
                    disabled={loading}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormInput
                    type="date"
                    label="End Date (Optional)"
                    value={form.endDate}
                    onChange={(e) => handleChange('endDate', e.target.value)}
                    disabled={loading}
                    min={form.startDate}
                  />
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>

          {/* Status */}
          <div className="mb-3">
            <CFormSwitch
              label="Active Bonus"
              checked={form.isActive}
              onChange={(e) => handleChange('isActive', e.target.checked)}
              className="mt-2"
              disabled={loading}
            />
          </div>
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={handleClose} disabled={loading}>
          Cancel
        </CButton>
        <CButton color="primary" onClick={handleSubmit} disabled={loading} form="bonus-form">
          {loading ? (
            <>
              <CSpinner size="sm" className="me-2" />
              {bonus ? 'Updating...' : 'Creating...'}
            </>
          ) : bonus ? (
            'Update Bonus'
          ) : (
            'Create Bonus'
          )}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default BonusFormModal
