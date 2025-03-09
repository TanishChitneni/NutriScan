import { useColorScheme } from 'react-native';

const useTheme = () => {
  const colorScheme = useColorScheme();

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

  // Default to 'light' if colorScheme is null
  return theme[colorScheme || 'light'];
};

export default useTheme;