import { groupMealsByWeek, getDaysInWeek, getDayName, isToday } from './dateUtils';

/**
 * Calculate total nutrients from an array of meals
 * Returns { calories, protein, carbs, fat, ... }
 */
export const calculateTotals = (meals) => {
  const totals = { calories: 0 };
  const nutrients = {};

  meals.forEach((meal) => {
    totals.calories += meal.calories || 0;

    if (meal.nutrients) {
      Object.entries(meal.nutrients).forEach(([key, value]) => {
        nutrients[key] = (nutrients[key] || 0) + (value || 0);
      });
    }
  });

  return { ...totals, ...nutrients };
};

/**
 * Calculate average nutrients per day
 * @param {Array} meals - Array of meals
 * @param {number} days - Number of days to average over
 */
export const calculateAverages = (meals, days) => {
  if (days === 0 || !meals || meals.length === 0) {
    return { calories: 0 };
  }

  const totals = calculateTotals(meals);
  const averages = {};

  Object.entries(totals).forEach(([key, value]) => {
    averages[key] = Math.round(value / days);
  });

  return averages;
};

/**
 * Get daily breakdown for a week
 * Returns array of 7 days with date and nutrients
 */
const getDailyBreakdown = (meals, weekStart) => {
  const days = getDaysInWeek(weekStart);

  return days.map(day => {
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);

    const dayMeals = meals.filter(meal => {
      const mealDate = new Date(meal.timestamp);
      return mealDate >= dayStart && mealDate <= dayEnd;
    });

    const totals = calculateTotals(dayMeals);

    return {
      date: day,
      dayName: getDayName(day),
      ...totals,
      mealCount: dayMeals.length,
    };
  });
};

/**
 * Get weekly statistics for the last N weeks
 * @param {Array} meals - All meals
 * @param {number} numWeeks - Number of weeks to return (default 4)
 * @returns {Array} Array of week objects with totals and averages
 */
export const getWeeklyStats = (meals, numWeeks = 4) => {
  if (!meals || meals.length === 0) {
    return [];
  }

  const weeks = groupMealsByWeek(meals, numWeeks);

  return weeks.map(week => {
    const totalNutrients = calculateTotals(week.meals);
    const dailyAverages = calculateAverages(week.meals, 7);
    const dailyBreakdown = getDailyBreakdown(week.meals, week.weekStart);

    return {
      weekStart: week.weekStart,
      weekEnd: week.weekEnd,
      weekLabel: week.weekLabel,
      totalNutrients,
      dailyAverages,
      mealCount: week.meals.length,
      dailyBreakdown,
    };
  });
};

/**
 * Get trend data formatted for charts
 * @param {Array} dailyBreakdown - Array from getWeeklyStats
 * @param {string} metric - 'calories', 'protein', 'carbs', or 'fat'
 * @returns {Object} Chart-ready data with labels and values
 */
export const getTrendData = (dailyBreakdown, metric = 'calories') => {
  if (!dailyBreakdown || dailyBreakdown.length === 0) {
    return {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      data: [0, 0, 0, 0, 0, 0, 0],
    };
  }

  const labels = dailyBreakdown.map(day => day.dayName);
  const data = dailyBreakdown.map(day => day[metric] || 0);

  return { labels, data };
};

/**
 * Get today's meals from all meals
 */
export const getTodaysMeals = (meals) => {
  if (!meals || meals.length === 0) return [];

  return meals.filter(meal => isToday(meal.timestamp));
};

/**
 * Get today's totals
 */
export const getTodaysTotals = (meals) => {
  const todaysMeals = getTodaysMeals(meals);
  return calculateTotals(todaysMeals);
};

/**
 * Get comparison between weeks
 * Returns percentage change from previous week
 */
export const getWeeklyComparison = (currentWeek, previousWeek, metric = 'calories') => {
  if (!previousWeek || !currentWeek) return null;

  const current = currentWeek.totalNutrients[metric] || 0;
  const previous = previousWeek.totalNutrients[metric] || 0;

  if (previous === 0) return null;

  const percentageChange = ((current - previous) / previous) * 100;
  return {
    change: current - previous,
    percentageChange: Math.round(percentageChange),
    increased: current > previous,
  };
};

/**
 * Get nutrient summary for display
 * Formats large numbers with commas
 */
export const formatNutrientValue = (value) => {
  if (value === undefined || value === null) return '0';
  return Math.round(value).toLocaleString();
};
