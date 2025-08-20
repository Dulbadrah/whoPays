// 'use client';
// import React, { useState } from 'react';
// import dynamic from 'next/dynamic';
 
// const Wheel = dynamic(() => import('react-custom-roulette').then(mod => mod.Wheel), { ssr: false });
 
// const Spin: React.FC = () => {
//   const [data, setData] = useState<{ option: string }[]>([
//     { option: 'Prize 1' },
//     { option: 'Prize 2' },
//     { option: 'Prize 3' },
//     { option: 'Prize 4' },
//   ]);
 
//   const [mustSpin, setMustSpin] = useState(false);
//   const [prizeNumber, setPrizeNumber] = useState(0);
//   const [newOption, setNewOption] = useState('');
 
//   const handleSpinClick = () => {
//     if (data.length === 0) {
//       alert('Нэмэлт шагнал байхгүй байна!');
//       return;
//     }
//     const newPrizeNumber = Math.floor(Math.random() * data.length);
//     setPrizeNumber(newPrizeNumber);
//     setMustSpin(true);
//   };
 
//   const handleAddOption = () => {
//     if (newOption.trim() === '') return;
//     setData([...data, { option: newOption.trim() }]);
//     setNewOption('');
//   };
 
//   const handleRemoveOption = (index: number) => {
//     setData(data.filter((_, i) => i !== index));
//   };
 
//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen p-5 bg-gradient-to-b from-blue-400 to-blue-600 font-sans">
//       <h1 className="mb-8 text-3xl font-bold text-white">Spin the Wheel 🎉</h1>
 
//       <div className="bg-white p-6 rounded-xl shadow-md max-w-md w-full text-center">
//         <Wheel
//           mustStartSpinning={mustSpin}
//           prizeNumber={prizeNumber}
//           data={data}
//           backgroundColors={['orange', 'blue']} // цэнхэр өнгөний хослол
//           textColors={['#ffffff']}
//           onStopSpinning={() => {
//             setMustSpin(false);
//             alert(`Та хожлоо: ${data[prizeNumber].option}!`);
//           }}
//         />
 
//         <button
//           onClick={handleSpinClick}
//           disabled={data.length === 0 || mustSpin}
//           className={`mt-5 px-6 py-3 text-lg font-semibold rounded-md transition-colors
//             ${data.length === 0 || mustSpin
//               ? 'bg-gray-400 cursor-not-allowed'
//               : 'bg-green-500 hover:bg-blue-700 cursor-pointer'}
//             text-white`}
//         >
//           Spin
//         </button>
//       </div>
 
//       <div className="mt-10 max-w-md w-full bg-white p-5 rounded-md shadow-md">
//         <h2 className="mb-4 text-xl font-semibold text-gray-800">Шагнал нэмэх / устгах</h2>
 
//         <div className="flex gap-3 mb-6">
//           <input
//             type="text"
//             value={newOption}
// onChange={(e) => setNewOption(e.target.value)}
//             placeholder="Шагналын нэр"
//             className="flex-grow px-4 py-2 border border-gray-300 rounded-md
//               focus:outline-none focus:ring-2 focus:ring-blue-500"
//             disabled={mustSpin}
//           />
//           <button
//             onClick={handleAddOption}
//             disabled={mustSpin}
//             className="w-[80px] px-5 py-2 bg-green-500 text-white rounded-md font-semibold
//               transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             Нэмэх
//           </button>
//         </div>
 
//         <ul className="max-h-36 overflow-y-auto divide-y divide-gray-200 text-left text-base">
// {data.map((item, index) => (
//             <li key={index} className="flex justify-between items-center py-2">
//               <span>{item.option}</span>
//               <button
//                 onClick={() => handleRemoveOption(index)}
//                 disabled={mustSpin}
//                 className="text-blue-600 font-bold text-xl hover:text-blue-800
//                   disabled:opacity-50 disabled:cursor-not-allowed"
//                 aria-label={`Устгах ${item.option}`}
//               >
//                 &times;
//               </button>
//             </li>
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// };
 
// export default Spin;



