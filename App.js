import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Notifications from 'expo-notifications';
import IntroScreen from './src/screen/introscreen';
import WeatherScreen from './src/screen/weatherscreen';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const Stack = createStackNavigator();

export default function App() {
  const [hasShownNotification, setHasShownNotification] = useState(false);

  const showWeatherNotification = async (city, temp, description, humidity, windSpeed) => {
    if (!hasShownNotification) {
      // Add 2-second delay
      setTimeout(async () => {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `Weather Update in ${city || 'your location'}`,
            body: `${Math.round(temp)}°C - ${description}\nHumidity: ${humidity}% | Wind: ${windSpeed} km/h`,
          },
          trigger: null,
        });
        setHasShownNotification(true);
      }, 2000); // 2 seconds delay
    }
  };

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="introscreen">
        <Stack.Screen 
          name="introscreen" 
          component={IntroScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="weatherscreen" 
          options={{ headerShown: false }}>
          {props => <WeatherScreen {...props} showWeatherNotification={showWeatherNotification} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
