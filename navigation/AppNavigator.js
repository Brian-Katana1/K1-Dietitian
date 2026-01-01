import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet } from 'react-native';
import LogScreen from '../screens/LogScreen';
import StatsScreen from '../screens/StatsScreen';
import DoctorRossScreen from '../screens/DoctorRossScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          paddingBottom: 25,
          height: 85,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 5,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Log"
        component={LogScreen}
        options={{
          tabBarLabel: 'Log Meal',
          tabBarIcon: ({ focused }) => <TabBarIcon icon="📸" focused={focused} />,
          headerTitle: 'Log Meal',
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          tabBarLabel: 'My Stats',
          tabBarIcon: ({ focused }) => <TabBarIcon icon="📊" focused={focused} />,
          headerTitle: 'My Stats',
        }}
      />
      <Tab.Screen
        name="DoctorRoss"
        component={DoctorRossScreen}
        options={{
          tabBarLabel: 'Doctor Ross',
          tabBarIcon: ({ focused }) => <TabBarIcon icon="💬" focused={focused} />,
          headerTitle: 'Doctor Ross',
        }}
      />
    </Tab.Navigator>
  );
}

// Simple emoji-based tab bar icon component
function TabBarIcon({ icon, focused }) {
  return (
    <Text style={[styles.tabIcon, { opacity: focused ? 1 : 0.5 }]}>
      {icon}
    </Text>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    fontSize: 24,
  },
});
