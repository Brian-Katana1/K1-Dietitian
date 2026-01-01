import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { colors, spacing, typography } from '../constants/theme';
import { getTrendData } from '../utils/nutritionCalculations';

const screenWidth = Dimensions.get('window').width;

export default function WeeklyChart({ weekData, metric = 'calories' }) {
  if (!weekData || !weekData.dailyBreakdown || weekData.dailyBreakdown.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No data available for this week</Text>
      </View>
    );
  }

  const { labels, data } = getTrendData(weekData.dailyBreakdown, metric);

  // Handle case where all data is zero
  const hasData = data.some(value => value > 0);
  if (!hasData) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No {metric} data for this week</Text>
      </View>
    );
  }

  const metricLabels = {
    calories: 'Calories',
    protein: 'Protein (g)',
    carbs: 'Carbs (g)',
    fat: 'Fat (g)',
  };

  const chartConfig = {
    backgroundColor: colors.background,
    backgroundGradientFrom: colors.background,
    backgroundGradientTo: colors.background,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: colors.primary,
    },
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{metricLabels[metric]} Trend</Text>
      <LineChart
        data={{
          labels,
          datasets: [{
            data,
            color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
            strokeWidth: 2,
          }],
        }}
        width={screenWidth - 40}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
        withInnerLines={false}
        withOuterLines={true}
        withVerticalLabels={true}
        withHorizontalLabels={true}
        withDots={true}
        withShadow={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h4,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  chart: {
    marginVertical: spacing.xs,
    borderRadius: 16,
  },
  emptyContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyText: {
    ...typography.caption,
    fontStyle: 'italic',
  },
});
