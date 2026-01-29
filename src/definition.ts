import {
  defineWidget,
  param,
  folder,
  when,
  type ExtractParams,
  type ExtractAnswer,
} from "@joymath/widget-sdk";

// Widget definition
export const widgetDefinition = defineWidget({
  // Parameters - config từ giáo viên
  parameters: {
    question: param.string("Chọn các quả cân để cân bằng").label("Câu hỏi"),

    target: param
      .number(10)
      .label("Trọng lượng cần đạt (kg)")
      .description("Số cần cân bằng")
      .min(1)
      .max(100),

    settings: folder("Cài đặt", {
      showFeedback: param.boolean(true).label("Hiển thị phản hồi"),
      feedbackCorrect: param
        .string("Tuyệt vời! Bé đã cân bằng đúng rồi! 🎉")
        .label("Phản hồi khi đúng")
        .visibleIf(when("settings.showFeedback").equals(true)),
      feedbackIncorrect: param
        .string("Chưa cân bằng được, bé thử lại nhé! 💪")
        .label("Phản hồi khi sai")
        .visibleIf(when("settings.showFeedback").equals(true)),
    }).expanded(false),
  },

  // Answer schema
  answer: {
    selectedWeights: param.string("[]").label("Các quả cân đã chọn (JSON)"),
    // Format: [5, 2, 2, 1] - danh sách các số đã chọn
  },
} as const);

// Type inference
export type WidgetParams = ExtractParams<typeof widgetDefinition>;
export type WidgetAnswer = ExtractAnswer<typeof widgetDefinition>;
