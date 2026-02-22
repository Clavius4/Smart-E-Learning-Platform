import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Upload, X, Plus } from "lucide-react";
import { createCourseQuiz, editCourseQuiz } from "../../../services/operations/courseDetailsAPI";
import { setStep } from "../../../slices/courseSlice";

const IntermediateAssesment = ({ editQuiz }) => {
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
    formState: { errors },
  } = useForm({
    defaultValues: {
      questions: [],
    },
  });

  const { fields: questionFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({
    control,
    name: "questions",
  });

  useEffect(() => {
    (async () => {
      if (editQuizState && quiz) {
        setCourseId(quiz.courseId || course?._id || "");
        const preparedQuestions = (quiz.questions || []).map((q) => ({
          type: q.type?.toLowerCase() === "dragdrop" ? "dragdrop" : "mcq",
          pairs: q.pairs?.map((p) => ({ left: p.drag, right: p.drop })) || [],
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
        setCourseId(course?._id || "");
        if (!quiz || !quiz._id) {
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
      }
    })();
  }, [editQuizState, quiz, course, appendQuestion, setValue]);

  const fileToBase64String = (file) =>
    new Promise((resolve) => {
      if (!file) {
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
    });

  const handleQuestionImageUpload = async (index, file) => {
    if (!file) return;
    const base64String = await fileToBase64String(file);
    setValue(`questions.${index}.questionImage`, file);
    setValue(`questions.${index}.questionImagePreview`, base64String);
  };

  const removeQuestionImage = (index) => {
    setValue(`questions.${index}.questionImage`, null);
    setValue(`questions.${index}.questionImagePreview`, null);
  };

  const handleOptionImageUpload = async (qIndex, oIndex, file) => {
    if (!file) return;
    const base64String = await fileToBase64String(file);
    setValue(`questions.${qIndex}.options.${oIndex}.image`, file);
    setValue(`questions.${qIndex}.options.${oIndex}.imagePreview`, base64String);
  };

  const removeOptionImage = (qIndex, oIndex) => {
    setValue(`questions.${qIndex}.options.${oIndex}.image`, null);
    setValue(`questions.${qIndex}.options.${oIndex}.imagePreview`, null);
  };

  const addOption = (qIndex) => {
    const options = getValues(`questions.${qIndex}.options`) || [];
    if (options.length >= 6) {
      toast.error("Maximum 6 options allowed");
      return;
    }
    setValue(`questions.${qIndex}.options`, [...options, { text: "", image: null, imagePreview: null }]);
  };

  const removeOption = (qIndex, oIndex) => {
    const options = getValues(`questions.${qIndex}.options`) || [];
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

  const setCorrectAnswer = (qIndex, optionIndex) => {
    setValue(`questions.${qIndex}.correctAnswerIndex`, optionIndex);
  };

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

  const onSubmit = async (data) => {
    if (!courseId) {
      toast.error("Please provide a course ID");
      return;
    }
    if (data.questions.length === 0) {
      toast.error("Please add at least one question");
      return;
    }
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

      if (editQuizState) {
        if (!quiz || !quiz._id) {
          toast.error("Quiz data is missing. Please reload or try again.");
          setLoading(false);
          return;
        }
        await editCourseQuiz(quiz._id, quizData, token);
        toast.success("Quiz updated successfully");
      } else {
        await createCourseQuiz(quizData, token);
        toast.success("Quiz created successfully");
      }

      dispatch(setStep(4));
    } catch (error) {
      toast.error(error?.message || "Failed to save quiz");
    } finally {
      setLoading(false);
    }
  };

  const questions = watch("questions") || [];

  return (
    <>
     <h2 className="text-2xl text-white font-bold mb-6">Intermediate Assessment Level</h2>
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {questionFields.map((questionField, qIndex) => (
        <div
          key={questionField.id}
          className="border rounded-lg p-6 shadow-sm bg-gray-50 relative"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg text-gray-800">Question {qIndex + 1}</h3>
            <button
              type="button"
              onClick={() => removeQuestion(qIndex)}
              className="text-red-500 hover:text-red-700 transition-colors"
              aria-label={`Remove question ${qIndex + 1}`}
            >
              <X size={20} />
            </button>
          </div>

          {/* Question Text */}
          <div className="mb-4">
            <label htmlFor={`questions.${qIndex}.question`} className="block text-sm font-medium text-gray-700 mb-1">
              Question Text
            </label>
            <textarea
              {...register(`questions.${qIndex}.question`, { required: "Question is required" })}
              id={`questions.${qIndex}.question`}
              rows={3}
              className={`block w-full rounded-md border px-3 py-2 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
                errors?.questions?.[qIndex]?.question ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter your question here"
            />
            {errors?.questions?.[qIndex]?.question && (
              <p className="text-sm text-red-600 mt-1">{errors.questions[qIndex].question.message}</p>
            )}
          </div>

          {/* Question Image Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Question Image (optional)</label>
            <div className="flex items-center space-x-4">
              {questionField.questionImagePreview ? (
                <div className="relative w-24 h-24 rounded border border-gray-300 overflow-hidden shadow-sm">
                  <img
                    src={questionField.questionImagePreview}
                    alt={`Question ${qIndex + 1} image`}
                    className="object-cover w-full h-full"
                  />
                  <button
                    type="button"
                    onClick={() => removeQuestionImage(qIndex)}
                    className="absolute top-1 right-1 bg-white rounded-full p-1 text-red-600 hover:text-red-800 shadow-md"
                    aria-label="Remove question image"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor={`questionImage-${qIndex}`}
                  className="cursor-pointer flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-400 rounded-md hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
                >
                  <Upload size={24} className="text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500">Upload Image</span>
                  <input
                    type="file"
                    id={`questionImage-${qIndex}`}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleQuestionImageUpload(qIndex, e.target.files[0])}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Options for MCQ */}
          {questionField.type === "mcq" && (
            <div className="mb-4">
              <h4 className="font-semibold text-md text-gray-700 mb-3">Options</h4>
              {(questions[qIndex]?.options || []).map((option, oIndex) => (
                <div key={oIndex} className="flex items-center mb-3 space-x-3">
                  <input
                    type="radio"
                    name={`correctAnswer-${qIndex}`}
                    checked={questions[qIndex]?.correctAnswerIndex === oIndex}
                    onChange={() => setCorrectAnswer(qIndex, oIndex)}
                    className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    aria-label={`Set option ${oIndex + 1} as correct answer for question ${qIndex + 1}`}
                  />
                  <input
                    type="text"
                    {...register(`questions.${qIndex}.options.${oIndex}.text`, { required: "Option text required" })}
                    placeholder={`Option ${oIndex + 1} text`}
                    className={`flex-1 rounded-md border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
                      errors?.questions?.[qIndex]?.options?.[oIndex]?.text ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {/* Option image upload */}
                  {option.imagePreview ? (
                    <div className="relative w-16 h-16 rounded border border-gray-300 overflow-hidden shadow-sm">
                      <img src={option.imagePreview} alt={`Option ${oIndex + 1} image`} className="object-cover w-full h-full" />
                      <button
                        type="button"
                        onClick={() => removeOptionImage(qIndex, oIndex)}
                        className="absolute top-0 right-0 bg-white rounded-full p-1 text-red-600 hover:text-red-800 shadow-md"
                        aria-label={`Remove image from option ${oIndex + 1} in question ${qIndex + 1}`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor={`optionImage-${qIndex}-${oIndex}`}
                      className="cursor-pointer flex items-center justify-center w-16 h-16 border-2 border-dashed border-gray-400 rounded-md hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
                    >
                      <Upload size={18} className="text-gray-400" />
                      <input
                        type="file"
                        id={`optionImage-${qIndex}-${oIndex}`}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleOptionImageUpload(qIndex, oIndex, e.target.files[0])}
                      />
                    </label>
                  )}

                  <button
                    type="button"
                    onClick={() => removeOption(qIndex, oIndex)}
                    className="text-red-500 hover:text-red-700 ml-2 p-1"
                    aria-label={`Remove option ${oIndex + 1} from question ${qIndex + 1}`}
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addOption(qIndex)}
                className="inline-flex items-center space-x-1 px-3 py-1.5 text-indigo-600 hover:text-indigo-800 border border-indigo-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label={`Add option to question ${qIndex + 1}`}
              >
                <Plus size={16} />
                <span>Add Option</span>
              </button>
            </div>
          )}

          {/* TODO: Drag and drop question type UI if needed */}
        </div>
      ))}

      <div className="flex justify-between items-center max-w-4xl mx-auto px-6">
        <button
          type="button"
          onClick={addQuestion}
          className="inline-flex items-center space-x-2 px-4 py-2 border border-indigo-600 rounded-md text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <Plus size={20} />
          <span>Add Question</span>
        </button>

        <button
          type="submit"
          disabled={loading}
          className={`px-6 py-2 rounded-md text-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${
            loading ? "bg-indigo-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {loading ? "Saving..." : editQuizState ? "Update Quiz" : "Create Quiz"}
        </button>
      </div>
    </form>
    </>
  );
};

export default IntermediateAssesment;
