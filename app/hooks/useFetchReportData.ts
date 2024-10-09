// import { useFetchCashFlow } from './useFetchCashFlow';
// import { useFetchCategories } from './useFetchCategories';
// import dayjs from 'dayjs';
// import { CashFlow } from '../types/master';

// export const useFetchReportData = (
//   selectedCabang: number | null,
//   cashFlowType: 'incoming' | 'outgoing' | 'both',
//   selectedCategories: string[],
//   periodType: 'monthly' | 'yearly',
//   selectedPeriod: any
// ) => {
//   let cashFlowData: CashFlow[] = [];

//   // Handle the 'both' case by fetching both 'incoming' and 'outgoing' data separately
//   if (cashFlowType === 'both') {
//     const { data: incomingData } = useFetchCashFlow('incoming');
//     const { data: outgoingData } = useFetchCashFlow('outgoing');
//     cashFlowData = [...incomingData, ...outgoingData];
//   } else {
//     // For 'incoming' or 'outgoing' type, fetch directly
//     const { data } = useFetchCashFlow(cashFlowType);
//     cashFlowData = data;
//   }

//   // Fetch categories for mapping
//   // const { categories } = useFetchCategories();

//   // Map category_id to category name
//   const categoryNameMap: { [key: string]: string } = categories.reduce((acc, category) => {
//     acc[category.id] = category.name;
//     return acc;
//   }, {} as { [key: string]: string });

//   // Debug log: Check the fetched cash flow data
//   console.log('Raw Cash Flow Data:', cashFlowData);

//   // Filter and map data based on the selected criteria
//   const filteredData = cashFlowData
//     .filter((flow: CashFlow) => {
//       const matchesCabang = !selectedCabang || flow.cabang_id === selectedCabang;
//       const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(flow.category_id);
//       const matchesPeriod = periodType === 'monthly'
//         ? dayjs(flow.date).isSame(selectedPeriod, 'month')
//         : dayjs(flow.date).isSame(selectedPeriod, 'year');

//       return matchesCabang && matchesCategory && matchesPeriod;
//     })
//     .map((flow: CashFlow) => ({
//       id: flow.id, // Unique identifier
//       date: flow.date,
//       category: categoryNameMap[flow.category_id] || 'Unknown Category', // Map category_id to name
//       amount: parseFloat(flow.amount), // Convert `amount` to a number
//     }));

//   console.log('Filtered Data:', filteredData);

//   // Calculate the total amount
//   const total = filteredData.reduce((sum, flow) => sum + flow.amount, 0);

//   return { filteredData, total };
// };
