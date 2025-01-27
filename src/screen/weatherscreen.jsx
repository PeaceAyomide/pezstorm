import React, { useState, useEffect, useRef } from 'react'
import { View, Text, Image, StatusBar, ActivityIndicator, Alert, TouchableOpacity } from 'react-native'
import * as Location from 'expo-location'
import * as IntentLauncher from 'expo-intent-launcher';

const API_KEY = '64f60853740a1ee3ba20d0fb595c97d5'

const weatherscreen = ({ showWeatherNotification }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [locationErrorMsg, setLocationErrorMsg] = useState(null);
  const [locationDetails, setLocationDetails] = useState({ city: '', region: '', country: '' });
  const [isAlertShowing, setIsAlertShowing] = useState(false);
  const hasShownNotification = useRef(false);
  const units = 'metric';

  const enableLocation = async () => {
    try {
      setIsAlertShowing(false);
      const status = await IntentLauncher.startActivityAsync(
        IntentLauncher.ActivityAction.LOCATION_SOURCE_SETTINGS
      );
      if (status.resultCode === IntentLauncher.ResultCode.OK) {
        fetchWeatherData();
      }
    } catch (error) {
      console.error('Error enabling location:', error);
    }
  };

  // Function to fetch weather data
  async function fetchWeatherData() {
    try {
      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled && !isAlertShowing) {
        setIsAlertShowing(true);
        Alert.alert(
          "Location Required",
          "Enable your location 😏",
          [
            { 
              text: "Cancel", 
              style: "cancel",
              onPress: () => setIsAlertShowing(false)
            },
            { 
              text: "Enable Location", 
              onPress: enableLocation 
            }
          ],
          { cancelable: false }
        );
        setLocationErrorMsg('Please enable location services');
        return;
      }

      if (!enabled) {
        return;
      }

      setIsAlertShowing(false);

      // Always request permission when location is enabled
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationErrorMsg('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      if (!location) {
        setLocationErrorMsg('Could not get location');
        return;
      }

      const { latitude, longitude } = location.coords;
      const reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });
      
      if (!reverseGeocode || reverseGeocode.length === 0) {
        setLocationErrorMsg('Could not get location details');
        return;
      }

      const locationInfo = reverseGeocode[0];
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        setLocationErrorMsg('Weather API request failed');
        return;
      }

      const data = await response.json();
      setWeatherData(data);
      setLocationDetails({
        city: locationInfo.city || 'Unknown City',
        region: locationInfo.region || '',
        country: locationInfo.country || ''
      });
      setLocationErrorMsg(null);

      // Show notification only on the first fetch
      if (!hasShownNotification.current) {
        showWeatherNotification(
          locationInfo.city,
          data.main.temp,
          data.weather[0].description,
          data.main.humidity,
          data.wind.speed
        );
        hasShownNotification.current = true;
      }
    } catch (error) {
      console.error('Error in fetchWeatherData:', error);
      setLocationErrorMsg('Error fetching weather data');
    }
  }

  useEffect(() => {
    // Check every few seconds
    const checkInterval = setInterval(() => {
      if (!isAlertShowing) {
        fetchWeatherData();
      }
    }, 3000);

    return () => clearInterval(checkInterval);
  }, [isAlertShowing]);

  if (locationErrorMsg) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000000',
      }}>
        <StatusBar barStyle="light-content" />
        <Text style={{ color: '#fff' }}>{locationErrorMsg}</Text>
      </View>
    );
  }

  if (!weatherData) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
      }}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="#ff6347" />
      </View>
    );
  }

  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'black',
      padding: 20,
    }}>
      <StatusBar barStyle="light-content" />
     
      <Text style={{
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
        textAlign: 'center',
      }}>{locationDetails.city}</Text>
      <Text style={{
        fontSize: 16,
        color: '#ccc',
        marginBottom: 20,
        textAlign: 'center',
      }}>{locationDetails.region}{locationDetails.country ? `, ${locationDetails.country}` : ''}</Text>
      <Text style={{
        fontSize: 48,
        fontWeight: '300',
        color: '#fff',
        marginBottom: 20,
      }}>{Math.round(weatherData.main.temp)}°C</Text>
      <Image
        source={{ uri: `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png` }}
        style={{
          width: 100,
          height: 100,
          marginBottom: 20,
        }}
      />
      <Text style={{
        fontSize: 20,
        color: '#ccc',
        marginBottom: 20,
      }}>{weatherData.weather[0].description}</Text>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
      }}>
        <Text style={{
          fontSize: 16,
          color: '#ccc',
        }}>Humidity: {weatherData.main.humidity}%</Text>
        <Text style={{
          fontSize: 16,
          color: '#ccc',
        }}>Wind: {weatherData.wind.speed} km/h</Text>
      </View>
    </View>
  );
}

export default weatherscreen