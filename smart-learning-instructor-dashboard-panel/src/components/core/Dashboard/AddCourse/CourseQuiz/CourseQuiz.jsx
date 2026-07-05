import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { X, Image, Plus, ChevronDown } from "lucide-react";
import { createCourseQuiz, editCourseQuiz, getFullDetailsOfCourse } from "../../../../../services/operations/courseDetailsAPI";
import { setStep } from "../../../../../slices/courseSlice";

const CourseQuiz = ({ editQuiz }) => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const { course } = useSelector((state) => state.course);
  const { quiz, editQuiz: editQuizState } = useSelector((state) => state.quiz || {});

  const [loading, setLoading] = useState(false);
  const [courseId, setCourseId] = useState("");

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      questions: [],
    },
  });

  const { fields: questionFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({
    control,
    name: "questions",
  });

  // Initialize form on edit or new
  useEffect(() => {
    if (editQuizState && quiz) {
      setCourseId(quiz.courseId || course._id);
      const preparedQuestions = (quiz.questions || []).map((q) => ({
        type: q.type?.toLowerCase() || "mcq",
        pairs: q.pairs || [],
        question: q.question || "",
        questionImage: null,
        questionImagePreview: q.questionImage || null,
        options: (q.options || []).map((opt) => ({
          text: opt.text || "",
          image: null,
          imagePreview: opt.image || null,
        })),
        correctAnswerIndex: q.correctAnswerIndex || 0,
      }));
      setValue("questions", preparedQuestions);
    } else {
      setCourseId(course._id || "");
      appendQuestion({
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
      });
    }
  }, [editQuizState, quiz, course, appendQuestion, setValue]);

  // Convert file to base64
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

  // Question Image Upload
  const handleQuestionImageUpload = async (qIndex, file) => {
    if (!file) return;
    const base64 = await fileToBase64String(file);
    setValue(`questions.${qIndex}.questionImage`, file);
    setValue(`questions.${qIndex}.questionImagePreview`, base64);
  };
  const removeQuestionImage = (qIndex) => {
    setValue(`questions.${qIndex}.questionImage`, null);
    setValue(`questions.${qIndex}.questionImagePreview`, null);
  };

  // Option Image Upload
  const handleOptionImageUpload = async (qIndex, oIndex, file) => {
    if (!file) return;
    const base64 = await fileToBase64String(file);
    setValue(`questions.${qIndex}.options.${oIndex}.image`, file);
    setValue(`questions.${qIndex}.options.${oIndex}.imagePreview`, base64);
  };
  const removeOptionImage = (qIndex, oIndex) => {
    setValue(`questions.${qIndex}.options.${oIndex}.image`, null);
    setValue(`questions.${qIndex}.options.${oIndex}.imagePreview`, null);
  };

  // Add / Remove options
  const addOption = (qIndex) => {
    const options = getValues(`questions.${qIndex}.options`);
    if (options.length >= 6) {
      toast.error("Maximum 6 options allowed");
      return;
    }
    setValue(`questions.${qIndex}.options`, [...options, { text: "", image: null, imagePreview: null }]);
  };
  const removeOption = (qIndex, oIndex) => {
    const options = getValues(`questions.${qIndex}.options`);
    if (options.length <= 2) {
      toast.error("At least 2 options are required");
      return;
    }
    options.splice(oIndex, 1);
    setValue(`questions.${qIndex}.options`, options);

    const correctIndex = getValues(`questions.${qIndex}.correctAnswerIndex`);
    if (correctIndex === oIndex || correctIndex >= options.length) {
      setValue(`questions.${qIndex}.correctAnswerIndex`, 0);
    }
  };

  // Set correct answer index
  const setCorrectAnswer = (qIndex, optionIndex) => {
    setValue(`questions.${qIndex}.correctAnswerIndex`, optionIndex);
  };

  // Add / Remove questions
  const addQuestion = () => {
    appendQuestion({
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
    });
  };
  const removeQuestionByIndex = (index) => {
    removeQuestion(index);
  };

  // Submit handler
  const onSubmit = async (data) => {
    console.log("Form submitted with data:", data);
    console.log("Course ID:", courseId);
    console.log("Token:", token ? "Present" : "Not present");
    console.log("Edit Quiz State:", editQuizState);

    if (!courseId) {
      toast.error("Please provide a course ID");
      return;
    }
    if (data.questions.length === 0) {
      toast.error("Please add at least one question");
      return;
    }

    // Validation
    for (const [qIndex, question] of data.questions.entries()) {
      if (!question.question.trim()) {
        toast.error(`Question ${qIndex + 1} text is required`);
        return;
      }
      if (question.type === "mcq") {
        if (!question.options || question.options.length < 2) {
          toast.error(`Question ${qIndex + 1} must have at least 2 options`);
          return;
        }
        for (const [oIndex, option] of question.options.entries()) {
          if (!option.text.trim()) {
            toast.error(`Option ${oIndex + 1} in Question ${qIndex + 1} is required`);
            return;
          }
        }
      }
      if (question.type === "dragdrop") {
        if (!question.pairs || question.pairs.length === 0) {
          toast.error(`Question ${qIndex + 1} must have at least one pair`);
          return;
        }
        for (const [pIndex, pair] of question.pairs.entries()) {
          if (!pair.left.trim() || !pair.right.trim()) {
            toast.error(`Both left and right values are required for pair ${pIndex + 1} in Question ${qIndex + 1}`);
            return;
          }
        }
      }
    }

    setLoading(true);
    try {
      // Process questions and convert images to base64
      const processedQuestions = await Promise.all(
        data.questions.map(async (q) => {
          const questionImage = q.questionImage
            ? await fileToBase64String(q.questionImage)
            : q.questionImagePreview?.startsWith("data:")
            ? q.questionImagePreview
            : null;

          const options = await Promise.all(
            (q.options || []).map(async (opt) => ({
              text: opt.text,
              image: opt.image
                ? await fileToBase64String(opt.image)
                : opt.imagePreview?.startsWith("data:")
                ? opt.imagePreview
                : null,
            }))
          );

          if (q.type === "dragdrop") {
            return {
              question: q.question,
              questionImage,
              type: "DragDrop",
              pairs: (q.pairs || []).map((p) => ({
                drag: p.left,
                drop: p.right,
              })),
            };
          } else {
            return {
              question: q.question,
              questionImage,
              type: "MCQ",
              options,
              correctAnswerIndex: q.correctAnswerIndex,
            };
          }
        })
      );

      const quizData = {
        courseId,
        questions: processedQuestions,
      };

      console.log("Processed quiz data:", quizData);

      let result;
      if (editQuizState) {
        quizData.quizId = quiz._id;
        console.log("Calling editCourseQuiz...");
        result = await editCourseQuiz(quizData, token);
      } else {
        console.log("Calling createCourseQuiz...");
        result = await createCourseQuiz(quizData, token);
      }

      console.log("API Result:", result);

      if (result) {
        // Refresh full course details so UI reflects linked quizzes/subsections
        try {
          const updated = await getFullDetailsOfCourse(course._id, token);
          if (updated) {
            dispatch(setCourse(updated));
          }
        } catch (err) {
          console.error('Failed to refresh course after saving quiz', err);
        }
      }

      toast.success("Quiz saved successfully!");
      // Proceed to next step
      setTimeout(() => {
        dispatch(setStep(4));
      }, 800);
    } catch (error) {
      console.error("Error in onSubmit:", error);
      toast.error(`Unexpected error occurred: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Header */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/20 shadow-2xl">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Quiz Assessment</h2>
                <p className="text-blue-200">Create engaging quizzes for your course</p>
              </div>
              <button
                type="button"
                onClick={() => dispatch(setStep(2))}
                className="px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/20"
              >
                ← Back
              </button>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-8">
            {questionFields.map((question, qIndex) => {
              const questionType = watch(`questions.${qIndex}.type`) || "mcq";
              const options = watch(`questions.${qIndex}.options`) || [];
              const correctAnswerIndex = watch(`questions.${qIndex}.correctAnswerIndex`) ?? 0;
              const questionImagePreview = watch(`questions.${qIndex}.questionImagePreview`);

              return (
                <div key={question.id} className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl relative">
                  {/* Remove Question Button */}
                  <button
                    type="button"
                    onClick={() => removeQuestionByIndex(qIndex)}
                    className="absolute top-4 right-4 p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 rounded-full transition-all duration-300"
                    aria-label="Remove question"
                  >
                    <X size={20} />
                  </button>

                  {/* Question Header */}
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white font-bold">
                        {qIndex + 1}
                      </div>
                      <h3 className="text-xl font-semibold text-white">Question {qIndex + 1}</h3>
                    </div>
                    
                    <textarea
                      {...register(`questions.${qIndex}.question`, { required: "Question text is required" })}
                      rows={3}
                      className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                      placeholder="Enter your question here..."
                    />
                    {errors.questions?.[qIndex]?.question && (
                      <p className="text-red-300 text-sm mt-2 flex items-center gap-2">
                        <span className="w-1 h-1 bg-red-300 rounded-full"></span>
                        {errors.questions[qIndex].question.message}
                      </p>
                    )}
                  </div>

                  {/* Question Image Upload */}
                  <div className="mb-6">
                    <label className="block text-white font-medium mb-3">Question Image (optional)</label>
                    {questionImagePreview ? (
                      <div className="relative inline-block">
                        <div className="relative w-64 h-40 rounded-xl overflow-hidden shadow-lg border border-white/20">
                          <img
                            src={questionImagePreview}
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
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor={`question-image-upload-${qIndex}`}
                        className="flex items-center gap-3 cursor-pointer border-2 border-dashed border-white/30 hover:border-blue-400 rounded-xl p-6 transition-all duration-300 bg-white/5 hover:bg-white/10"
                      >
                        <div className="p-3 bg-blue-500/20 rounded-lg">
                          <Image className="text-blue-300" size={24} />
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

                  {/* Question Type Selector */}
                  <div className="mb-6">
                    <label className="block text-white font-medium mb-3">Question Type</label>
                    <div className="relative">
                      <select
                        {...register(`questions.${qIndex}.type`)}
                        className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent appearance-none transition-all duration-300"
                        onChange={(e) => {
                          const newType = e.target.value;
                          setValue(`questions.${qIndex}.type`, newType);
                          if (newType === "mcq" && (!options || options.length < 2)) {
                            setValue(`questions.${qIndex}.options`, [
                              { text: "", image: null, imagePreview: null },
                              { text: "", image: null, imagePreview: null },
                            ]);
                          } else if (newType === "dragdrop") {
                            setValue(`questions.${qIndex}.pairs`, [{ left: "", right: "" }]);
                          }
                        }}
                      >
                        <option value="mcq">Multiple Choice (MCQ)</option>
                        <option value="dragdrop">Drag & Drop</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 pointer-events-none" size={20} />
                    </div>
                  </div>

                  {/* MCQ Options */}
                  {questionType === "mcq" && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-white mb-4">Answer Options</h4>
                      {(options || []).map((option, oIndex) => {
                        const optionImagePreview = watch(`questions.${qIndex}.options.${oIndex}.imagePreview`);
                        const isCorrect = correctAnswerIndex === oIndex;
                        
                        return (
                          <div key={oIndex} className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                            isCorrect 
                              ? 'bg-green-500/20 border-green-400 shadow-lg shadow-green-500/20' 
                              : 'bg-white/5 border-white/20 hover:border-white/40'
                          }`}>
                            <div className="flex items-center gap-4">
                              <label className="flex items-center cursor-pointer">
                                <input
                                  type="radio"
                                  name={`correctAnswer-${qIndex}`}
                                  checked={correctAnswerIndex === oIndex}
                                  onChange={() => setCorrectAnswer(qIndex, oIndex)}
                                  className="w-5 h-5 text-green-500 bg-white/10 border-white/30 focus:ring-green-400 focus:ring-2"
                                  aria-label={`Mark option ${oIndex + 1} as correct answer`}
                                />
                                <span className="ml-2 text-white/80 text-sm">
                                  {isCorrect ? 'Correct Answer' : 'Mark as Correct'}
                                </span>
                              </label>
                              
                              <input
                                {...register(`questions.${qIndex}.options.${oIndex}.text`, {
                                  required: "Option text is required",
                                })}
                                type="text"
                                placeholder={`Option ${oIndex + 1}`}
                                className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
                              />

                              {/* Option Image */}
                              {optionImagePreview ? (
                                <div className="relative">
                                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-white/20">
                                    <img
                                      src={optionImagePreview}
                                      alt={`Option ${oIndex + 1} preview`}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeOptionImage(qIndex, oIndex)}
                                    className="absolute -top-1 -right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs"
                                    aria-label="Remove option image"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              ) : (
                                <label
                                  htmlFor={`option-image-upload-${qIndex}-${oIndex}`}
                                  className="cursor-pointer p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all duration-300 flex items-center gap-2"
                                >
                                  <Image size={16} className="text-white/60" />
                                  <span className="text-xs text-white/60">Image</span>
                                  <input
                                    id={`option-image-upload-${qIndex}-${oIndex}`}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleOptionImageUpload(qIndex, oIndex, e.target.files[0])}
                                  />
                                </label>
                              )}

                              <button
                                type="button"
                                onClick={() => removeOption(qIndex, oIndex)}
                                className="p-2 text-red-300 hover:text-red-200 hover:bg-red-500/20 rounded-lg transition-all duration-300"
                                aria-label="Remove option"
                              >
                                <X size={18} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      
                      <button
                        type="button"
                        onClick={() => addOption(qIndex)}
                        className="w-full p-4 border-2 border-dashed border-white/30 hover:border-blue-400 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <Plus size={20} />
                        Add Option
                      </button>
                    </div>
                  )}

                  {/* Drag & Drop Pairs */}
                  {questionType === "dragdrop" && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-white mb-4">Drag & Drop Pairs</h4>
                      {watch(`questions.${qIndex}.pairs`)?.map((pair, pIndex) => (
                        <div key={pIndex} className="p-4 bg-white/5 rounded-xl border border-white/20">
                          <div className="flex gap-4 items-center">
                            <div className="flex-1">
                              <label className="block text-white/80 text-sm mb-2">Drag Item</label>
                              <input
                                {...register(`questions.${qIndex}.pairs.${pIndex}.left`, { required: "Left item is required" })}
                                placeholder={`Drag item ${pIndex + 1}`}
                                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
                              />
                            </div>
                            
                            <div className="text-white/60 text-2xl">→</div>
                            
                            <div className="flex-1">
                              <label className="block text-white/80 text-sm mb-2">Drop Target</label>
                              <input
                                {...register(`questions.${qIndex}.pairs.${pIndex}.right`, { required: "Right item is required" })}
                                placeholder={`Drop target ${pIndex + 1}`}
                                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
                              />
                            </div>
                            
                            <button
                              type="button"
                              onClick={() => {
                                const pairs = getValues(`questions.${qIndex}.pairs`);
                                if (pairs.length <= 1) {
                                  toast.error("At least one pair is required");
                                  return;
                                }
                                pairs.splice(pIndex, 1);
                                setValue(`questions.${qIndex}.pairs`, pairs);
                              }}
                              className="p-2 text-red-300 hover:text-red-200 hover:bg-red-500/20 rounded-lg transition-all duration-300"
                              aria-label="Remove pair"
                            >
                              <X size={20} />
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      <button
                        type="button"
                        onClick={() => {
                          const pairs = getValues(`questions.${qIndex}.pairs`) || [];
                          setValue(`questions.${qIndex}.pairs`, [...pairs, { left: "", right: "" }]);
                        }}
                        className="w-full p-4 border-2 border-dashed border-white/30 hover:border-blue-400 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <Plus size={20} />
                        Add Pair
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Add Question Button */}
            <div className="text-center">
              <button
                type="button"
                onClick={addQuestion}
                className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 flex items-center gap-3 mx-auto"
              >
                <Plus size={20} />
                Add New Question
              </button>
            </div>

            {/* Footer Actions */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl">
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => dispatch(setStep(2))}
                  disabled={loading}
                  className="px-8 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 border border-white/20"
                >
                  ← Back
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-semibold shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      Save & Continue
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseQuiz;