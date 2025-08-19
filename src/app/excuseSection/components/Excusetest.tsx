import React, { ChangeEvent, FormEvent, useState } from "react";

interface RoastResult {
  roastMessage: string;
}

export const ExcuseForm = () => {
  const [reason, setReason] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [roastResult, setRoastResult] = useState<RoastResult | null>(null);
  const [showRoastModal, setShowRoastModal] = useState<boolean>(false);

  const API_REASON_URL = "http://localhost:4200/roast";
  const API_ROAST_URL = "http://localhost:4200/roast/messages";

  const handleReasonChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setReason(e.target.value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setRoastResult(null);

    try {
      // 1️⃣ Participant өөрийн reason-ийг POST хийнэ
      const participantId = 1; // Жишээ participantId
      const response = await fetch(API_REASON_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId, reasons: [reason] }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Reason илгээхэд алдаа гарлаа");
      }

      setReason(""); // textarea цэвэрлэх

      // 2️⃣ AI roast-ийг GET request-ээр авах
      const roastResponse = await fetch(API_ROAST_URL);
      if (!roastResponse.ok) {
        const errData = await roastResponse.json();
        throw new Error(errData.message || "Roast авахад алдаа гарлаа");
      }

      const roastData = await roastResponse.json();
      setRoastResult({ roastMessage: roastData.roast });
      setShowRoastModal(true);
    } catch (err: any) {
      setError(err.message || "Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowRoastModal(false);
    setRoastResult(null);
  };

  return (
    <div className="min-h-screen bg-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-4">
          Шалтгаан бичих 📝
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            className="w-full p-3 border rounded-xl resize-none h-24"
            placeholder="Яагаад мөнгө төлөхгүй байх шалтаг..."
            value={reason}
            onChange={handleReasonChange}
            required
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded-xl hover:bg-blue-600"
          >
            {loading ? "Илгээж байна..." : "Илгээх"}
          </button>
          {error && <p className="text-red-600 text-center">{error}</p>}
        </form>

        {showRoastModal && roastResult && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center">
              <h3 className="text-xl font-bold mb-2">🎉 AI Roast 🎉</h3>
              <p className="italic text-gray-700 mb-4">
                "{roastResult.roastMessage}"
              </p>
              <button
                onClick={handleCloseModal}
                className="w-full bg-blue-500 text-white py-2 rounded-xl hover:bg-blue-600"
              >
                Хаах
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
