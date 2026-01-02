import { useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import TodaysSummary from '../components/TodaysSummary';
import MealList from '../components/MealList';
import WeeklyStats from '../components/WeeklyStats';
import WeeklyChart from '../components/WeeklyChart';
import { useMeals } from '../contexts/MealsContext';
import { colors, spacing, typography, shadows } from '../constants/theme';

export default function StatsScreen() {
  const navigation = useNavigation();
  const { getTodaysMeals, getTodaysTotals, getWeeklyStats, savedMeals } = useMeals();

  const todaysMeals = useMemo(() => getTodaysMeals(), [getTodaysMeals]);
  const todaysTotals = useMemo(() => getTodaysTotals(), [getTodaysTotals]);
  const weeklyStats = useMemo(() => getWeeklyStats(4), [getWeeklyStats]);

  const handleAnalyzePressed = () => {
    if (savedMeals.length === 0) {
      Alert.alert('No Meals', 'No meals to analyze. Please add meals first.');
      return;
    }
    navigation.navigate('DoctorRoss');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Today's Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Summary</Text>
          <TodaysSummary totals={todaysTotals} />
        </View>

        {/* Today's Meals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Meals</Text>
          <MealList meals={todaysMeals} />
        </View>

        {/* Analyze Button */}
        {savedMeals.length > 0 && (
          <TouchableOpacity
            style={styles.analyzeButton}
            onPress={handleAnalyzePressed}
          >
            <Text style={styles.analyzeButtonText}>Analyze My Diet</Text>
          </TouchableOpacity>
        )}

        {/* Weekly Overview Section */}
        {weeklyStats.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weekly Overview</Text>
            {weeklyStats.map((week, index) => (
              <View key={index}>
                <WeeklyStats weekData={week} />
                {week.dailyBreakdown && week.dailyBreakdown.length > 0 && (
                  <WeeklyChart weekData={week} metric="calories" />
                )}
              </View>
            ))}
          </View>
        )}

        {/* Empty State */}
        {savedMeals.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No meals logged yet</Text>
            <Text style={styles.emptyStateText}>
              Use the Log tab to start tracking your meals
            </Text>
          </View>
        )}
      </ScrollView>
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
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h2,
    marginBottom: spacing.md,
  },
  analyzeButton: {
    backgroundColor: colors.warning,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.xl,
    ...shadows.medium,
  },
  analyzeButtonText: {
    color: colors.background,
    ...typography.button,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyStateTitle: {
    ...typography.h3,
    marginBottom: spacing.sm,
  },
  emptyStateText: {
    ...typography.caption,
    textAlign: 'center',
  },
});
