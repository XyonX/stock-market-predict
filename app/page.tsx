"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface PredictionResult {
  symbol: string
  current_price: number
  predicted_price: number
  prediction_date: string
  price_change: number
  price_change_percent: number
}

export default function StockPredictor() {
  const [symbol, setSymbol] = useState("AAPL")
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")


  const handlePredict = async () => {
    if (!symbol.trim()) {
      setError("Please enter a stock symbol")
      return
    }

    setLoading(true)
    setError("")
    setResult(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symbol: symbol.toLowerCase(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch prediction")
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError("Failed to get prediction. Please try again.")
      console.error("Prediction error:", err)
    } finally {
      setLoading(false)
    }
  }

  const getRecommendation = (priceChange: number) => {
    if (priceChange > 0) return "BUY"
    if (priceChange < 0) return "SELL"
    return "HOLD"
  }

  const getRecommendationColor = (priceChange: number) => {
    if (priceChange > 0) return "text-black"
    if (priceChange < 0) return "text-gray-600"
    return "text-gray-500"
  }

  const getTrendIcon = (priceChange: number) => {
    if (priceChange > 0) return <TrendingUp className="w-5 h-5" />
    if (priceChange < 0) return <TrendingDown className="w-5 h-5" />
    return <Minus className="w-5 h-5" />
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 md:p-8 font-mono">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4 text-black tracking-tight uppercase leading-tight">
            Stock Price Predictor
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm md:text-base tracking-wide uppercase font-medium px-4">
            ML-based next day price prediction using 20-day sliding window
          </p>
        </div>

        {/* Input Section */}
        <Card className="border-2 border-black mb-6 sm:mb-8 rounded-none">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="text-sm sm:text-base md:text-lg font-bold text-black uppercase tracking-wide">
              Enter Stock Symbol
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Input
                type="text"
                placeholder="e.g., AAPL"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                className="border-2 border-gray-300 focus:border-black text-base sm:text-lg rounded-none h-10 sm:h-12 flex-1"
                disabled={loading}
              />
              <Button
                onClick={handlePredict}
                disabled={loading}
                className="bg-black text-white hover:bg-gray-800 px-6 sm:px-8 text-sm sm:text-base md:text-lg h-10 sm:h-12 rounded-none w-full sm:w-auto"
              >
                {loading ? "Predicting..." : "Predict Price"}
              </Button>
            </div>
            {error && <p className="text-gray-600 text-xs sm:text-sm">{error}</p>}
          </CardContent>
        </Card>

        {/* Results Section */}
        {result && (
          <Card className="border-2 border-black rounded-none">
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold text-black flex flex-col sm:flex-row items-start sm:items-center gap-2 uppercase tracking-wide">
                <span>{result.symbol.toUpperCase()} Prediction</span>
                {getTrendIcon(result.price_change)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              {/* Price Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <p className="text-xs text-gray-600 uppercase tracking-widest font-bold">Current Price</p>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-black tracking-tight font-mono">
                    ${result.current_price.toFixed(2)}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-gray-600 uppercase tracking-widest font-bold">Predicted Price</p>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-black tracking-tight font-mono">
                    ${result.predicted_price.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Change Information */}
              <div className="border-t border-gray-200 pt-4 sm:pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <p className="text-xs text-gray-600 uppercase tracking-widest font-bold">Price Change</p>
                    <p
                      className={`text-xl sm:text-2xl font-bold tracking-tight font-mono ${result.price_change >= 0 ? "text-black" : "text-gray-600"}`}
                    >
                      {result.price_change >= 0 ? "+" : ""}${result.price_change.toFixed(2)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-gray-600 uppercase tracking-widest font-bold">Percentage Change</p>
                    <p
                      className={`text-xl sm:text-2xl font-bold tracking-tight font-mono ${result.price_change_percent >= 0 ? "text-black" : "text-gray-600"}`}
                    >
                      {result.price_change_percent >= 0 ? "+" : ""}
                      {result.price_change_percent.toFixed(2)}%
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-gray-600 uppercase tracking-widest font-bold">Recommendation</p>
                    <p className={`text-lg sm:text-xl font-medium ${getRecommendationColor(result.price_change)}`}>
                      {getRecommendation(result.price_change)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Prediction Date */}
              <div className="border-t border-gray-200 pt-4 sm:pt-6">
                <p className="text-xs text-gray-600 uppercase tracking-widest font-bold">Prediction Date</p>
                <p className="text-lg sm:text-xl font-bold text-black tracking-tight font-mono">
                  {result.prediction_date}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center mt-8 sm:mt-10 md:mt-12">
          <p className="text-gray-500 text-xs sm:text-sm px-4">
            Predictions based on machine learning analysis of historical price data
          </p>
        </div>
      </div>
    </div>
  )
}
