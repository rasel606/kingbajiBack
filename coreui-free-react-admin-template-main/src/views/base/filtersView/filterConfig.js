// const filterConfig = [
//   { key: "userId", type: "text", label: "User ID", placeholder: "Enter user ID" },
//   { key: "amount", type: "number", label: "Amount", placeholder: "Minimum amount" },
//   {
//     key: "gateway_name",
//     type: "select",
//     label: "Gateway",
//     options: ["PayPal", "Stripe", "Bank Transfer", "Crypto"]
//   },
//   {
//     key: "status",
//     type: "select",
//     label: "Status",
//     options: [
//       { value: "0", label: "Pending" },
//       { value: "1", label: "Approved" },
//       { value: "2", label: "Rejected" }
//     ]
//   },
//   { key: "startDate", type: "date", label: "Start Date" },
//   { key: "endDate", type: "date", label: "End Date" },
// ];

// export default filterConfig;

// filterConfig.js

const filterConfig = [
  { key: 'userId', type: 'text', label: 'User ID', placeholder: 'Enter user ID' },
  { key: 'amount', type: 'number', label: 'Amount', placeholder: 'Minimum amount' },
  {
    key: 'gateway_name',
    type: 'select',
    label: 'Gateway',
    options: ['Bkash', 'Rocket', 'Nagad', 'Upay'],
  },
  {
    key: 'status',
    type: 'select',
    label: 'Status',
    options: [
      { value: '0', label: 'Pending' },
      { value: '1', label: 'Approved' },
      { value: '2', label: 'Rejected' },
    ],
  },
  { key: 'startDate', type: 'date', label: 'Start Date' },
  { key: 'endDate', type: 'date', label: 'End Date' },
]

export default filterConfig
