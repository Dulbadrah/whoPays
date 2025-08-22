"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { io, Socket } from "socket.io-client";
import { ExcuseBackground } from "@/app/(game)/excuseSection/components/ExcuseBackground";

const Wheel = dynamic(
  () => import("react-custom-roulette").then((mod) => mod.Wheel),
  { ssr: false }
);

let socket: Socket;

const Spin: React.FC = () => {
  
  const [data, setData] = useState<{ option: string }[]>([]);
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [newOption, setNewOption] = useState("");

  useEffect(() => {
    socket = io("http://localhost:4200");

    // Receive wheel data from server
    socket.on("updateWheel", (wheelData: { option: string }[]) => {
      setData(wheelData);
    });
    // socket.on("gameSelected", (game: { name: string }) => {
    //   setOtherSelections((prev) => [...prev, game.name]);
    // });

    // Receive spin result
    socket.on("spinResult", ({ prizeNumber, option }) => {
      setPrizeNumber(prizeNumber);
      setMustSpin(true);
      setTimeout(() => {
        setMustSpin(false);
        alert(`Та хожлоо: ${option.option}!`);
      }, 4000); //
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSpinClick = () => {
    if (data.length === 0) return alert("Нэмэлт шагнал байхгүй байна!");
    socket.emit("spin");
  };

  const handleAddOption = () => {
    if (newOption.trim() === "") return;
    socket.emit("addOption", newOption.trim());
    setNewOption("");
  };

  const handleRemoveOption = (index: number) => {
    socket.emit("removeOption", index);
  };


  const backgroundColors = [
    "#2EB6FF",
    "#5CFF87",
    "#FCFF5C",
    "#E0BBE4",
    "#FFD7D7",
    "#CCE6FF",
  ];


  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-5 bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 font-sans">
      <ExcuseBackground />
      <h1 className="mb-8 text-3xl font-bold text-white">Spin the Wheel 🎉</h1>

      <div className="p-6 max-w-md w-full text-center">
        <Wheel
          mustStartSpinning={mustSpin}
          prizeNumber={prizeNumber}
          data={data}
          backgroundColors={backgroundColors}
          textColors={["#ffffff"]}
          onStopSpinning={() => {}}
        />
        <button
          onClick={handleSpinClick}
          disabled={data.length === 0 || mustSpin}
          className={`mt-5 px-6 py-3 text-lg font-semibold rounded-md transition-colors
            ${
              data.length === 0 || mustSpin
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-blue-700 cursor-pointer"
            } text-white`}
        >
          Spin
        </button>
      </div>

      <div className="mt-10 max-w-md w-full bg-white p-5 rounded-md shadow-md">
        <h2 className="mb-4 text-xl font-semibold text-gray-800">
          Шагнал нэмэх / устгах
        </h2>
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            placeholder="Шагналын нэр"
            className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={mustSpin}
          />
          <button
            onClick={handleAddOption}
            disabled={mustSpin}
            className="w-[80px] px-5 py-2 bg-green-500 text-white rounded-md font-semibold transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Нэмэх
          </button>
        </div>
        <ul className="max-h-36 overflow-y-auto divide-y divide-gray-200 text-left text-base">
          {data.map((item, index) => (
            <li key={index} className="flex justify-between items-center py-2">
              <span>{item.option}</span>
              <button
                onClick={() => handleRemoveOption(index)}
                disabled={mustSpin}
                className="text-blue-600 font-bold text-xl hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={`Устгах ${item.option}`}
              >
                &times;
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Spin;

// "use client";
// import { useEffect, useState } from "react";
// import { io, Socket } from "socket.io-client";
// import { useRouter } from "next/navigation";

// let socket: Socket;

// export default function GameSelector() {
//   const [selectedGame, setSelectedGame] = useState<string | null>(null);
//   const [otherSelections, setOtherSelections] = useState<string[]>([]);
//   const router = useRouter()

//   const games = ["Spin Wheel", "Excuse Section", "Tic Tac Toe"];

//   useEffect(() => {
//     socket = io("http://localhost:4200");

//     socket.on("gameSelected", (game: { name: string }) => {
//       router.push(`/game/${game.name.toLowerCase().replace(/\s+/g, '-')}`);
//       setOtherSelections((prev) => [...prev, game.name]);
//     });

//     return () => {
//       socket.disconnect();
//     };
//   }, []);

//   const handleSelectGame = (game: string) => {
//     setSelectedGame(game);

//     // Send selected game to server
//     socket.emit("selectGame", { id: Date.now().toString(), name: game });
//   };

//   return (
//     <div>
//       <h1>Select a Game</h1>
//       <ul>
//         {games.map((game) => (
//           <li key={game}>
//             <button onClick={() => handleSelectGame(game)}>{game}</button>
//           </li>
//         ))}
//       </ul>

//       <h2>Your selection: {selectedGame}</h2>
//       <h2>Other players selected:</h2>
//       <ul>
//         {otherSelections.map((g, idx) => (
//           <li key={idx}>{g}</li>
//         ))}
//       </ul>
//     </div>
//   );
// }
