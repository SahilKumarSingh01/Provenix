const extractPublicId = require('./extractPublicId.js');

const sanitizeMcqData = (rawData) => {
  const questionText = typeof rawData.ques?.text === "string" ? rawData.ques.text.trim() : "";

  if (!questionText) {
    throw new Error("Question text is required.");
  }

  if (!Array.isArray(rawData.options) || rawData.options.length < 2) {
    throw new Error("At least two options are required.");
  }

  const sanitizedOptions = rawData.options.map((opt, idx) => {
    const text = typeof opt.text === "string" ? opt.text.trim() : "";
    if (!text) {
      throw new Error(`Option ${idx + 1} must have non-empty text.`);
    }

    return {
      text,
      url: typeof opt.url === "string" ? opt.url : undefined,
      publicId: opt.url ? extractPublicId(opt.url) : null,
      isCorrect: !!opt.isCorrect,
    };
  });

  const hasCorrect = sanitizedOptions.some((opt) => opt.isCorrect);
  if (!hasCorrect) {
    throw new Error("At least one option must be marked as correct.");
  }

  const sanitized = {
    ques: {
      text: questionText,
      url: typeof rawData.ques?.url === "string" ? rawData.ques.url : undefined,
      publicId: rawData.ques?.url ? extractPublicId(rawData.ques.url) : "",
    },
    options: sanitizedOptions,
  };

  return sanitized;
};

module.exports = sanitizeMcqData;
