// import React, { ChangeEvent, FormEvent, useState } from "react";

// interface RoastResult {
//   chosenPlayerName: string;
//   roastMessage: string;
// }

// export const ExcuseForm = () => {
//   //   const [playerName, setPlayerName] = useState<string>(""); // Тоглогчийн нэрийг хадгалах state
//   const [reason, setReason] = useState<string>("");
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string>("");
//   const [roastResult, setRoastResult] = useState<RoastResult | null>(null); // AI-ийн хариултыг хадгалах
//   const [showRoastModal, setShowRoastModal] = useState<boolean>(false); // Модалыг харуулах/нуух

//   const API_ROAST_URL = "http://localhost:4200/roast";

//   //   const handlePlayerNameChange = (e: ChangeEvent<HTMLInputElement>) => {
//   //     setPlayerName(e.target.value);
//   //   };

//   const handleReasonChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
//     setReason(e.target.value);
//   };

//   const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");
//     setRoastResult(null);
//     setShowRoastModal(false); // Өмнөх модалыг нуух

//     // if (!playerName.trim() || !reason.trim()) {
//     //   setError("Нэр болон шалтгаанаа заавал бөглөнө үү.");
//     //   setLoading(false);
//     //   return;
//     // }

//     try {
//       // Backend-ийн хүлээж буй формат руу өгөгдлийг бэлтгэх
//       // Бид ганц тоглогчийн мэдээллийг players массив дотор илгээнэ.
//       const submissionId = `client-${Date.now()}-${Math.random()
//         .toString(36)
//         .substring(2, 9)}`;
//       const playersData = [
//         {
//           reason: reason.trim(),
//         },
//       ];

//       const response = await fetch(API_ROAST_URL, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ reasons: playersData }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || "Серверээс алдаа гарлаа");
//       }

//       // Backend-аас ирж байгаа summary-г шууд roastResult-д хадгалах
//       const data: RoastResult = await response.json();
//       setRoastResult(data); // Modal-д харуулах
//       setShowRoastModal(true);
//       setReason("");
//     } catch (err: any) {
//       setError(err.message || "Алдаа гарлаа");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCloseModal = () => {
//     setShowRoastModal(false);
//     setRoastResult(null); // Хариуг цэвэрлэх
//     // setPlayerName(""); // Нэрийг цэвэрлэх
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center p-4 sm:p-6">
//       <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-md">
//         <h2 className="text-3xl font-extrabold text-center text-blue-700 mb-6">
//           Шалтгаан Бичих Хэсэг 📝
//         </h2>
//         <p className="text-center text-gray-600 mb-8">
//           Яагаад төлбөрөө төлөхгүй байх шалтаг аа бичээд илгээнэ үү! 😅
//         </p>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* <div>
//             <input
//               type="text"
//               className="w-full p-3 border-2 border-blue-200 rounded-xl focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-gray-800 placeholder-gray-400 shadow-sm"
//               placeholder="Нэрээ оруулна уу"
//               value={playerName}
//               onChange={handlePlayerNameChange}
//               required
//               disabled={loading}
//             />
//           </div> */}
//           <div>
//             <textarea
//               className="w-full p-3 border-2 border-blue-200 rounded-xl focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200 resize-none h-28 sm:h-32 text-gray-800 placeholder-gray-400 shadow-sm"
//               placeholder="Яагаад мөнгө төлөхгүй байх шалтаг аа бич хэхэ..."
//               value={reason}
//               onChange={handleReasonChange}
//               required
//               disabled={loading}
//             />
//           </div>
//           <button
//             type="submit"
//             disabled={loading}
//             className="group w-full relative"
//           >
//             <div className="absolute inset-0 bg-blue-700 rounded-xl transform translate-y-1 group-hover:translate-y-0.5 transition-transform duration-150"></div>
//             <div className="relative bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 sm:py-4 px-6 rounded-xl shadow-lg transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
//               {loading ? (
//                 <span className="flex items-center justify-center">
//                   <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
//                   Илгээж байна...
//                 </span>
//               ) : (
//                 "Шалтгаан илгээх"
//               )}
//             </div>
//           </button>
//           {error && (
//             <div className="bg-yellow-100 border-2 border-yellow-300 rounded-xl p-3 sm:p-4 text-center shadow-sm mt-4">
//               <p className="text-yellow-800 font-semibold">{error}</p>
//             </div>
//           )}
//         </form>

//         {/* Custom Roast Result Modal */}
//         {showRoastModal && roastResult && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//             <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl max-w-sm w-full text-center transform scale-100 animate-fade-in">
//               <h3 className="text-2xl font-bold text-green-700 mb-4">
//                 💰 Төлбөр төлөгч сонгогдлоо! 💰
//               </h3>
//               <p className="text-xl text-gray-800 font-semibold mb-3">
//                 🎉{" "}
//                 <span className="text-blue-600">
//                   {roastResult.chosenPlayerName}
//                 </span>{" "}
//                 🎉 өнөөдөр төлбөрөө төлнө!
//               </p>
//               <p className="text-lg italic text-gray-700 mb-6">
//                 "{roastResult.roastMessage}"
//               </p>
//               <button
//                 onClick={handleCloseModal}
//                 className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-150"
//               >
//                 Хаах / Дахин оролдох
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };
