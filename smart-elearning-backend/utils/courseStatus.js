const DEFAULT_ACTIVE_COURSE_STATUSES = ['Draft'];

function getActiveCourseStatuses() {
  return (process.env.ACTIVE_COURSE_STATUSES || '')
    .split(',')
    .map((status) => status.trim())
    .filter(Boolean)
    .concat(process.env.ACTIVE_COURSE_STATUSES ? [] : DEFAULT_ACTIVE_COURSE_STATUSES);
}

function activeCourseStatusQuery() {
  const statuses = getActiveCourseStatuses();
  return statuses.length === 1
    ? { status: statuses[0] }
    : { status: { $in: statuses } };
}

module.exports = {
  activeCourseStatusQuery,
  getActiveCourseStatuses
};
