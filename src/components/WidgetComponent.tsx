import "../index.css";

import { useWidgetParams, useSubmission } from "@joymath/widget-sdk";
import type { WidgetParams, WidgetAnswer } from "../definition";
import { useState, useEffect } from "react";

// Standard denominations (like Vietnamese currency)
const ALL_DENOMINATIONS = [1, 2, 5, 10, 20, 50, 100, 200, 500];

export function WidgetComponent() {
  const params = useWidgetParams<WidgetParams>();

  // Get available denominations (only smaller than target)
  const availableDenominations = ALL_DENOMINATIONS.filter(
    (d) => d < params.target,
  );

  // useSubmission hook
  const {
    answer,
    setAnswer,
    result,
    submit,
    isLocked,
    canSubmit,
    isSubmitting,
  } = useSubmission<WidgetAnswer>({
    evaluate: (ans) => {
      const selectedWeights: number[] = JSON.parse(ans.selectedWeights);

      // Calculate total
      const total = selectedWeights.reduce((sum, w) => sum + w, 0);

      // Check if balanced
      const isCorrect = total === params.target;
      const score = isCorrect ? 100 : 0;

      return {
        isCorrect,
        score,
        maxScore: 100,
      };
    },
  });

  // Parse selected weights
  const [selectedWeights, setSelectedWeights] = useState<number[]>([]);

  useEffect(() => {
    if (answer?.selectedWeights) {
      try {
        const weights = JSON.parse(answer.selectedWeights);
        setSelectedWeights(weights);
      } catch {
        setSelectedWeights([]);
      }
    } else {
      setSelectedWeights([]);
    }
  }, [answer]);

  // Calculate current total
  const currentTotal = selectedWeights.reduce((sum, w) => sum + w, 0);

  // Add weight to right side
  const handleAddWeight = (weight: number) => {
    if (isLocked) return;

    const newWeights = [...selectedWeights, weight];
    setSelectedWeights(newWeights);
    setAnswer({ selectedWeights: JSON.stringify(newWeights) });
  };

  // Remove weight from right side
  const handleRemoveWeight = (index: number) => {
    if (isLocked) return;

    const newWeights = selectedWeights.filter((_, i) => i !== index);
    setSelectedWeights(newWeights);
    setAnswer({ selectedWeights: JSON.stringify(newWeights) });
  };

  // Clear all weights
  const handleClearAll = () => {
    if (isLocked) return;

    setSelectedWeights([]);
    setAnswer({ selectedWeights: JSON.stringify([]) });
  };

  // Calculate rotation angle based on weight difference
  const getRotationAngle = () => {
    const difference = currentTotal - params.target;
    // Max rotation at ±10 degrees when difference is large
    const maxAngle = 10;
    const maxDifference = params.target; // Normalize by target
    const angle = (difference / maxDifference) * maxAngle;
    // Clamp between -maxAngle and +maxAngle
    return Math.max(-maxAngle, Math.min(maxAngle, angle));
  };

  const rotationAngle = getRotationAngle();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-sky-100 to-blue-50">
      <div className="w-full max-w-3xl">
        {/* Review Mode Badge */}
        {isLocked && (
          <div className="mb-4 text-center">
            <span className="inline-block px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
              📋 Chế độ xem lại
            </span>
          </div>
        )}

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-slate-200">
          {/* Question */}
          <div className="text-center mb-4">
            <h2 className="text-xl md:text-2xl font-bold mb-1 text-slate-800">
              {params.question}
            </h2>
            <p className="text-xs text-slate-600">
              {isLocked ? "Xem lại kết quả" : "Chọn các quả cân để cân bằng"}
            </p>
          </div>

          {/* Balance Scale */}
          <div className="mb-6">
            {/* Scale Visual */}
            <div className="relative">
              {/* Fulcrum (trụ giữa) */}
              <div className="flex justify-center mb-2">
                <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[30px] border-b-slate-700"></div>
              </div>

              {/* Balance Beam with dynamic rotation */}
              <div className="relative h-2 mx-auto" style={{ width: "60%" }}>
                <div
                  className="absolute inset-0 bg-slate-700 rounded-full transition-transform duration-300"
                  style={{
                    transform: `rotate(${rotationAngle}deg)`,
                    transformOrigin: "center",
                  }}
                >
                  {/* Left Pan */}
                  <div
                    className="absolute left-0 top-0 transform -translate-x-1/2"
                    style={{ width: "42%" }}
                  >
                    {/* String */}
                    <div className="flex justify-center">
                      <div className="w-0.5 h-10 bg-slate-600"></div>
                    </div>
                    {/* Pan */}
                    <div className="bg-amber-100 border-3 border-amber-600 rounded-t-lg h-24 flex flex-col items-center justify-center shadow-lg">
                      {/* Target Weight */}
                      <div className="text-3xl md:text-4xl font-bold text-amber-800 mb-1">
                        {params.target}
                      </div>
                      <div className="text-xs text-amber-700 font-semibold">
                        kg
                      </div>
                    </div>
                  </div>

                  {/* Right Pan */}
                  <div
                    className="absolute right-0 top-0 transform translate-x-1/2"
                    style={{ width: "42%" }}
                  >
                    {/* String */}
                    <div className="flex justify-center">
                      <div className="w-0.5 h-10 bg-slate-600"></div>
                    </div>
                    {/* Pan */}
                    <div className="bg-sky-100 border-3 border-sky-600 rounded-t-lg h-24 flex flex-wrap items-start justify-center p-1.5 gap-1 overflow-y-auto shadow-lg">
                      {selectedWeights.length === 0 ? (
                        <div className="flex items-center justify-center w-full h-full text-sky-400 text-xs">
                          Chọn quả cân
                        </div>
                      ) : (
                        selectedWeights.map((weight, index) => (
                          <button
                            key={`selected-${index}`}
                            onClick={() => handleRemoveWeight(index)}
                            disabled={isLocked}
                            className={`
                              w-9 h-9 md:w-10 md:h-10
                              flex items-center justify-center 
                              text-sm md:text-base font-bold 
                              rounded-full border-2 
                              transition-all
                              ${
                                isLocked
                                  ? "bg-sky-200 border-sky-400 text-sky-700 cursor-default"
                                  : "bg-sky-300 border-sky-500 text-sky-800 hover:bg-sky-400 cursor-pointer"
                              }
                            `}
                          >
                            {weight}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Base (đế) */}
              <div className="flex justify-center mt-1">
                <div className="w-24 h-6 bg-slate-700 rounded-t-lg"></div>
              </div>
            </div>
          </div>

          {/* Available Weights */}
          {!isLocked && (
            <div className="mb-4">
              <h3 className="text-center text-sm font-semibold text-slate-700 mb-3">
                Chọn quả cân:
              </h3>
              <div className="flex flex-wrap justify-center gap-2">
                {availableDenominations.map((weight) => (
                  <button
                    key={weight}
                    onClick={() => handleAddWeight(weight)}
                    className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center text-lg md:text-xl font-bold bg-white border-2 border-indigo-300 text-indigo-700 rounded-full hover:bg-indigo-50 hover:border-indigo-500 hover:scale-110 transition-all shadow-sm hover:shadow-md"
                  >
                    {weight}
                  </button>
                ))}
              </div>

              {/* Clear button */}
              {selectedWeights.length > 0 && (
                <div className="text-center mt-3">
                  <button
                    onClick={handleClearAll}
                    className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
                  >
                    Xóa tất cả
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          {!isLocked && (
            <button
              onClick={submit}
              disabled={!canSubmit || isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-colors text-sm md:text-base"
            >
              {isSubmitting ? "Đang nộp bài..." : "Nộp bài"}
            </button>
          )}

          {/* Result */}
          {result && isLocked && (
            <div
              className={`p-4 md:p-5 rounded-xl mt-4 border-2 ${
                result.isCorrect
                  ? "bg-green-50 border-green-200"
                  : "bg-amber-50 border-amber-200"
              }`}
            >
              <div className="text-center">
                <div className="text-4xl mb-2">
                  {result.isCorrect ? "🎉" : "💪"}
                </div>
                <div
                  className={`text-lg md:text-xl font-bold mb-1 ${
                    result.isCorrect ? "text-green-700" : "text-amber-700"
                  }`}
                >
                  {result.isCorrect
                    ? params.settings.showFeedback
                      ? params.settings.feedbackCorrect
                      : "Tuyệt vời!"
                    : params.settings.showFeedback
                      ? params.settings.feedbackIncorrect
                      : "Chưa đúng rồi!"}
                </div>
                <div
                  className={`text-sm font-semibold ${
                    result.isCorrect ? "text-green-600" : "text-amber-600"
                  }`}
                >
                  {result.isCorrect
                    ? `Đã cân bằng: ${currentTotal} kg = ${params.target} kg`
                    : `Tổng của bé: ${currentTotal} kg ≠ ${params.target} kg`}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
