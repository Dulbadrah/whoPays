"use client"

import { useRouter } from "next/router";
import React, { useState, ChangeEvent, FormEvent } from "react";

export const ExcuseForm = () => {
  const [reason, setReason] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [roast, setRoast] = useState<string | null>(null);
  
  // ⭐ Шинэ: Шалтгаан амжилттай илгээгдсэн эсэхийг хянах
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  // ⭐ Шинэ: Серверийн хариу мессежийг хадгалах (хүлээлгийн эсвэл бусад)
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setReason(e.target.value);
  };

  const router = useRouter();
const roomCode = router.query.room;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setRoast(null);
    setIsSubmitted(false); // Илгээхээс өмнө submitted төлвийг false болгох
    setStatusMessage(null); // Мессежийг цэвэрлэх

    try {
      const response = await fetch("http://localhost:4200/roast", { // Таны API endpoint
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomId: 1, 
          reasons: [reason], 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Roast авахад алдаа гарлаа");
      }
      
      console.log("🔥 Roast API response:", data);

      setIsSubmitted(true); // Амжилттай илгээгдсэн гэж тэмдэглэх
      setReason(""); // Бичих хэсгийг хоослох

      if (data.roast) {
        setRoast(data.roast); // Roast ирсэн бол хадгалах
        setStatusMessage("Roast амжилттай үүслээ!"); // Хэрэв шууд roast ирвэл
      } else if (data.message) {
        setStatusMessage(data.message); // Хүлээлгийн мессеж ирсэн бол хадгалах
      } else {
        setStatusMessage("Хариу ирсэн боловч, үүнийг харуулах мессеж алга байна.");
      }

    } catch (err: any) {
      setError(err.message || "Сервертэй холбогдоход алдаа гарлаа");
      setIsSubmitted(false); // Алдаа гарвал буцаад маягтыг харуулах
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-6">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
        {/* ⭐ Шинэ: Хэрэв илгээгдээгүй бол маягтыг харуулна */}
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              className="w-full p-3 border rounded-xl resize-none h-24"
              placeholder="Яагаад мөнгө төлөхгүй байгаа шалтгаанаа бич..."
              value={reason}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !reason.trim()}
              className="w-full bg-blue-500 text-white py-2 rounded-xl hover:bg-blue-600"
            >
              {loading ? "Илгээж байна..." : "Шалтгаанаа илгээх"}
            </button>
            {error && <p className="text-red-600 text-center">{error}</p>}
          </form>
        ) : (
          // ⭐ Шинэ: Илгээгдсэн бол статус болон roast-г харуулна
          <div className="text-center">
            {statusMessage && (
              <p className="text-blue-600 font-semibold mb-4">{statusMessage}</p>
            )}
            {roast && (
              <div className="mt-4 bg-yellow-50 border border-yellow-300 p-4 rounded-xl shadow">
                <h3 className="text-lg font-bold text-yellow-800 mb-2">
                  🤖 AI Roast:
                </h3>
                <p className="italic text-gray-800">"{roast}"</p>
              </div>
            )}
          
          </div>
        )}
      </div>
    </div>
  );
};
