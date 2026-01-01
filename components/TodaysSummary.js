import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, shadows } from '../constants/theme';

export default function TodaysSummary({ totals }) {
  return (
    <View style={styles.totalsCard}>
      {Object.entries(totals).map(([key, value]) => (
        <View key={key} style={styles.totalItem}>
          <Text style={styles.totalValue}>
            {Math.round(value)}{key === 'calories' ? '' : 'g'}
          </Text>
          <Text style={styles.totalLabel}>
            {key === 'calories' ? 'Calories' : key.charAt(0).toUpperCase() + key.slice(1)}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  totalsCard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.medium,
    gap: spacing.md,
  },
  totalItem: {
    minWidth: '30%',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  totalValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.success,
  },
  totalLabel: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
});
