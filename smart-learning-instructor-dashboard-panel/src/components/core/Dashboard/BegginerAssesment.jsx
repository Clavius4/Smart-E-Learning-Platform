import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { assessmentEndpoints } from "../../../services/apis.js";

export default function BeginnerAssessment() {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)

  const [formData, setFormData] = useState({
    category: "",
    level: "",
    questions: [
      {
        type: "mcq",
        question: "",
        questionImage: null,
        questionImagePreview: null,
        options: [
          { text: "", image: null, imagePreview: null },
          { text: "", image: null, imagePreview: null },
          { text: "", image: null, imagePreview: null },
        ],
        correctAnswerIndex: 0,
        pairs: [{ drag: "", drop: "" }],
      },
    ],
  });

  const [errors, setErrors] = useState({});
  const [assessments, setAssessments] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState("");
  const [filters, setFilters] = useState({ category: "", level: "" });

  const loadAssessments = async () => {
    if (!token) return;
    setListLoading(true);
    setListError("");
    try {
      const response = await axios.get(assessmentEndpoints.GET_ALL_ASSESSMENTS, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      setAssessments(response.data?.assessments || []);
    } catch (error) {
      console.error("Error loading assessments:", error.response?.data || error.message);
      setListError("Failed to load assessments.");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    loadAssessments();
  }, [token]);

  // Convert file to base64 - same as CourseQuiz
  const fileToBase64String = (file) => {
    return new Promise((resolve) => {
      if (!file) {
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
    });
  };

  // Question Image Upload - same pattern as CourseQuiz
  const handleQuestionImageUpload = async (qIndex, file) => {
    if (!file) return;
    const base64 = await fileToBase64String(file);
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, index) =>
        index === qIndex ? {
          ...q,
          questionImage: file,
          questionImagePreview: base64
        } : q
      )
    }));
  };

  const removeQuestionImage = (qIndex) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, index) =>
        index === qIndex ? {
          ...q,
          questionImage: null,
          questionImagePreview: null
        } : q
      )
    }));
  };

  // Option Image Upload - same pattern as CourseQuiz
  const handleOptionImageUpload = async (qIndex, optIndex, file) => {
    if (!file) return;
    const base64 = await fileToBase64String(file);
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, index) =>
        index === qIndex
          ? {
            ...q,
            options: q.options.map((opt, oIndex) =>
              oIndex === optIndex ? {
                ...opt,
                image: file,
                imagePreview: base64
              } : opt
            )
          }
          : q
      )
    }));
  };

  const removeOptionImage = (qIndex, optIndex) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, index) =>
        index === qIndex
          ? {
            ...q,
            options: q.options.map((opt, oIndex) =>
              oIndex === optIndex ? {
                ...opt,
                image: null,
                imagePreview: null
              } : opt
            )
          }
          : q
      )
    }));
  };

  const updateQuestion = (qIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, index) =>
        index === qIndex ? { ...q, [field]: value } : q
      )
    }));
  };

  const updateOption = (qIndex, optIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, index) =>
        index === qIndex
          ? {
            ...q,
            options: q.options.map((opt, oIndex) =>
              oIndex === optIndex ? { ...opt, [field]: value } : opt
            )
          }
          : q
      )
    }));
  };

  const updatePair = (qIndex, pairIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, index) =>
        index === qIndex
          ? {
            ...q,
            pairs: q.pairs.map((pair, pIndex) =>
              pIndex === pairIndex ? { ...pair, [field]: value } : pair
            )
          }
          : q
      )
    }));
  };

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          type: "mcq",
          question: "",
          questionImage: null,
          questionImagePreview: null,
          options: [
            { text: "", image: null, imagePreview: null },
            { text: "", image: null, imagePreview: null },
            { text: "", image: null, imagePreview: null },
          ],
          correctAnswerIndex: 0,
          pairs: [{ drag: "", drop: "" }],
        }
      ]
    }));
  };

  const removeQuestion = (qIndex) => {
    if (formData.questions.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, index) => index !== qIndex)
    }));
  };

  const addOption = (qIndex) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, index) =>
        index === qIndex
          ? { ...q, options: [...q.options, { text: "", image: null, imagePreview: null }] }
          : q
      )
    }));
  };

  const removeOption = (qIndex, optIndex) => {
    const question = formData.questions[qIndex];
    if (question.options.length <= 1) return;

    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, index) =>
        index === qIndex
          ? {
            ...q,
            options: q.options.filter((_, oIndex) => oIndex !== optIndex),
            correctAnswerIndex: q.correctAnswerIndex > optIndex ? q.correctAnswerIndex - 1 : q.correctAnswerIndex
          }
          : q
      )
    }));
  };

  const addPair = (qIndex) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, index) =>
        index === qIndex
          ? { ...q, pairs: [...q.pairs, { drag: "", drop: "" }] }
          : q
      )
    }));
  };

  const removePair = (qIndex, pairIndex) => {
    const question = formData.questions[qIndex];
    if (question.pairs.length <= 1) return;

    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, index) =>
        index === qIndex
          ? { ...q, pairs: q.pairs.filter((_, pIndex) => pIndex !== pairIndex) }
          : q
      )
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.level) {
      newErrors.level = "Level is required";
    }

    formData.questions.forEach((q, qIndex) => {
      if (!q.question) {
        if (!newErrors.questions) newErrors.questions = {};
        if (!newErrors.questions[qIndex]) newErrors.questions[qIndex] = {};
        newErrors.questions[qIndex].question = "Question text is required";
      }

      if (q.type === "mcq") {
        q.options.forEach((opt, optIndex) => {
          if (!opt.text) {
            if (!newErrors.questions) newErrors.questions = {};
            if (!newErrors.questions[qIndex]) newErrors.questions[qIndex] = {};
            if (!newErrors.questions[qIndex].options) newErrors.questions[qIndex].options = {};
            if (!newErrors.questions[qIndex].options[optIndex]) newErrors.questions[qIndex].options[optIndex] = {};
            newErrors.questions[qIndex].options[optIndex].text = "Option text is required";
          }
        });
      }

      if (q.type === "dragdrop") {
        q.pairs.forEach((pair, pairIndex) => {
          if (!pair.drag) {
            if (!newErrors.questions) newErrors.questions = {};
            if (!newErrors.questions[qIndex]) newErrors.questions[qIndex] = {};
            if (!newErrors.questions[qIndex].pairs) newErrors.questions[qIndex].pairs = {};
            if (!newErrors.questions[qIndex].pairs[pairIndex]) newErrors.questions[qIndex].pairs[pairIndex] = {};
            newErrors.questions[qIndex].pairs[pairIndex].drag = "Drag text is required";
          }
          if (!pair.drop) {
            if (!newErrors.questions) newErrors.questions = {};
            if (!newErrors.questions[qIndex]) newErrors.questions[qIndex] = {};
            if (!newErrors.questions[qIndex].pairs) newErrors.questions[qIndex].pairs = {};
            if (!newErrors.questions[qIndex].pairs[pairIndex]) newErrors.questions[qIndex].pairs[pairIndex] = {};
            newErrors.questions[qIndex].pairs[pairIndex].drop = "Drop text is required";
          }
        });
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      if (!token) {
        alert("You must be logged in!");
        return;
      }

      // Process questions and convert images to base64 - same pattern as CourseQuiz
      const processedQuestions = await Promise.all(
        formData.questions.map(async (q) => {
          const questionImage = q.questionImage
            ? await fileToBase64String(q.questionImage)
            : q.questionImagePreview?.startsWith("data:")
              ? q.questionImagePreview
              : null;

          const correctAnswerIndex =
            q.correctAnswerIndex !== undefined
              ? Number(q.correctAnswerIndex)
              : null;

          if (q.type === "mcq") {
            if (
              correctAnswerIndex === null ||
              correctAnswerIndex < 0 ||
              correctAnswerIndex >= q.options.length
            ) {
              throw new Error(`Invalid correctAnswerIndex in question ${formData.questions.indexOf(q) + 1}`);
            }

            const options = await Promise.all(
              q.options
                .filter(opt => opt.text && opt.text.trim()) // Only include options with text
                .map(async (opt) => ({
                  text: opt.text,
                  image: opt.image
                    ? await fileToBase64String(opt.image)
                    : opt.imagePreview?.startsWith("data:")
                      ? opt.imagePreview
                      : null,
                }))
            );

            // Adjust correctAnswerIndex based on filtered options
            const originalOptions = q.options;
            const filteredOptionIndex = originalOptions
              .slice(0, q.correctAnswerIndex + 1)
              .filter(opt => opt.text && opt.text.trim()).length - 1;

            return {
              type: "mcq",
              question: q.question,
              questionImage,
              options,
              correctAnswerIndex: Math.max(0, filteredOptionIndex),
              pairs: [],
            };
          } else if (q.type === "dragdrop") {
            return {
              type: "dragdrop",
              question: q.question,
              questionImage,
              options: [],
              correctAnswerIndex: null,
              pairs: q.pairs,
            };
          }
        })
      );

      const payload = {
        category: formData.category,
        level: formData.level,
        instructor: user,
        questions: processedQuestions,
      };

      await axios.post(assessmentEndpoints.CREATE_ASSESSMENT, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      alert("Assessment created successfully!");
      setFormData(prev => ({ ...prev, category: "", level: "" }));
      loadAssessments();
    } catch (error) {
      console.error("Error creating assessment:", error.response?.data || error.message);
      alert("Error creating assessment.");
    }
  };

  const handleDelete = async (assessmentId) => {
    if (!token) {
      alert("You must be logged in!");
      return;
    }
    if (!window.confirm("Delete this assessment? This cannot be undone.")) return;

    try {
      await axios.post(
        assessmentEndpoints.DELETE_ASSESSMENT.replace(":assessmentId", assessmentId),
        undefined,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      setAssessments(prev => prev.filter(a => a._id !== assessmentId));
    } catch (error) {
      console.error("Error deleting assessment:", error.response?.data || error.message);
      alert("Error deleting assessment.");
    }
  };

  const filteredAssessments = assessments.filter((assessment) => {
    if (filters.category && assessment.category !== filters.category) return false;
    if (filters.level && assessment.level !== filters.level) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-500 via-blue-500 to-slate-500 py-8 px-4">
      <div className="max-w-4xl mx-auto p-8 bg-slate-200 text-white rounded-xl shadow-2xl space-y-8 border border-slate-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create Assessment</h1>
          <p className="text-slate-300">Build your custom assessment with multiple question types</p>
        </div>

        {/* Category + Level */}
        <div className="bg-slate-700 p-6 rounded-lg border border-slate-600 space-y-6">
          <div>
            <label className="block mb-3 font-semibold text-slate-200 text-lg">Assessment Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className={`w-full border rounded-lg px-4 py-3 bg-slate-600 text-black focus:outline-none focus:ring-2 transition-all ${errors.category ? "border-red-500 focus:ring-red-400" : "border-slate-500 focus:ring-blue-400"
                }`}
            >
              <option value="">Select category</option>
              <option value="literacy">Kusoma (Literacy)</option>
              <option value="numeracy">Kuandika (Numeracy)</option>
            </select>
            {errors.category && (
              <p className="text-red-400 mt-2 text-sm flex items-center">
                <span className="mr-1">⚠️</span>
                {errors.category}
              </p>
            )}
          </div>

          <div>
            <label className="block mb-3 font-semibold text-slate-200 text-lg">Assessment Level</label>
            <select
              value={formData.level}
              onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
              className={`w-full border rounded-lg px-4 py-3 bg-slate-600 text-black focus:outline-none focus:ring-2 transition-all ${errors.level ? "border-red-500 focus:ring-red-400" : "border-slate-500 focus:ring-blue-400"
                }`}
            >
              <option value="">Select level</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            {errors.level && (
              <p className="text-red-400 mt-2 text-sm flex items-center">
                <span className="mr-1">⚠️</span>
                {errors.level}
              </p>
            )}
          </div>
        </div>

        {/* Questions */}
        {formData.questions.map((q, qIndex) => {
          return (
            <div
              key={qIndex}
              className="border border-slate-600 rounded-xl p-6 shadow-lg space-y-6 bg-slate-700"
            >
              <div className="flex justify-between items-center border-b border-slate-600 pb-4">
                <h4 className="text-xl font-semibold text-white flex items-center">
                  <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">
                    {qIndex + 1}
                  </span>
                  Question #{qIndex + 1}
                </h4>
                <button
                  type="button"
                  onClick={() => removeQuestion(qIndex)}
                  disabled={formData.questions.length <= 1}
                  className="text-red-400 hover:text-red-300 disabled:opacity-50 px-3 py-1 rounded-lg hover:bg-slate-600 transition-all"
                  title="Remove Question"
                >
                  🗑️ Remove
                </button>
              </div>

              {/* Question Type Dropdown */}
              <div>
                <label className="block mb-2 font-medium text-slate-200">
                  Question Type
                </label>
                <select
                  value={q.type}
                  onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                  className="w-full border rounded-lg px-4 py-3 bg-slate-600 text-black border-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                >
                  <option value="mcq">📝 Multiple Choice (MCQ)</option>
                  <option value="dragdrop">🔄 Drag & Drop</option>
                </select>
              </div>

              {/* Question Text */}
              <div>
                <label className="block mb-2 font-medium text-slate-200">
                  Question Text
                </label>
                <input
                  type="text"
                  value={q.question}
                  onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                  className={`w-full border rounded-lg px-4 py-3 bg-slate-600 text-black focus:outline-none focus:ring-2 transition-all ${errors.questions?.[qIndex]?.question
                    ? "border-red-500 focus:ring-red-400"
                    : "border-slate-500 focus:ring-blue-400"
                    }`}
                  placeholder="Enter your question here..."
                />
                {errors.questions?.[qIndex]?.question && (
                  <p className="text-red-400 mt-2 text-sm flex items-center">
                    <span className="mr-1">⚠️</span>
                    {errors.questions[qIndex].question}
                  </p>
                )}
              </div>

              {/* Question Image Upload - Updated to match CourseQuiz pattern */}
              <div>
                <label className="block mb-2 font-medium text-slate-200">
                  Question Image (optional)
                </label>
                {q.questionImagePreview ? (
                  <div className="relative inline-block">
                    <div className="relative w-64 h-40 rounded-xl overflow-hidden shadow-lg border border-white/20">
                      <img
                        src={q.questionImagePreview}
                        alt="Question preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeQuestionImage(qIndex)}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-all duration-300"
                      aria-label="Remove question image"
                    >
                      ❌
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor={`question-image-upload-${qIndex}`}
                    className="flex items-center gap-3 cursor-pointer border-2 border-dashed border-white/30 hover:border-blue-400 rounded-xl p-6 transition-all duration-300 bg-white/5 hover:bg-white/10"
                  >
                    <div className="p-3 bg-blue-500/20 rounded-lg">
                      📷
                    </div>
                    <div>
                      <p className="text-white font-medium">Upload Question Image</p>
                      <p className="text-white/60 text-sm">PNG, JPG up to 10MB</p>
                    </div>
                    <input
                      id={`question-image-upload-${qIndex}`}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleQuestionImageUpload(qIndex, e.target.files[0])}
                    />
                  </label>
                )}
              </div>

              {/* MCQ Options */}
              {q.type === "mcq" && (
                <div className="bg-slate-600 p-6 rounded-lg border border-slate-500">
                  <h5 className="font-semibold text-slate-200 mb-4 text-lg flex items-center">
                    <span className="mr-2">📋</span>
                    Answer Options
                  </h5>
                  {q.options.map((opt, optIndex) => {
                    return (
                      <div
                        key={optIndex}
                        className="mb-6 p-4 bg-slate-800 rounded-lg border border-slate-500 space-y-4"
                      >
                        <div className="flex justify-between items-center">
                          <h6 className="font-medium text-slate-200">Option {optIndex + 1}</h6>
                          <button
                            type="button"
                            onClick={() => removeOption(qIndex, optIndex)}
                            disabled={q.options.length <= 1}
                            className="text-red-400 hover:text-red-300 disabled:opacity-50 px-2 py-1 rounded hover:bg-slate-700 transition-all"
                          >
                            ❌
                          </button>
                        </div>

                        <div>
                          <label className="block mb-2 font-medium text-slate-300">
                            Option Text
                          </label>
                          <input
                            type="text"
                            value={opt.text}
                            onChange={(e) => updateOption(qIndex, optIndex, 'text', e.target.value)}
                            className={`w-full border rounded-lg px-4 py-2 bg-slate-700 text-black focus:outline-none focus:ring-2 transition-all ${errors.questions?.[qIndex]?.options?.[optIndex]?.text
                              ? "border-red-500 focus:ring-red-400"
                              : "border-slate-400 focus:ring-blue-400"
                              }`}
                            placeholder={`Enter option ${optIndex + 1} text...`}
                          />
                          {errors.questions?.[qIndex]?.options?.[optIndex]?.text && (
                            <p className="text-red-400 mt-1 text-sm flex items-center">
                              <span className="mr-1">⚠️</span>
                              {errors.questions[qIndex].options[optIndex].text}
                            </p>
                          )}
                        </div>

                        {/* Option Image Upload - Updated to match CourseQuiz pattern */}
                        <div>
                          <label className="block mb-2 font-medium text-slate-300">
                            Option Image (optional)
                          </label>
                          {opt.imagePreview ? (
                            <div className="relative">
                              <div className="w-16 h-16 rounded-lg overflow-hidden border border-white/20">
                                <img
                                  src={opt.imagePreview}
                                  alt={`Option ${optIndex + 1} preview`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeOptionImage(qIndex, optIndex)}
                                className="absolute -top-1 -right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs"
                                aria-label="Remove option image"
                              >
                                ❌
                              </button>
                            </div>
                          ) : (
                            <label
                              htmlFor={`option-image-upload-${qIndex}-${optIndex}`}
                              className="cursor-pointer p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all duration-300 flex items-center gap-2"
                            >
                              📷
                              <span className="text-xs text-white/60">Image</span>
                              <input
                                id={`option-image-upload-${qIndex}-${optIndex}`}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleOptionImageUpload(qIndex, optIndex, e.target.files[0])}
                              />
                            </label>
                          )}
                        </div>

                        <label className="inline-flex items-center space-x-3 cursor-pointer bg-slate-700 p-3 rounded-lg hover:bg-slate-600 transition-all">
                          <input
                            type="radio"
                            value={optIndex.toString()}
                            checked={q.correctAnswerIndex === optIndex}
                            onChange={() => updateQuestion(qIndex, 'correctAnswerIndex', optIndex)}
                            className="form-radio text-blue-500 bg-slate-600 border-slate-400 focus:ring-blue-400"
                          />
                          <span className="text-slate-200 font-medium">✅ Mark as Correct Answer</span>
                        </label>
                      </div>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => addOption(qIndex)}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium flex items-center justify-center"
                  >
                    <span className="mr-2">➕</span>
                    Add Option
                  </button>
                </div>
              )}

              {/* Drag & Drop Pairs */}
              {q.type === "dragdrop" && (
                <div className="bg-slate-600 p-6 rounded-lg border border-slate-500">
                  <h5 className="font-semibold text-slate-200 mb-4 text-lg flex items-center">
                    <span className="mr-2">🔄</span>
                    Drag & Drop Pairs
                  </h5>
                  {q.pairs.map((pair, pairIndex) => (
                    <div
                      key={pairIndex}
                      className="mb-6 p-4 bg-slate-800 rounded-lg border border-slate-500 space-y-4"
                    >
                      <div className="flex justify-between items-center">
                        <h6 className="font-medium text-slate-200">Pair {pairIndex + 1}</h6>
                        <button
                          type="button"
                          onClick={() => removePair(qIndex, pairIndex)}
                          disabled={q.pairs.length <= 1}
                          className="text-red-400 hover:text-red-300 disabled:opacity-50 px-2 py-1 rounded hover:bg-slate-700 transition-all"
                        >
                          ❌
                        </button>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block mb-2 font-medium text-slate-300">
                            🔸 Drag Text
                          </label>
                          <input
                            type="text"
                            value={pair.drag}
                            onChange={(e) => updatePair(qIndex, pairIndex, 'drag', e.target.value)}
                            className={`w-full border rounded-lg px-4 py-2 bg-slate-700 text-black focus:outline-none focus:ring-2 transition-all ${errors.questions?.[qIndex]?.pairs?.[pairIndex]?.drag
                              ? "border-red-500 focus:ring-red-400"
                              : "border-slate-400 focus:ring-blue-400"
                              }`}
                            placeholder="Item to drag..."
                          />
                          {errors.questions?.[qIndex]?.pairs?.[pairIndex]?.drag && (
                            <p className="text-red-400 mt-1 text-sm flex items-center">
                              <span className="mr-1">⚠️</span>
                              {errors.questions[qIndex].pairs[pairIndex].drag}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block mb-2 font-medium text-slate-300">
                            🎯 Drop Text
                          </label>
                          <input
                            type="text"
                            value={pair.drop}
                            onChange={(e) => updatePair(qIndex, pairIndex, 'drop', e.target.value)}
                            className={`w-full border rounded-lg px-4 py-2 bg-slate-700 text-black focus:outline-none focus:ring-2 transition-all ${errors.questions?.[qIndex]?.pairs?.[pairIndex]?.drop
                              ? "border-red-500 focus:ring-red-400"
                              : "border-slate-400 focus:ring-blue-400"
                              }`}
                            placeholder="Drop target..."
                          />
                          {errors.questions?.[qIndex]?.pairs?.[pairIndex]?.drop && (
                            <p className="text-red-400 mt-1 text-sm flex items-center">
                              <span className="mr-1">⚠️</span>
                              {errors.questions[qIndex].pairs[pairIndex].drop}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => addPair(qIndex)}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium flex items-center justify-center"
                  >
                    <span className="mr-2">➕</span>
                    Add Pair
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Add Question Button */}
        <div className="text-center border-t border-slate-600 pt-6">
          <button
            type="button"
            onClick={addQuestion}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg transform hover:scale-105 flex items-center mx-auto"
          >
            <span className="mr-2 text-lg">➕</span>
            Add New Question
          </button>
        </div>

        {/* Submit Button */}
        <div className="text-center border-t border-slate-600 pt-6">
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-12 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-xl transform hover:scale-105 flex items-center mx-auto"
          >
            <span className="mr-2">🚀</span>
            Create Assessment
          </button>
        </div>

        {/* Manage Assessments */}
        <div className="border-t border-slate-600 pt-8 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-2xl font-bold text-white">Manage Assessments</h2>
            <button
              type="button"
              onClick={loadAssessments}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            >
              🔄 Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="w-full border rounded-lg px-4 py-3 bg-slate-700 text-black focus:outline-none focus:ring-2 border-slate-500 focus:ring-blue-400"
            >
              <option value="">All Categories</option>
              <option value="literacy">Kusoma (Literacy)</option>
              <option value="numeracy">Kuandika (Numeracy)</option>
            </select>
            <select
              value={filters.level}
              onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
              className="w-full border rounded-lg px-4 py-3 bg-slate-700 text-black focus:outline-none focus:ring-2 border-slate-500 focus:ring-blue-400"
            >
              <option value="">All Levels</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {listLoading && (
            <p className="text-slate-300">Loading assessments...</p>
          )}

          {!listLoading && listError && (
            <p className="text-red-400">{listError}</p>
          )}

          {!listLoading && !listError && filteredAssessments.length === 0 && (
            <p className="text-slate-300">No assessments found for the selected filters.</p>
          )}

          {!listLoading && !listError && filteredAssessments.length > 0 && (
            <div className="space-y-3">
              {filteredAssessments.map((assessment) => (
                <div
                  key={assessment._id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-slate-700 border border-slate-600 rounded-lg p-4"
                >
                  <div className="text-slate-200">
                    <p className="font-semibold text-white">
                      {assessment.category === "literacy" ? "Kusoma" : "Kuandika"} • {assessment.level}
                    </p>
                    <p className="text-sm text-slate-300">
                      {assessment.questions?.length || 0} questions
                    </p>
                    <p className="text-xs text-slate-400">
                      Created: {assessment.createdAt ? new Date(assessment.createdAt).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleDelete(assessment._id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
