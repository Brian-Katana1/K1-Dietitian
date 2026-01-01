import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../constants/theme';
import { formatTime } from '../utils/dateUtils';

export default function MealList({ meals }) {
  if (!meals || meals.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No meals logged today</Text>
        <Text style={styles.emptySubtext}>Use the Log tab to add your first meal</Text>
      </View>
    );
  }

  return (
    <View>
      {meals.map((meal, index) => (
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
                {Math.round(value)}g {key}
              </Text>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  emptyText: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.caption,
  },
  mealCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealName: {
    ...typography.h4,
    flex: 1,
  },
  mealTime: {
    ...typography.caption,
    fontWeight: '500',
  },
  mealPortion: {
    ...typography.caption,
    marginBottom: 8,
  },
  mealNutrients: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  mealNutrientText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
});
