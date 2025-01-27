import React from 'react'
import { View, Text, TouchableOpacity, StatusBar } from 'react-native'

const introscreen = ({ navigation }) => {
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
        fontSize: 36,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 20,
      }}>PezStorm</Text>
      <Text style={{
        fontSize: 18,
        color: '#ccc',
        textAlign: 'center',
        marginBottom: 40,
      }}>Your daily weather forecast at your fingertips</Text>
      <TouchableOpacity 
        style={{
          backgroundColor: '#ff6347',
          paddingVertical: 15,
          paddingHorizontal: 30,
          borderRadius: 10,
        }}
        onPress={() => navigation.navigate('weatherscreen')}
      >
        <Text style={{
          fontSize: 18,
          color: '#fff',
          fontWeight: 'bold',
          textAlign: 'center',
        }}>Get Started</Text>
      </TouchableOpacity>
    </View>
  )
}

export default introscreen