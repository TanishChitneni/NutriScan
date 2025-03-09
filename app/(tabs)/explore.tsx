import { useState, useEffect } from 'react';
import { 
  StyleSheet, TextInput, Alert, KeyboardAvoidingView, 
  ScrollView, Platform, TouchableWithoutFeedback, Keyboard, useColorScheme, Image, TouchableOpacity, Text
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';

// Define props type (even if empty for now)
interface TabTwoScreenProps {}

const TabTwoScreen: React.FC<TabTwoScreenProps> = () => {
  const [inputText, setInputText] = useState<string>('');
  const colorScheme = useColorScheme();

  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storedText = await AsyncStorage.getItem('personalData');
        if (storedText !== null) {
          setInputText(storedText);
        }
      } catch (error) {
        console.error('Failed to load saved data', error);
      }
    };

    loadStoredData();
  }, []);

  const handleSave = async () => {
    try {
      const fileUri = `${FileSystem.documentDirectory}personalData.txt`;
      await FileSystem.writeAsStringAsync(fileUri, inputText, { encoding: FileSystem.EncodingType.UTF8 });
      await AsyncStorage.setItem('personalData', inputText);
      Alert.alert('Success', 'Your data has been saved!');
      console.log('File Content:', inputText); // Log the file content
    } catch (error) {
      Alert.alert('Error', 'Failed to save data.');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ParallaxScrollView
          headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
          headerImage={
            <LinearGradient colors={['#A1CEDC', '#1D3D47']} style={styles.headerImageContainer}>
              <Image source={require('@/assets/images/1-removebg-preview.png')} style={styles.logo} />
            </LinearGradient>
          }>
          <ThemedView style={styles.titleContainer}>
            <ThemedText type="title">Personal Data 📄</ThemedText>
          </ThemedView>
          <ThemedText>
            Type in any information about yourself! This could be anything that you deem as valid.
          </ThemedText>
          
          <ScrollView 
            style={{ flex: 1 }} 
            keyboardShouldPersistTaps="handled"
          >
            <TextInput
              style={[styles.input, colorScheme === 'light' && styles.inputLight]}
              placeholder="Enter your information here"
              placeholderTextColor="#808080"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </ScrollView>
        </ParallaxScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default TabTwoScreen;

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    alignSelf: 'center'
  },
  input: {
    height: 100,
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
    color: '#FFFFFF',
  },
  inputLight: {
    color: '#000000',
  },
  logo: {
    height: 300,
    width: 400,
    resizeMode: 'contain',
  },
  headerImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
  },
  saveButton: {
    backgroundColor: '#4a6c6b', // Your requested background color
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  saveButtonText: {
    color: '#fff', // White text for contrast
    fontSize: 16,
    fontWeight: 'bold',
  },
});