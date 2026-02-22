// utils/recommendations.js
export function getRecommendedCourses(userProfile, allCourses) {
    // 1. Filter by interests
    let recommendations = allCourses.filter(course => 
      userProfile.interests.some(interest => 
        course.tags.includes(interest)
      ))
    
    // 2. Adjust for learning style
    recommendations = recommendations.map(course => {
      let score = 0
      if (userProfile.learningStyle === 'visual' && course.visualContent) {
        score += 2
      }
      return {...course, recommendationScore: score}
    })
    
    // 3. Sort by recommendation score
    return recommendations.sort((a, b) => b.recommendationScore - a.recommendationScore)
  }