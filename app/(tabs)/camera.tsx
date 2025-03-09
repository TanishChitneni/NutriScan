import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Image, ActivityIndicator, View, Alert, TouchableOpacity, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { Camera } from 'expo-camera';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { LinearGradient } from 'expo-linear-gradient';
import useTheme from '@/assets/useTheme'; // Adjust the import path as needed
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

export default function TabThreeScreen() {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const cameraRef = useRef<typeof Camera>(null);
  let [recommendation, setRecommendation] = useState('');
  const [userFileInput, setUserFileInput] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [foodnamer, setFoodnamer] = useState<string>('temp');
  const API_URL = 'http://10.180.0.149:5000'; // Your Flask API URL

  const SaveLLM = async (recommendation: string) => {
    try {
      const fileUri = `${FileSystem.documentDirectory}personalOutput.txt`;
      await FileSystem.writeAsStringAsync(fileUri, recommendation, { encoding: FileSystem.EncodingType.UTF8 });
      await AsyncStorage.setItem('personalOutput', recommendation); // Update AsyncStorage directly with the argument
      if (!recommendation) {
        console.log('No recommendation to save!');
        return;
      }
      console.log('AI output:', recommendation);
    } catch (error) {
      Alert.alert('Error', 'Failed to save data.');
    }
  };

  const handleRead = async () => {
    try {
      const fileUri = `${FileSystem.documentDirectory}personalData.txt`;
      const fileContent = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.UTF8 });
      console.log('File Content:', fileContent);
      return fileContent; // Return the file content
    } catch (error) {
      Alert.alert('Error', 'Failed to read file.');
      return ''; // Return an empty string if the file read fails
    }
  };

  const fetchRecommendation = async (intParams: number[], ingredients: string) => {
    setLoading(true);
    try {
      // Check if ingredients is an empty string
      if (!ingredients || ingredients.trim() === '') {
        Alert.alert('Error', 'Barcode not scanned properly - no ingredients detected.');
        setRecommendation('Error: No ingredients found');
        return;
      }

      const modifiedIntParams = intParams.map((param, index) => 
        index === 2 ? param * 1000 : param
      );
      console.log(modifiedIntParams)

      const userFileInput = await handleRead(); // Get the file content directly

      const response = await axios.post(`${API_URL}/api/recommendation`, {
        int_params: modifiedIntParams,
        diseases: userFileInput || '',
        ingredients: ingredients,
      });

      // Check if the response data structure is correct
      if (response.data && response.data.recommendation) {
        const temp = response.data.recommendation;
        setRecommendation(temp)
        console.log('Recommendation:', temp);
        await SaveLLM(temp);
      } else {
        console.error('Invalid response format from API');
        setRecommendation('Failed to get recommendation');
        //await SaveLLM();
      }
    } catch (error) {
      console.error('Error fetching recommendation:', error);
      setRecommendation('Error: Could not fetch recommendation');
    } finally {
      setLoading(false);
    }
  };

  const scanBarcode = async (imageUri: string) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        name: 'barcode.jpg',
        type: 'image/jpeg',
      } as any); // 'any' to bypass TypeScript strictness

      const response = await axios.post(`${API_URL}/api/scan`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { nutriments, ingredients } = response.data;
      console.log('Scan Result:', response.data);

      await fetchRecommendation(nutriments, ingredients); // Call fetchRecommendation with the updated logic
    } catch (error) {
      console.error('Error scanning barcode:', error);
      Alert.alert('Error', 'Failed to scan barcode.');
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      const mediaPermission = await MediaLibrary.requestPermissionsAsync();
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === 'granted');
    })();
  }, []);

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setImage(imageUri);
      await scanBarcode(imageUri);
    }
  }

  const takePhoto = async () => {
    if (hasCameraPermission === null) {
      console.log('Camera permission is not determined yet.');
      return;
    }

    if (hasCameraPermission === false) {
      alert('Camera permission is required to take a photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setImage(imageUri);
      await scanBarcode(imageUri);

      Alert.prompt(
        'Enter Food Name',
        'Please enter the name of the food:',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: async (foodName) => {
              if (foodName) {
                console.log('Food Name Entered:', foodName);
                await setFoodnamer(foodName);
                await saveFoodWithName(foodName);
                console.log('Food Name Saved:', foodName);
                //await SaveLLM();
              }
            },
          },
        ],
        'plain-text'
      );
    }
  };

  const saveFoodWithName = async (foodName: string) => {
    try {
      const fileUri = `${FileSystem.documentDirectory}food.txt`;
      await FileSystem.writeAsStringAsync(fileUri, foodName, { encoding: FileSystem.EncodingType.UTF8 });
      await AsyncStorage.setItem('food', foodName);
      console.log('Food name saved:', foodName);
    } catch (error) {
      Alert.alert('Error', 'Failed to save data.');
    }
  };

  function showAlert(title: string, message: string) {
    Alert.alert(title, message, [{ text: 'OK' }]);
  }

  const colors = useTheme();

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <LinearGradient colors={['#A1CEDC', '#1D3D47']} style={styles.headerImageContainer}>
          <Image source={require('@/assets/images/1-removebg-preview.png')} style={styles.logo} />
        </LinearGradient>
      }>
      <ThemedView style={[styles.titleContainer]}>
        <ThemedText type="title" style={{ color: colors.text }}>Nutrition Picture 📷</ThemedText>
      </ThemedView>
      <ThemedText style={{ color: colors.text }}>
        Take a picture or upload a picture of the food you want to eat.
      </ThemedText>

      <TouchableOpacity
        style={[styles.button1, { backgroundColor: colors.buttonBackground }]}
        onPress={pickImage}
        disabled={loading}
      >
        <Text style={[styles.cell, { color: colors.text }]}>
          {loading ? 'Processing...' : 'Choose from Library'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button1, { backgroundColor: colors.buttonBackground }]}
        onPress={takePhoto}
        disabled={loading}
      >
        <Text style={[styles.cell, { color: colors.text }]}>
          {loading ? 'Processing...' : 'Take a Photo'}
        </Text>
      </TouchableOpacity>

      {image && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.image} />
        </View>
      )}

      <ThemedView style={styles.recommendationContainer}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.text} />
        ) : (
          <ThemedText style={styles.recommendationText}>
            {recommendation || 'Take or upload a photo to see dietary advice.'}
          </ThemedText>
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
  },
  logo: {
    height: 300,
    width: 400,
    resizeMode: 'contain',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    alignSelf: 'center',
  },
  button1: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  cell: {
    fontFamily: 'SpaceMono-Regular',
    fontSize: 14,
    flex: 1,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  image: {
    width: 200,
    height: 200,
  },
  recommendationContainer: {
    marginTop: 20,
    marginBottom: 50,
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  recommendationText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#fff',
  },
});
