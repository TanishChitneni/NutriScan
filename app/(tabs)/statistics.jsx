import { Image, View, Text, StyleSheet, ScrollView, FlatList, TextInput, TouchableOpacity, useColorScheme } from 'react-native';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import * as FileSystem from 'expo-file-system';
const App = () => {
  const [entries, setEntries] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const colorScheme = useColorScheme(); // Get the system color scheme

  let firstWord = 'ninig';
  let foodname = 'nofood'
  

  // Define color palettes for light and dark modes
  const theme = {
    light: {
      background: '#fff',
      text: '#000',
      boxBackground: '#f0ece0',
      rowBackground: '#fff',
      cellBackground: '#fff',
      buttonBackground: '#b1cecb',
      searchInputBackground: '#fff',
      searchInputText: '#000',
      searchInputPlaceholder: '#333333',
      borderColor: '#000',
    },
    dark: {
      background: '#121212',
      text: '#fff',
      boxBackground: '#1e1e1e',
      rowBackground: '#2d2d2d',
      cellBackground: '#2d2d2d',
      buttonBackground: '#4a6c6b',
      searchInputBackground: '#2d2d2d',
      searchInputText: '#fff',
      searchInputPlaceholder: '#a0a0a0',
      borderColor: '#444',
    },
  };

  // Get the current theme colors
  const colors = theme[colorScheme];

  // Save an entry
  const saveEntry = async (FoodName, EntryDate, EatorNo) => {
    try {
      const entryKey = `entry_${Date.now()}`;
      const entryData = { FoodName, EntryDate, EatorNo };
      await AsyncStorage.setItem(entryKey, JSON.stringify(entryData));
      console.log('Entry saved successfully!');
    } catch (e) {
      console.error('Failed to save entry:', e);
    }
  };
  

  const ReadLLM = async () => {
    try {
      const fileUri = `${FileSystem.documentDirectory}personalOutput.txt`;
      console.log('File Path:', fileUri); // Log the file path
  
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      console.log('File Exists:', fileInfo.exists); // Log whether the file exists
  
      if (fileInfo.exists) {
        const fileContent = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.UTF8 });
        console.log('File Content:', fileContent); // Log the file content
  
        if (fileContent) {
          firstWord = fileContent.split(" ")[0]; // Extract the first word
          console.log('First Word:', firstWord); // Log the first word
        } else {
          console.error('File is empty');
          firstWord = 'N/A'; // Default value if the file is empty
        }
      } else {
        console.error('File does not exist:', fileUri);
        firstWord = 'N/A'; // Default value if the file does not exist
      }
    } catch (error) {
      console.error('Failed to read file:', error);
      Alert.alert('Error', 'Failed to read file.');
      firstWord = 'N/A'; // Default value if an error occurs
    }
  };
  
  const readfoodname = async () => {
    try {
      const fileUri = `${FileSystem.documentDirectory}food.txt`;
      const fileContent = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.UTF8 });
      foodname = fileContent
      console.log('File Content:', foodname); // Log the file content
 
    } catch (error) {
      Alert.alert('Error', 'Failed to read file.');
    }
  };

  const addNewEntry = async () => {
    try {
      await ReadLLM(); // Ensure this completes before proceeding
      await readfoodname();
      console.log('Fidfgdh:');
  
      const today = new Date();
      const month = String(today.getMonth() + 1).padStart(2, '0'); // MM
      const day = String(today.getDate()).padStart(2, '0'); // DD
      const year = String(today.getFullYear()).slice(-2); // YY (last two digits)
  
      const fulldate = `${month}/${day}/${year}`; // Format: MM/DD/YY
  
      saveEntry(foodname, fulldate, firstWord); // Stores the date in AsyncStorage
  
      const updatedEntries = await retrieveAllEntries();
      setEntries(updatedEntries); // Update the state to trigger a re-render
    } catch (error) {
      Alert.alert('Error', 'Fail to Add Entry');
    }
  };

  // Retrieve all entries
  const retrieveAllEntries = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const entryKeys = keys.filter((key) => key.startsWith('entry_'));
      const entries = await AsyncStorage.multiGet(entryKeys);
      const parsedEntries = entries.map(([key, value]) => JSON.parse(value));
      return parsedEntries;
    } catch (e) {
      console.error('Failed to retrieve entries:', e);
    }
  };

  // Load entries when the component mounts
  useEffect(() => {
    retrieveAllEntries().then((data) => {
      setEntries(data); // Store the data in state
    });
  }, [entries]);

  // Filter entries based on search query
  const filteredData = entries
    .filter((item) => item !== null && item !== undefined) // Filter out null/undefined entries
  .filter((item) =>
    item.FoodName && item.FoodName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Clear all data
  const clearAllData = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      await AsyncStorage.multiRemove(keys); // Remove all keys
      console.log('All data in AsyncStorage has been cleared.');
      setEntries([]); // Clear the entries state
    } catch (e) {
      console.error('Failed to clear AsyncStorage:', e);
    }
  };


  useEffect(() => {

  }, []);

  // Render a single entry
  const renderItem = ({ item, index }) => {
    return (
      <View style={[styles.row, { backgroundColor: colors.rowBackground }]}>
        <Text style={[styles.cell, { width: 90, color: colors.text }]}>{(index + 1).toString()}</Text>
        <Text style={[styles.cell, { width: 140, color: colors.text }]}>{item.FoodName}</Text>
        <Text style={[styles.cell, { width: 120, color: colors.text }]}>{item.EntryDate}</Text>
        <Text style={[styles.cell, { width: 120, color: colors.text }]}>{item.EatorNo}</Text>
      </View>
    );
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <LinearGradient colors={['#A1CEDC', '#1D3D47']} style={styles.headerImageContainer}>
          <Image source={require('@/assets/images/1-removebg-preview.png')} style={styles.logo} />
        </LinearGradient>
      }>
      <ThemedView style={styles.titleContainer}>
            <ThemedText type="title">Statistics/History 📊</ThemedText>
          </ThemedView>
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.box, { backgroundColor: colors.boxBackground, borderColor: colors.borderColor }]}>
        {/* Search Input */}
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: colors.searchInputBackground,
              color: colors.searchInputText,
              borderColor: colors.borderColor,
              placeholderTextColor: colors.searchInputPlaceholder,
            },
          ]}
          placeholder="Search by Visitor Name..."
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />

        <ScrollView horizontal>
          <View style={styles.listContainer}>
            {/* Table Header */}
            <View style={[styles.header, { borderBottomColor: colors.borderColor }]}>
              <Text style={[styles.headerText, { width: 120, color: colors.text }]}>Row #</Text>
              <Text style={[styles.headerText, { width: 120, color: colors.text }]}>Name</Text>
              <Text style={[styles.headerText, { width: 120, color: colors.text }]}>Date</Text>
              <Text style={[styles.headerText, { width: 120, color: colors.text }]}>EAT?</Text>
            </View>

            {/* Table Rows */}
            <FlatList
              data={filteredData}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        </ScrollView>
      </View>

      <TouchableOpacity
        style={[styles.button1, { backgroundColor: colors.buttonBackground }]}
        onPress={addNewEntry}
      >
        <Text style={[styles.buttonText, { color: colors.text }]}>Add Most Recent Input</Text>
      </TouchableOpacity>


      <TouchableOpacity
        style={[styles.button1, { backgroundColor: colors.buttonBackground }]}
        onPress={clearAllData}
      >
        <Text style={[styles.buttonText, { color: colors.text }]}>Clear All Data</Text>
      </TouchableOpacity>



    </View>
    </ParallaxScrollView>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    borderRadius: 5,
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    alignSelf: 'center'
  },
  listContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  headerText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  button1: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
    marginHorizontal: 1,
    elevation: 1,
    borderRadius: 3,
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  cell: {
    fontFamily: 'SpaceMono-Regular',
    fontSize: 14,
    flex: 1,
  },
  box: {
    borderWidth: 1,
    margin: 10,
    padding: 10,
    borderRadius: 5,
    maxHeight: 500,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    margin: 10,
  },
});