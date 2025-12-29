import { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { getDiagnosis } from '../services/airiaAPI';

export default function DiagnosisModal({ visible, onClose, savedMeals, apiKey }) {
  const [userInput, setUserInput] = useState('');
  const [daysToAnalyze, setDaysToAnalyze] = useState('7');
  const [loading, setLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState(null);
  const [error, setError] = useState(null);

  const filterMealsByDays = (meals, days) => {
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));

    return meals.filter(meal => {
      const mealDate = new Date(meal.timestamp);
      return mealDate >= cutoffDate;
    });
  };

  const handleDiagnose = async () => {
    // Check API key
    if (!apiKey || apiKey === 'your_api_key_here') {
      setError('API key not configured. Please check your configuration.');
      return;
    }

    // Check user input
    if (!userInput.trim()) {
      setError('Please describe how you are feeling or any concerns');
      return;
    }

    // Validate days
    const days = parseInt(daysToAnalyze);
    if (isNaN(days) || days < 1) {
      setError('Please enter a valid number of days');
      return;
    }

    // Check meals exist
    const filteredMeals = filterMealsByDays(savedMeals, days);
    if (filteredMeals.length === 0) {
      setError(`No meals found in the last ${days} days`);
      return;
    }

    // Proceed with API call
    setLoading(true);
    setError(null);

    const response = await getDiagnosis(filteredMeals, userInput, apiKey);

    if (!response.success) {
      setError(response.error);
      setLoading(false);
      return;
    }

    setDiagnosis(response);
    setLoading(false);
  };

  const resetModal = () => {
    setUserInput('');
    setDaysToAnalyze('7');
    setLoading(false);
    setDiagnosis(null);
    setError(null);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const renderDiagnosisResult = () => {
    if (!diagnosis || !diagnosis.data) return null;

    let diagnosisText = '';

    // Parse the diagnosis from the response
    if (diagnosis.data.$type === 'string' && diagnosis.data.result) {
      try {
        // Try to parse as JSON first
        const parsed = JSON.parse(diagnosis.data.result);
        diagnosisText = typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2);
      } catch {
        // If not JSON, use as plain text
        diagnosisText = diagnosis.data.result;
      }
    } else if (diagnosis.data.result) {
      diagnosisText = diagnosis.data.result;
    } else {
      diagnosisText = 'Diagnosis completed successfully, but no details were provided.';
    }

    return (
      <View>
        <Text style={styles.sectionTitle}>Diagnosis & Recommendations</Text>
        <View style={styles.diagnosisCard}>
          <ScrollView style={styles.diagnosisScroll}>
            <Text style={styles.diagnosisText}>{diagnosisText}</Text>
          </ScrollView>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <Text style={styles.title}>Diet Analysis</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeIcon}>
                <Text style={styles.closeIconText}>✕</Text>
              </TouchableOpacity>
            </View>

            {!diagnosis && !loading && (
              <View>
                <Text style={styles.label}>How are you feeling? Any concerns?</Text>
                <TextInput
                  style={styles.textArea}
                  value={userInput}
                  onChangeText={setUserInput}
                  placeholder="e.g., Feeling tired lately, stomach issues, etc."
                  multiline
                  numberOfLines={4}
                />

                <Text style={styles.label}>Days to analyze</Text>
                <TextInput
                  style={styles.input}
                  value={daysToAnalyze}
                  onChangeText={setDaysToAnalyze}
                  placeholder="7"
                  keyboardType="number-pad"
                />

                {error && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                <TouchableOpacity style={styles.diagnoseButton} onPress={handleDiagnose}>
                  <Text style={styles.diagnoseButtonText}>Diagnose</Text>
                </TouchableOpacity>
              </View>
            )}

            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Analyzing your diet...</Text>
              </View>
            )}

            {diagnosis && !loading && renderDiagnosisResult()}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  closeIcon: {
    padding: 5,
  },
  closeIconText: {
    fontSize: 24,
    color: '#666',
    fontWeight: '300',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  diagnoseButton: {
    backgroundColor: '#34C759',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  diagnoseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    padding: 15,
    backgroundColor: '#fee',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#f00',
    marginTop: 15,
  },
  errorText: {
    fontSize: 15,
    color: '#600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  diagnosisCard: {
    backgroundColor: '#f0f7ff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    maxHeight: 400,
  },
  diagnosisScroll: {
    maxHeight: 380,
  },
  diagnosisText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  closeButton: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
