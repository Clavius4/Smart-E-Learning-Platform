// utils/quizAdapter.js
export function adaptQuiz(originalQuiz, userProfile) {
    // 1. Filter questions by difficulty if needed
    let questions = originalQuiz.questions
    
    // 2. Adapt based on learning style
    if (userProfile.learningStyle === 'visual') {
      questions = questions.map(q => ({
        ...q,
        text: q.visualText || q.text,
        options: q.visualOptions || q.options
      }))
    }
    
    // 3. Sort by user interests
    questions.sort((a, b) => {
      const aInterest = a.tags.some(tag => userProfile.interests.includes(tag)) ? 1 : 0
      const bInterest = b.tags.some(tag => userProfile.interests.includes(tag)) ? 1 : 0
      return bInterest - aInterest
    })
    
    return {
      ...originalQuiz,
      questions
    }
  }