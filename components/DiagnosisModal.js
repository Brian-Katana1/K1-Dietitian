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
    if (!apiKey || apiKey === 'your_api_key_here') {
      setError('API key not configured. Please check your configuration.');
      return;
    }

    if (!userInput.trim()) {
      setError('Please describe how you are feeling or any concerns');
      return;
    }

    const days = parseInt(daysToAnalyze);
    if (isNaN(days) || days < 1) {
      setError('Please enter a valid number of days');
      return;
    }

    const filteredMeals = filterMealsByDays(savedMeals, days);
    if (filteredMeals.length === 0) {
      setError(`No meals found in the last ${days} days`);
      return;
    }

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

  const getAssessmentColor = (assessment) => {
    const colors = {
      excellent: '#34C759',
      good: '#5AC8FA',
      fair: '#FF9500',
      needs_improvement: '#FF9500',
      concerning: '#FF3B30',
    };
    return colors[assessment] || '#666';
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: '#FFD60A',
      moderate: '#FF9500',
      high: '#FF3B30',
    };
    return colors[severity] || '#666';
  };

  const getSeverityBadge = (severity) => {
    const labels = {
      low: 'Low',
      moderate: 'Moderate',
      high: 'High',
    };
    return labels[severity] || severity;
  };

  const renderDiagnosisResult = () => {
    if (!diagnosis || !diagnosis.data) return null;

    let diagnosisData = null;

    // Parse the diagnosis from the response
    if (diagnosis.data.$type === 'string' && diagnosis.data.result) {
      try {
        diagnosisData = JSON.parse(diagnosis.data.result);
      } catch (e) {
        console.error('Failed to parse diagnosis:', e);
        return (
          <View>
            <Text style={styles.errorText}>Failed to parse diagnosis data</Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        );
      }
    } else if (diagnosis.data.result) {
      try {
        diagnosisData = typeof diagnosis.data.result === 'string'
          ? JSON.parse(diagnosis.data.result)
          : diagnosis.data.result;
      } catch (e) {
        diagnosisData = null;
      }
    }

    if (!diagnosisData) {
      return (
        <View>
          <Text style={styles.errorText}>No diagnosis data available</Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View>
        {/* Overall Assessment Badge */}
        {diagnosisData.overall_assessment && (
          <View style={styles.assessmentContainer}>
            <View style={[
              styles.assessmentBadge,
              { backgroundColor: getAssessmentColor(diagnosisData.overall_assessment) }
            ]}>
              <Text style={styles.assessmentText}>
                {diagnosisData.overall_assessment.replace(/_/g, ' ').toUpperCase()}
              </Text>
            </View>
            {diagnosisData.analysis_period_days && (
              <Text style={styles.periodText}>
                {diagnosisData.analysis_period_days} day analysis
              </Text>
            )}
          </View>
        )}

        {/* Clinical Overview */}
        {diagnosisData.clinical_overview && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Clinical Overview</Text>
            <View style={styles.overviewCard}>
              <Text style={styles.overviewText}>{diagnosisData.clinical_overview}</Text>
            </View>
          </View>
        )}

        {/* Positive Findings */}
        {diagnosisData.positive_findings && diagnosisData.positive_findings.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✓ Positive Findings</Text>
            {diagnosisData.positive_findings.map((finding, index) => (
              <View key={index} style={styles.positiveFindingCard}>
                <Text style={styles.positiveFindingHabit}>{finding.habit}</Text>
                <Text style={styles.positiveFindingBenefit}>{finding.health_benefit}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Deficiencies */}
        {diagnosisData.deficiencies && diagnosisData.deficiencies.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚠ Identified Deficiencies</Text>
            {diagnosisData.deficiencies.map((deficiency, index) => (
              <View key={index} style={styles.deficiencyCard}>
                <View style={styles.deficiencyHeader}>
                  <Text style={styles.deficiencyNutrient}>
                    {deficiency.nutrient_or_food_group}
                  </Text>
                  <View style={[
                    styles.severityBadge,
                    { backgroundColor: getSeverityColor(deficiency.severity) }
                  ]}>
                    <Text style={styles.severityText}>
                      {getSeverityBadge(deficiency.severity)}
                    </Text>
                  </View>
                </View>
                {(deficiency.current_avg !== undefined && deficiency.recommended !== undefined) && (
                  <View style={styles.deficiencyStats}>
                    <View style={styles.statBox}>
                      <Text style={styles.statLabel}>Current</Text>
                      <Text style={styles.statValue}>
                        {deficiency.current_avg}{deficiency.unit || ''}
                      </Text>
                    </View>
                    <Text style={styles.statArrow}>→</Text>
                    <View style={styles.statBox}>
                      <Text style={styles.statLabel}>Recommended</Text>
                      <Text style={[styles.statValue, styles.recommendedValue]}>
                        {deficiency.recommended}{deficiency.unit || ''}
                      </Text>
                    </View>
                  </View>
                )}
                <Text style={styles.deficiencySignificance}>
                  {deficiency.clinical_significance}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Clinical Correlations */}
        {diagnosisData.clinical_correlations && diagnosisData.clinical_correlations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔗 Clinical Correlations</Text>
            {diagnosisData.clinical_correlations.map((correlation, index) => (
              <View key={index} style={styles.correlationCard}>
                <Text style={styles.correlationSymptom}>{correlation.symptom_or_goal}</Text>
                {correlation.dietary_factors && correlation.dietary_factors.length > 0 && (
                  <View style={styles.factorsContainer}>
                    {correlation.dietary_factors.map((factor, idx) => (
                      <View key={idx} style={styles.factorChip}>
                        <Text style={styles.factorText}>{factor}</Text>
                      </View>
                    ))}
                  </View>
                )}
                {correlation.confidence !== undefined && (
                  <View style={styles.confidenceBar}>
                    <View
                      style={[
                        styles.confidenceFill,
                        { width: `${correlation.confidence * 100}%` }
                      ]}
                    />
                    <Text style={styles.confidenceText}>
                      {Math.round(correlation.confidence * 100)}% confidence
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Medical Recommendations */}
        {diagnosisData.medical_recommendations && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💊 Medical Recommendations</Text>
            {diagnosisData.medical_recommendations.primary && (
              <View style={styles.recommendationCard}>
                <View style={styles.recommendationPriorityBadge}>
                  <Text style={styles.priorityText}>PRIMARY</Text>
                </View>
                <Text style={styles.recommendationIntervention}>
                  {diagnosisData.medical_recommendations.primary.intervention}
                </Text>
                <Text style={styles.recommendationRationale}>
                  {diagnosisData.medical_recommendations.primary.clinical_rationale}
                </Text>
                {diagnosisData.medical_recommendations.primary.specific_guidance && (
                  <View style={styles.guidanceBox}>
                    <Text style={styles.guidanceLabel}>Action Steps:</Text>
                    <Text style={styles.guidanceText}>
                      {diagnosisData.medical_recommendations.primary.specific_guidance}
                    </Text>
                  </View>
                )}
                {diagnosisData.medical_recommendations.primary.expected_timeline && (
                  <Text style={styles.timelineText}>
                    ⏱ {diagnosisData.medical_recommendations.primary.expected_timeline}
                  </Text>
                )}
              </View>
            )}
            {diagnosisData.medical_recommendations.secondary && (
              <View style={[styles.recommendationCard, styles.secondaryCard]}>
                <View style={[styles.recommendationPriorityBadge, styles.secondaryBadge]}>
                  <Text style={styles.priorityText}>SECONDARY</Text>
                </View>
                <Text style={styles.recommendationIntervention}>
                  {diagnosisData.medical_recommendations.secondary.intervention}
                </Text>
                <Text style={styles.recommendationRationale}>
                  {diagnosisData.medical_recommendations.secondary.clinical_rationale}
                </Text>
              </View>
            )}
            {diagnosisData.medical_recommendations.tertiary && (
              <View style={[styles.recommendationCard, styles.tertiaryCard]}>
                <View style={[styles.recommendationPriorityBadge, styles.tertiaryBadge]}>
                  <Text style={styles.priorityText}>TERTIARY</Text>
                </View>
                <Text style={styles.recommendationIntervention}>
                  {diagnosisData.medical_recommendations.tertiary.intervention}
                </Text>
                <Text style={styles.recommendationRationale}>
                  {diagnosisData.medical_recommendations.tertiary.clinical_rationale}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Therapeutic Dishes */}
        {diagnosisData.therapeutic_dishes && diagnosisData.therapeutic_dishes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🍽 Therapeutic Dishes</Text>
            {diagnosisData.therapeutic_dishes.map((dish, index) => (
              <View key={index} style={styles.dishCard}>
                <Text style={styles.dishName}>{dish.dish_name}</Text>
                {dish.key_nutrients && dish.key_nutrients.length > 0 && (
                  <View style={styles.nutrientsRow}>
                    {dish.key_nutrients.map((nutrient, idx) => (
                      <View key={idx} style={styles.nutrientChip}>
                        <Text style={styles.nutrientChipText}>{nutrient}</Text>
                      </View>
                    ))}
                  </View>
                )}
                <Text style={styles.dishBenefit}>{dish.therapeutic_benefit}</Text>
                {dish.addresses_deficiency && (
                  <Text style={styles.dishDeficiency}>
                    Addresses: {dish.addresses_deficiency}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Follow-up Notice */}
        {diagnosisData.follow_up_needed && (
          <View style={styles.followUpNotice}>
            <Text style={styles.followUpText}>
              ⚕ Formal medical consultation recommended
            </Text>
          </View>
        )}

        {/* Disclaimer */}
        {diagnosisData.disclaimer && (
          <View style={styles.disclaimerCard}>
            <Text style={styles.disclaimerText}>{diagnosisData.disclaimer}</Text>
          </View>
        )}

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
    maxHeight: '85%',
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

  // Diagnosis Result Styles
  assessmentContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  assessmentBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 8,
  },
  assessmentText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  periodText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },

  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },

  // Clinical Overview
  overviewCard: {
    backgroundColor: '#f0f7ff',
    borderRadius: 12,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  overviewText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },

  // Positive Findings
  positiveFindingCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#34C759',
  },
  positiveFindingHabit: {
    fontSize: 15,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 5,
  },
  positiveFindingBenefit: {
    fontSize: 14,
    color: '#15803d',
    lineHeight: 20,
  },

  // Deficiencies
  deficiencyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  deficiencyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  deficiencyNutrient: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  deficiencyStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  recommendedValue: {
    color: '#34C759',
  },
  statArrow: {
    fontSize: 20,
    color: '#999',
    marginHorizontal: 10,
  },
  deficiencySignificance: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },

  // Clinical Correlations
  correlationCard: {
    backgroundColor: '#fefce8',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#eab308',
  },
  correlationSymptom: {
    fontSize: 15,
    fontWeight: '600',
    color: '#713f12',
    marginBottom: 10,
  },
  factorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    gap: 6,
  },
  factorChip: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fde047',
  },
  factorText: {
    fontSize: 13,
    color: '#854d0e',
  },
  confidenceBar: {
    height: 20,
    backgroundColor: '#fef9c3',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  confidenceFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#eab308',
  },
  confidenceText: {
    fontSize: 12,
    color: '#713f12',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '600',
  },

  // Medical Recommendations
  recommendationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  secondaryCard: {
    borderColor: '#5AC8FA',
  },
  tertiaryCard: {
    borderColor: '#AF52DE',
  },
  recommendationPriorityBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  secondaryBadge: {
    backgroundColor: '#5AC8FA',
  },
  tertiaryBadge: {
    backgroundColor: '#AF52DE',
  },
  priorityText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  recommendationIntervention: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  recommendationRationale: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 10,
  },
  guidanceBox: {
    backgroundColor: '#f0f7ff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  guidanceLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 5,
  },
  guidanceText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  timelineText: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },

  // Therapeutic Dishes
  dishCard: {
    backgroundColor: '#faf5ff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#a855f7',
  },
  dishName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6b21a8',
    marginBottom: 8,
  },
  nutrientsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    gap: 6,
  },
  nutrientChip: {
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d8b4fe',
  },
  nutrientChipText: {
    fontSize: 12,
    color: '#7c3aed',
    fontWeight: '500',
  },
  dishBenefit: {
    fontSize: 14,
    color: '#581c87',
    lineHeight: 20,
    marginBottom: 5,
  },
  dishDeficiency: {
    fontSize: 13,
    color: '#7c3aed',
    fontStyle: 'italic',
  },

  // Follow-up and Disclaimer
  followUpNotice: {
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  followUpText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
  },
  disclaimerCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    fontStyle: 'italic',
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
