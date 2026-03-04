// import React from 'react'
// import { CCard, CCardBody, CCol, CCardHeader, CRow } from '@coreui/react'
// import {
//   CChartBar,
//   CChartDoughnut,
//   CChartLine,
//   CChartPie,
//   CChartPolarArea,
//   CChartRadar,
// } from '@coreui/react-chartjs'
// import { DocsLink } from 'src/components'

// const Charts = () => {
//   const random = () => Math.round(Math.random() * 100)

//   return (
//     <CRow>
//       <CCol xs={12}></CCol>
//       <CCol xs={6}>
//         <CCard className="mb-4">
//           <CCardHeader>
//             Bar Chart <DocsLink name="chart" />
//           </CCardHeader>
//           <CCardBody>
//             <CChartBar
//               data={{
//                 labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
//                 datasets: [
//                   {
//                     label: 'GitHub Commits',
//                     backgroundColor: '#f87979',
//                     data: [40, 20, 12, 39, 10, 40, 39, 80, 40],
//                   },
//                 ],
//               }}
//               labels="months"
//             />
//           </CCardBody>
//         </CCard>
//       </CCol>
//       <CCol xs={6}>
//         <CCard className="mb-4">
//           <CCardHeader>
//             Line Chart <DocsLink name="chart" />
//           </CCardHeader>
//           <CCardBody>
//             <CChartLine
//               data={{
//                 labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
//                 datasets: [
//                   {
//                     label: 'My First dataset',
//                     backgroundColor: 'rgba(220, 220, 220, 0.2)',
//                     borderColor: 'rgba(220, 220, 220, 1)',
//                     pointBackgroundColor: 'rgba(220, 220, 220, 1)',
//                     pointBorderColor: '#fff',
//                     data: [random(), random(), random(), random(), random(), random(), random()],
//                   },
//                   {
//                     label: 'My Second dataset',
//                     backgroundColor: 'rgba(151, 187, 205, 0.2)',
//                     borderColor: 'rgba(151, 187, 205, 1)',
//                     pointBackgroundColor: 'rgba(151, 187, 205, 1)',
//                     pointBorderColor: '#fff',
//                     data: [random(), random(), random(), random(), random(), random(), random()],
//                   },
//                 ],
//               }}
//             />
//           </CCardBody>
//         </CCard>
//       </CCol>
//       <CCol xs={6}>
//         <CCard className="mb-4">
//           <CCardHeader>
//             Doughnut Chart <DocsLink name="chart" />
//           </CCardHeader>
//           <CCardBody>
//             <CChartDoughnut
//               data={{
//                 labels: ['VueJs', 'EmberJs', 'ReactJs', 'AngularJs'],
//                 datasets: [
//                   {
//                     backgroundColor: ['#41B883', '#E46651', '#00D8FF', '#DD1B16'],
//                     data: [40, 20, 80, 10],
//                   },
//                 ],
//               }}
//             />
//           </CCardBody>
//         </CCard>
//       </CCol>
//       <CCol xs={6}>
//         <CCard className="mb-4">
//           <CCardHeader>
//             Pie Chart <DocsLink name="chart" />{' '}
//           </CCardHeader>
//           <CCardBody>
//             <CChartPie
//               data={{
//                 labels: ['Red', 'Green', 'Yellow'],
//                 datasets: [
//                   {
//                     data: [300, 50, 100],
//                     backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
//                     hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
//                   },
//                 ],
//               }}
//             />
//           </CCardBody>
//         </CCard>
//       </CCol>
//       <CCol xs={6}>
//         <CCard className="mb-4">
//           <CCardHeader>
//             Polar Area Chart
//             <DocsLink name="chart" />
//           </CCardHeader>
//           <CCardBody>
//             <CChartPolarArea
//               data={{
//                 labels: ['Red', 'Green', 'Yellow', 'Grey', 'Blue'],
//                 datasets: [
//                   {
//                     data: [11, 16, 7, 3, 14],
//                     backgroundColor: ['#FF6384', '#4BC0C0', '#FFCE56', '#E7E9ED', '#36A2EB'],
//                   },
//                 ],
//               }}
//             />
//           </CCardBody>
//         </CCard>
//       </CCol>
//       <CCol xs={6}>
//         <CCard className="mb-4">
//           <CCardHeader>
//             Radar Chart <DocsLink name="chart" />
//           </CCardHeader>
//           <CCardBody>
//             <CChartRadar
//               data={{
//                 labels: [
//                   'Eating',
//                   'Drinking',
//                   'Sleeping',
//                   'Designing',
//                   'Coding',
//                   'Cycling',
//                   'Running',
//                 ],
//                 datasets: [
//                   {
//                     label: 'My First dataset',
//                     backgroundColor: 'rgba(220, 220, 220, 0.2)',
//                     borderColor: 'rgba(220, 220, 220, 1)',
//                     pointBackgroundColor: 'rgba(220, 220, 220, 1)',
//                     pointBorderColor: '#fff',
//                     pointHighlightFill: '#fff',
//                     pointHighlightStroke: 'rgba(220, 220, 220, 1)',
//                     data: [65, 59, 90, 81, 56, 55, 40],
//                   },
//                   {
//                     label: 'My Second dataset',
//                     backgroundColor: 'rgba(151, 187, 205, 0.2)',
//                     borderColor: 'rgba(151, 187, 205, 1)',
//                     pointBackgroundColor: 'rgba(151, 187, 205, 1)',
//                     pointBorderColor: '#fff',
//                     pointHighlightFill: '#fff',
//                     pointHighlightStroke: 'rgba(151, 187, 205, 1)',
//                     data: [28, 48, 40, 19, 96, 27, 100],
//                   },
//                 ],
//               }}
//             />
//           </CCardBody>
//         </CCard>
//       </CCol>
//     </CRow>
//   )
// }

// export default Charts



import React from 'react'
import { CChartLine } from '@coreui/react-chartjs'
import { getStyle } from '@coreui/utils'

const MainChart = ({ stats }) => {
  const random = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)

  // Sample chart data - replace with actual data from your API
  const defaultData = Array.from({ length: 12 }, () => random(50, 200))

  const chartData = stats?.monthlyData || defaultData

  return (
    <CChartLine
      style={{ height: '300px', marginTop: '40px' }}
      data={{
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Deposits',
            backgroundColor: `rgba(${getStyle('--cui-info-rgb')}, 0.1)`,
            borderColor: getStyle('--cui-info'),
            pointHoverBackgroundColor: getStyle('--cui-info'),
            borderWidth: 2,
            data: chartData,
            fill: true,
          },
          {
            label: 'Withdrawals',
            backgroundColor: 'transparent',
            borderColor: getStyle('--cui-success'),
            pointHoverBackgroundColor: getStyle('--cui-success'),
            borderWidth: 2,
            data: chartData.map(value => value * 0.7), // Sample data
          },
        ],
      }}
      options={{
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
          },
        },
        scales: {
          x: {
            grid: {
              color: getStyle('--cui-border-color-translucent'),
              drawOnChartArea: false,
            },
            ticks: {
              color: getStyle('--cui-body-color'),
            },
          },
          y: {
            beginAtZero: true,
            border: {
              color: getStyle('--cui-border-color-translucent'),
            },
            grid: {
              color: getStyle('--cui-border-color-translucent'),
            },
            ticks: {
              color: getStyle('--cui-body-color'),
            },
          },
        },
      }}
    />
  )
}

export default MainChart