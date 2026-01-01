import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, shadows } from '../constants/theme';
import { formatNutrientValue } from '../utils/nutritionCalculations';

export default function WeeklyStats({ weekData }) {
  if (!weekData) {
    return null;
  }

  const { weekLabel, totalNutrients, dailyAverages, mealCount } = weekData;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.weekLabel}>{weekLabel}</Text>
        <Text style={styles.mealCount}>{mealCount} meals logged</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statSection}>
          <Text style={styles.sectionTitle}>Weekly Totals</Text>
          <View style={styles.nutrientRow}>
            <Text style={styles.nutrientLabel}>Calories:</Text>
            <Text style={styles.nutrientValue}>
              {formatNutrientValue(totalNutrients.calories)}
            </Text>
          </View>
          {totalNutrients.protein !== undefined && (
            <View style={styles.nutrientRow}>
              <Text style={styles.nutrientLabel}>Protein:</Text>
              <Text style={styles.nutrientValue}>
                {formatNutrientValue(totalNutrients.protein)}g
              </Text>
            </View>
          )}
          {totalNutrients.carbs !== undefined && (
            <View style={styles.nutrientRow}>
              <Text style={styles.nutrientLabel}>Carbs:</Text>
              <Text style={styles.nutrientValue}>
                {formatNutrientValue(totalNutrients.carbs)}g
              </Text>
            </View>
          )}
          {totalNutrients.fat !== undefined && (
            <View style={styles.nutrientRow}>
              <Text style={styles.nutrientLabel}>Fat:</Text>
              <Text style={styles.nutrientValue}>
                {formatNutrientValue(totalNutrients.fat)}g
              </Text>
            </View>
          )}
        </View>

        <View style={[styles.statSection, styles.averagesSection]}>
          <Text style={styles.sectionTitle}>Daily Averages</Text>
          <View style={styles.nutrientRow}>
            <Text style={styles.nutrientLabel}>Calories:</Text>
            <Text style={styles.nutrientValue}>
              {formatNutrientValue(dailyAverages.calories)}
            </Text>
          </View>
          {dailyAverages.protein !== undefined && (
            <View style={styles.nutrientRow}>
              <Text style={styles.nutrientLabel}>Protein:</Text>
              <Text style={styles.nutrientValue}>
                {formatNutrientValue(dailyAverages.protein)}g
              </Text>
            </View>
          )}
          {dailyAverages.carbs !== undefined && (
            <View style={styles.nutrientRow}>
              <Text style={styles.nutrientLabel}>Carbs:</Text>
              <Text style={styles.nutrientValue}>
                {formatNutrientValue(dailyAverages.carbs)}g
              </Text>
            </View>
          )}
          {dailyAverages.fat !== undefined && (
            <View style={styles.nutrientRow}>
              <Text style={styles.nutrientLabel}>Fat:</Text>
              <Text style={styles.nutrientValue}>
                {formatNutrientValue(dailyAverages.fat)}g
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  header: {
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  weekLabel: {
    ...typography.h4,
    marginBottom: spacing.xs,
  },
  mealCount: {
    ...typography.caption,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statSection: {
    flex: 1,
  },
  averagesSection: {
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    paddingLeft: spacing.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  nutrientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  nutrientLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  nutrientValue: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.text,
  },
});
