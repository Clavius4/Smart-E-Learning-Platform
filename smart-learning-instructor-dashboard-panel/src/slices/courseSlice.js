import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  step: 1,
  course: null,
  quiz: null,  // ✅ Add this
 editQuiz: false,
  editCourse: false,
  paymentLoading: false,
}



const courseSlice = createSlice({
  name: "course",
  initialState,
  reducers: {
    setStep: (state, action) => {
      state.step = action.payload
    },
    setCourse: (state, action) => {
      state.course = action.payload
    },
    setQuiz: (state, action) => {  // ✅ Add this
      state.quiz = action.payload;
    },
    setEditQuiz: (state, action) => {  // ✅ Add this
      state.editQuiz = action.payload;
    },

    setEditCourse: (state, action) => {
      state.editCourse = action.payload
    },
    setPaymentLoading: (state, action) => {
      state.paymentLoading = action.payload
    },
    resetCourseState: (state) => {
      state.step = 1
      state.course = null
      state.editCourse = false
      state.quiz = null;  // ✅ Reset quiz
      state.editQuiz = false;
    },
  },
})

export const {
  setStep,
  setCourse,
  setEditCourse,
  setPaymentLoading,
  resetCourseState,
    setQuiz,  
  setEditQuiz, 
} = courseSlice.actions

export default courseSlice.reducer


// const initialState = {
//   step: 1,
//   course: null,
//   quiz: null,  // ✅ Add this
//   editQuiz: false,  // ✅ Add this
//   paymentLoading: false,
// };

// const courseSlice = createSlice({
//   name: "course",
//   initialState,
//   reducers: {
//     setStep: (state, action) => {
//       state.step = action.payload;
//     },
//     setCourse: (state, action) => {
//       state.course = action.payload;
//     },
//     setQuiz: (state, action) => {  // ✅ Add this
//       state.quiz = action.payload;
//     },
//     setEditCourse: (state, action) => {  // ✅ Add this
//       state.editQuiz = action.payload;
//     },
//     setPaymentLoading: (state, action) => {
//       state.paymentLoading = action.payload;
//     },
//     resetCourseState: (state) => {
//       state.step = 1;
//       state.course = null;
//       state.quiz = null;  // ✅ Reset quiz
//       state.editQuiz = false;  // ✅ Reset editQuiz
//     },
//   },
// });

// export const {
//   setStep,
//   setCourse,
//   setQuiz,  // ✅ Export this
//   setEditQuiz,  // ✅ Export this
//   setPaymentLoading,
//   resetCourseState,
// } = courseSlice.actions;

// export default courseSlice.reducer;
