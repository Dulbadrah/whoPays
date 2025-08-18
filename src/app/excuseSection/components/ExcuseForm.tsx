import { ChangeEvent, FormEvent, useState } from "react"

export const ExcuseForm = ()=> {
      const [reason, setReason] = useState<string>("")
      const [submitted, setSubmitted] = useState<boolean>(false)
      const [loading, setLoading] = useState<boolean>(false)
      const [error, setError] = useState<string>("")
    

      const API_URL = "https://your-backend-api.com/api/reason"
const API_KEY = "YOUR_API_KEY_HERE"
      const handleReasonChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setReason(e.target.value)
      }
      const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError("")
    
        try {
          const response = await fetch(API_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({ reason }),
          })
    
          if (!response.ok) {
            throw new Error("Server responded with an error")
          }
    
          setSubmitted(true)
          setReason("")
        } catch (err) {
          setError("Алдаа гарлаа. Дахин илгээнэ үү")
        } finally {
          setLoading(false)
        }
      }
    return (
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <textarea
                className="w-full p-3 sm:p-4 border-2 border-blue-200 rounded-xl focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200 resize-none h-28 sm:h-32 text-gray-800 placeholder-gray-400 shadow-sm"
                placeholder="Яагаад мөнгө төлөхгүй байх шалтаг аа бич хэхэ..."
                value={reason}
                onChange={handleReasonChange}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="group w-full relative">
              <div className="absolute inset-0 bg-blue-700 rounded-xl transform translate-y-1 group-hover:translate-y-0.5 transition-transform duration-150"></div>
              <div className="relative bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 sm:py-4 px-6 rounded-xl shadow-lg transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Sending...
                  </span>
                ) : (
                  "SEND MESSAGE"
                )}
              </div>
            </button>
            {error && (
              <div className="bg-yellow-100 border-2 border-yellow-300 rounded-xl p-3 sm:p-4 text-center shadow-sm">
                <p className="text-yellow-800 font-semibold">{error}</p>
              </div>
            )}
          </form>
    )
}