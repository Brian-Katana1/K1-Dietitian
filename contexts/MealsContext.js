import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  calculateTotals,
  getTodaysMeals,
  getTodaysTotals,
  getWeeklyStats,
} from '../utils/nutritionCalculations';
import { filterMealsByDateRange } from '../utils/dateUtils';

const MealsContext = createContext();

export const useMeals = () => {
  const context = useContext(MealsContext);
  if (!context) {
    throw new Error('useMeals must be used within a MealsProvider');
  }
  return context;
};

export const MealsProvider = ({ children }) => {
  const [savedMeals, setSavedMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMeals = useCallback(async () => {
    try {
      setLoading(true);
      const storedMeals = await AsyncStorage.getItem('savedMeals');
      if (storedMeals) {
        const parsedMeals = JSON.parse(storedMeals);
        setSavedMeals(parsedMeals);
      }
    } catch (error) {
      console.error('Error loading meals:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load meals from AsyncStorage on mount
  useEffect(() => {
    loadMeals();
  }, [loadMeals]);

  const saveMealsToStorage = async (meals) => {
    try {
      await AsyncStorage.setItem('savedMeals', JSON.stringify(meals));
    } catch (error) {
      console.error('Error saving meals:', error);
      throw error;
    }
  };

  const addMeal = useCallback(async (meal) => {
    try {
      const mealWithId = {
        ...meal,
        id: Date.now().toString(),
        timestamp: Date.now(),
      };

      const updatedMeals = [...savedMeals, mealWithId];
      setSavedMeals(updatedMeals);
      await saveMealsToStorage(updatedMeals);
      return mealWithId;
    } catch (error) {
      console.error('Error adding meal:', error);
      throw error;
    }
  }, [savedMeals]);

  const updateMeal = useCallback(async (id, updates) => {
    try {
      const updatedMeals = savedMeals.map(meal =>
        meal.id === id ? { ...meal, ...updates } : meal
      );
      setSavedMeals(updatedMeals);
      await saveMealsToStorage(updatedMeals);
    } catch (error) {
      console.error('Error updating meal:', error);
      throw error;
    }
  }, [savedMeals]);

  const deleteMeal = useCallback(async (id) => {
    try {
      const updatedMeals = savedMeals.filter(meal => meal.id !== id);
      setSavedMeals(updatedMeals);
      await saveMealsToStorage(updatedMeals);
    } catch (error) {
      console.error('Error deleting meal:', error);
      throw error;
    }
  }, [savedMeals]);

  const clearAllMeals = useCallback(async () => {
    try {
      setSavedMeals([]);
      await AsyncStorage.removeItem('savedMeals');
    } catch (error) {
      console.error('Error clearing meals:', error);
      throw error;
    }
  }, []);

  // Computed values
  const getTodaysMealsData = useCallback(() => {
    return getTodaysMeals(savedMeals);
  }, [savedMeals]);

  const getTodaysTotalsData = useCallback(() => {
    return getTodaysTotals(savedMeals);
  }, [savedMeals]);

  const getWeeklyStatsData = useCallback((numWeeks = 4) => {
    return getWeeklyStats(savedMeals, numWeeks);
  }, [savedMeals]);

  const getMealsByDateRange = useCallback((startDate, endDate) => {
    return filterMealsByDateRange(savedMeals, startDate, endDate);
  }, [savedMeals]);

  const getAllTotals = useCallback(() => {
    return calculateTotals(savedMeals);
  }, [savedMeals]);

  const value = {
    // State
    savedMeals,
    loading,

    // Actions
    addMeal,
    updateMeal,
    deleteMeal,
    clearAllMeals,
    loadMeals,

    // Computed values
    getTodaysMeals: getTodaysMealsData,
    getTodaysTotals: getTodaysTotalsData,
    getWeeklyStats: getWeeklyStatsData,
    getMealsByDateRange,
    getAllTotals,
  };

  return (
    <MealsContext.Provider value={value}>
      {children}
    </MealsContext.Provider>
  );
};
