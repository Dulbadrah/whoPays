"use client";
 
import { useParams, useRouter, useSearchParams } from "next/navigation";
 
import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
 
export const ExcuseForm = () => {
  const [reason, setReason] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [roast, setRoast] = useState<string | null>(null);
 
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const params = useParams();
  const searchParams = useSearchParams();
 
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setReason(e.target.value);
  };
 
  const roomCode = params.roomCode as string;
 
  useEffect(() => {
    if (roomCode) {
      console.log("Room Code from URL:", roomCode);
    }
  }, [roomCode]);
 
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setRoast(null);
    setIsSubmitted(false);
    setStatusMessage(null);
 
    try {
      const response = await fetch("http://localhost:4200/roast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomId: roomCode,
          reasons: [reason],
        }),
      });
 
      const data = await response.json();
 
      if (!response.ok) {
        throw new Error(data.message || "Roast авахад алдаа гарлаа");
      }
 
      console.log("🔥 Roast API response:", data);
 
      setIsSubmitted(true);
      setReason("");
 
      if (data.roast) {
        setRoast(data.roast);
        setStatusMessage("Roast амжилттай үүслээ!");
      } else if (data.message) {
        setStatusMessage(data.message);
      } else {
        setStatusMessage(
          "Хариу ирсэн боловч, үүнийг харуулах мессеж алга байна."
        );
      }
    } catch (err: any) {
      setError(err.message || "Сервертэй холбогдоход алдаа гарлаа");
      setIsSubmitted(false);
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="flex items-center justify-center p-6">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
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
          <div className="text-center">
            {statusMessage && (
              <p className="text-blue-600 font-semibold mb-4">
                {statusMessage}
              </p>
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
 
 