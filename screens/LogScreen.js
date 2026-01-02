import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import ImagePicker from '../components/ImagePicker';
import ResultDisplay from '../components/ResultDisplay';
import { analyzeImage } from '../services/airiaAPI';
import { useMeals } from '../contexts/MealsContext';
import { colors, spacing, typography, shadows } from '../constants/theme';

export default function LogScreen() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [result, setResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const { addMeal } = useMeals();
  const apiKey = Constants.expoConfig?.extra?.airiaApiKey || process.env.EXPO_PUBLIC_AIRIA_API_KEY;

  const handleImageSelected = (imageData) => {
    setSelectedImage(imageData);
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please select an image first');
      return;
    }

    if (!apiKey || apiKey === 'your_api_key_here') {
      Alert.alert('API Key Missing', 'Please configure your API key in the .env file');
      return;
    }

    setAnalyzing(true);
    setResult(null);

    try {
      const response = await analyzeImage(selectedImage, apiKey);

      if (!response.success) {
        Alert.alert('Analysis Failed', response.error);
        setAnalyzing(false);
        return;
      }

      setResult(response);
    } catch (error) {
      Alert.alert('Error', `Unexpected error: ${error.message}`);
      console.error('Error analyzing image:', error);
    }

    setAnalyzing(false);
  };

  const handleSaveMeal = async (meal) => {
    try {
      await addMeal(meal);
      setResult(null);
      setSelectedImage(null);
      Alert.alert('Success', 'Meal saved to your diet!', [
        { text: 'OK' }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save meal. Please try again.');
      console.error('Error saving meal:', error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Log Meal</Text>
            <Text style={styles.subtitle}>Take a photo to analyze your food</Text>
          </View>

          <ImagePicker
            onImageSelected={handleImageSelected}
            selectedImage={selectedImage}
          />

          {selectedImage && !analyzing && !result && (
            <TouchableOpacity style={styles.analyzeButton} onPress={handleAnalyze}>
              <Text style={styles.analyzeButtonText}>Analyze Image</Text>
            </TouchableOpacity>
          )}

          {analyzing && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Analyzing image...</Text>
            </View>
          )}

          {result && !analyzing && (
            <ResultDisplay result={result} onSave={handleSaveMeal} />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.caption,
  },
  analyzeButton: {
    backgroundColor: colors.success,
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    ...shadows.medium,
  },
  analyzeButtonText: {
    color: colors.background,
    ...typography.button,
    fontSize: 18,
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.sm,
    ...typography.body,
    color: colors.textSecondary,
  },
});
