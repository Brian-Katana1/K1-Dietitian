import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import ImagePicker from './components/ImagePicker';
import ResultDisplay from './components/ResultDisplay';
import { analyzeImage } from './services/airiaAPI';
import Constants from 'expo-constants';

export default function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedMeals, setSavedMeals] = useState([]);

  const apiKey = Constants.expoConfig?.extra?.airiaApiKey || process.env.EXPO_PUBLIC_AIRIA_API_KEY;

  const handleImageSelected = (imageData) => {
    setSelectedImage(imageData);
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      alert('Please select an image first');
      return;
    }

    if (!apiKey || apiKey === 'your_api_key_here') {
      alert('Please configure your API key in the .env file');
      return;
    }

    setLoading(true);
    setResult(null);

    const response = await analyzeImage(selectedImage, apiKey);
    setResult(response);
    setLoading(false);
  };

  const handleSaveMeal = (meal) => {
    setSavedMeals([...savedMeals, meal]);
    setResult(null);
    setSelectedImage(null);
    alert('Meal saved to your diet!');
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getTodaysTotals = () => {
    const totals = { calories: 0 };
    const nutrients = {};

    savedMeals.forEach((meal) => {
      totals.calories += meal.calories || 0;

      if (meal.nutrients) {
        Object.entries(meal.nutrients).forEach(([key, value]) => {
          nutrients[key] = (nutrients[key] || 0) + value;
        });
      }
    });

    return { ...totals, ...nutrients };
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>K1 Dietitian</Text>
          <Text style={styles.subtitle}>AI-Powered Food Analysis</Text>
        </View>

        <ImagePicker
          onImageSelected={handleImageSelected}
          selectedImage={selectedImage}
        />

        {selectedImage && !loading && (
          <TouchableOpacity style={styles.analyzeButton} onPress={handleAnalyze}>
            <Text style={styles.analyzeButtonText}>Analyze Image</Text>
          </TouchableOpacity>
        )}

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Analyzing image...</Text>
          </View>
        )}

        {result && !loading && (
          <ResultDisplay result={result} onSave={handleSaveMeal} />
        )}

        {savedMeals.length > 0 && (
          <View style={styles.todaysDietSection}>
            <Text style={styles.sectionTitle}>Today's Diet</Text>

            <View style={styles.totalsCard}>
              {Object.entries(getTodaysTotals()).map(([key, value]) => (
                <View key={key} style={styles.totalItem}>
                  <Text style={styles.totalValue}>
                    {value}{key === 'calories' ? '' : 'g'}
                  </Text>
                  <Text style={styles.totalLabel}>
                    {key === 'calories' ? 'Calories' : key.charAt(0).toUpperCase() + key.slice(1)}
                  </Text>
                </View>
              ))}
            </View>

            {savedMeals.map((meal, index) => (
              <View key={index} style={styles.mealCard}>
                <View style={styles.mealHeader}>
                  <Text style={styles.mealName}>{meal.name}</Text>
                  <Text style={styles.mealTime}>{formatTime(meal.timestamp)}</Text>
                </View>
                <Text style={styles.mealPortion}>{meal.portion}</Text>
                <View style={styles.mealNutrients}>
                  <Text style={styles.mealNutrientText}>{meal.calories} cal</Text>
                  {meal.nutrients && Object.entries(meal.nutrients).map(([key, value]) => (
                    <Text key={key} style={styles.mealNutrientText}>
                      {value}g {key}
                    </Text>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        <StatusBar style="auto" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  analyzeButton: {
    backgroundColor: '#34C759',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  todaysDietSection: {
    marginTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  totalsCard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    gap: 15,
  },
  totalItem: {
    minWidth: '30%',
    alignItems: 'center',
    marginBottom: 10,
  },
  totalValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#34C759',
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  mealCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  mealTime: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  mealPortion: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  mealNutrients: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  mealNutrientText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
});
