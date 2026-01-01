/**
 * Format timestamp to time string (e.g., "2:30 PM")
 */
export const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format timestamp to date string (e.g., "Dec 29, 2025")
 */
export const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

/**
 * Format date to short format (e.g., "Dec 29")
 */
export const formatDateShort = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Check if timestamp is today
 */
export const isToday = (timestamp) => {
  const date = new Date(timestamp);
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
};

/**
 * Get the start and end of a week for a given date (Monday - Sunday)
 */
export const getWeekBoundaries = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday

  const weekStart = new Date(d.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return { weekStart, weekEnd };
};

/**
 * Get an array of the 7 days in a week starting from weekStart
 */
export const getDaysInWeek = (weekStart) => {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    days.push(day);
  }
  return days;
};

/**
 * Group meals by week
 * Returns array of weeks, each with weekStart, weekEnd, and meals
 */
export const groupMealsByWeek = (meals, numWeeks = 4) => {
  if (!meals || meals.length === 0) return [];

  // Sort meals by timestamp (newest first)
  const sortedMeals = [...meals].sort((a, b) => b.timestamp - a.timestamp);

  // Get current week boundaries
  const currentWeekBounds = getWeekBoundaries(new Date());

  const weeks = [];

  // Generate the last N weeks
  for (let i = 0; i < numWeeks; i++) {
    const weekStart = new Date(currentWeekBounds.weekStart);
    weekStart.setDate(weekStart.getDate() - (i * 7));

    const { weekStart: start, weekEnd: end } = getWeekBoundaries(weekStart);

    // Filter meals for this week
    const weekMeals = sortedMeals.filter(meal => {
      const mealDate = new Date(meal.timestamp);
      return mealDate >= start && mealDate <= end;
    });

    weeks.push({
      weekStart: start,
      weekEnd: end,
      weekLabel: `${formatDateShort(start)} - ${formatDateShort(end)}`,
      meals: weekMeals,
    });
  }

  return weeks;
};

/**
 * Get day name from date (e.g., "Mon", "Tue")
 */
export const getDayName = (date) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[new Date(date).getDay()];
};

/**
 * Filter meals by date range
 */
export const filterMealsByDateRange = (meals, startDate, endDate) => {
  return meals.filter(meal => {
    const mealDate = new Date(meal.timestamp);
    return mealDate >= startDate && mealDate <= endDate;
  });
};

/**
 * Get meals from the last N days
 */
export const getRecentMeals = (meals, days = 7) => {
  const now = new Date();
  const cutoffDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));

  return meals.filter(meal => {
    const mealDate = new Date(meal.timestamp);
    return mealDate >= cutoffDate;
  });
};
