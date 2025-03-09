import { Image, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
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

  const colors = theme[colorScheme];

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <LinearGradient colors={['#A1CEDC', '#1D3D47']} style={styles.headerImageContainer}>
          <Image source={require('@/assets/images/1-removebg-preview.png')} style={styles.logo} />
        </LinearGradient>
      }>

      <TouchableOpacity
        style={[styles.ctaButton, { backgroundColor: colors.buttonBackground }]}
        onPress={() => router.push('/explore')}
      >
        <Text style={[styles.ctaText, { color: colors.text }]}>Start Scanning</Text>
      </TouchableOpacity>

      <View style={[styles.stepContainer, { backgroundColor: colors.boxBackground }]}>
        <Ionicons name="person-circle" size={30} color="#4CAF50" />
        <ThemedText type="subtitle" style={{ color: colors.text }}>Step 1: Enter Your Info</ThemedText>
        <ThemedText style={{ color: colors.text }}>Fill in your personal details under the "Personal Data" tab.</ThemedText>
      </View>

      <View style={[styles.stepContainer, { backgroundColor: colors.boxBackground }]}>
        <Ionicons name="camera" size={30} color="#2196F3" />
        <ThemedText type="subtitle" style={{ color: colors.text }}>Step 2: Scan the Label</ThemedText>
        <ThemedText style={{ color: colors.text }}>Use the "Nutrition Picture" tab to upload or take a photo of the food label.</ThemedText>
      </View>

      <View style={[styles.stepContainer, { backgroundColor: colors.boxBackground }]}>
        <Ionicons name="bar-chart" size={30} color="#FF9800" />
        <ThemedText type="subtitle" style={{ color: colors.text }}>Step 3: Get Your Results</ThemedText>
        <ThemedText style={{ color: colors.text }}>See recommendations/personalized risk assessment based on your dietary needs.</ThemedText>
      </View>

      <View style={[styles.footer]}>
        <Text style={[styles.footerText, { color: colors.text }]}>Empowering Healthier Choices</Text>
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  ctaButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 40,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 10,
    shadowOpacity: 0.1,
  },
  ctaText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  stepContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 5,
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
  footer: {
    marginTop: 20,
    marginBottom: 50,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: "#808080",
  },
  footerText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});