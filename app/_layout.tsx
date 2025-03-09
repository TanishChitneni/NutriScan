import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import Entypo from '@expo/vector-icons/Entypo';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';
import logout from '@/components/logout';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Drawer
          screenOptions={{
            drawerLabelStyle: {
              marginLeft: -5,  // Adjust as needed
              fontWeight: 'bold',  // Optional: Make label bold
              fontSize: 16,  // Optional: Change font size
            },
          }}
          drawerContent = {
            logout
          }
        >
          <Drawer.Screen 
            name = "(tabs)"
            options={{
              drawerLabel: "Home",
              title: "Dashboard",
              drawerIcon: ({size, color}) => (
                  <IconSymbol name='house.fill' size={size} color={color}/>
              )
            }}
          />
          <Drawer.Screen 
            name = "about"
            options={{
              drawerLabel: "Chat",
              title: "Lets Chat",
              drawerIcon: ({size, color}) => (
                <Entypo name="chat" size={size} color={color} />              )
            }}
          />
        </Drawer>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
