import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

export default function ResultDisplay({ result, onSave }) {
  const [mealData, setMealData] = useState(null);
  const [originalData, setOriginalData] = useState(null);

  useEffect(() => {
    if (result?.success && result?.data?.result) {
      try {
        const parsed = JSON.parse(result.data.result);
        setMealData(parsed);
        setOriginalData(parsed);
      } catch (e) {
        console.error('Failed to parse result:', e);
      }
    }
  }, [result]);

  if (!result) {
    return null;
  }

  if (!result.success) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorText}>{result.error}</Text>
        </View>
      </View>
    );
  }

  if (!mealData) {
    return null;
  }

  const handlePortionChange = (newPortion) => {
    setMealData({ ...mealData, portion: newPortion });
  };

  const recalculateNutrients = () => {
    const originalPortionMatch = originalData.portion.match(/[\d.]+/);
    const newPortionMatch = mealData.portion.match(/[\d.]+/);

    if (originalPortionMatch && newPortionMatch) {
      const originalAmount = parseFloat(originalPortionMatch[0]);
      const newAmount = parseFloat(newPortionMatch[0]);
      const ratio = newAmount / originalAmount;

      const recalculated = { ...mealData };

      // Recalculate calories
      if (originalData.calories) {
        recalculated.calories = Math.round(originalData.calories * ratio);
      }

      // Recalculate all nutrients
      if (originalData.nutrients) {
        const recalculatedNutrients = {};
        Object.keys(originalData.nutrients).forEach((key) => {
          recalculatedNutrients[key] = Math.round(originalData.nutrients[key] * ratio);
        });
        recalculated.nutrients = recalculatedNutrients;
      }

      setMealData(recalculated);
    }
  };

  const handleSave = () => {
    const savedMeal = {
      ...mealData,
      timestamp: new Date().toISOString(),
    };
    onSave(savedMeal);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meal Details</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={mealData.name}
          onChangeText={(text) => setMealData({ ...mealData, name: text })}
          placeholder="Meal name"
        />

        <Text style={styles.label}>Portion</Text>
        <View style={styles.portionRow}>
          <TextInput
            style={[styles.input, styles.portionInput]}
            value={mealData.portion}
            onChangeText={handlePortionChange}
            placeholder="e.g., 1 cup"
          />
          <TouchableOpacity style={styles.recalcButton} onPress={recalculateNutrients}>
            <Text style={styles.recalcButtonText}>Recalculate</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.nutrientsGrid}>
          <View style={styles.nutrientCard}>
            <Text style={styles.nutrientValue}>{mealData.calories}</Text>
            <Text style={styles.nutrientLabel}>Calories</Text>
          </View>
          {mealData.nutrients && Object.entries(mealData.nutrients).map(([key, value]) => (
            <View key={key} style={styles.nutrientCard}>
              <Text style={styles.nutrientValue}>{value}g</Text>
              <Text style={styles.nutrientLabel}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save to My Diet Today</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
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
  portionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  portionInput: {
    flex: 1,
  },
  recalcButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  recalcButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  nutrientsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 20,
    gap: 10,
  },
  nutrientCard: {
    minWidth: '30%',
    backgroundColor: '#f0f7ff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  nutrientValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  nutrientLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  saveButton: {
    backgroundColor: '#34C759',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    padding: 20,
    backgroundColor: '#fee',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#f00',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#c00',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 15,
    color: '#600',
  },
});
