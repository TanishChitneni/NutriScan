import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { TabBar } from '@/components/TabBar';

const TabLayout = () => {
  return (
    <Tabs 
      tabBar = {props => <TabBar {...props} />}
      
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Data',
          headerShown: false
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: 'Picture',
          headerShown: false
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          title: 'Stats',
          headerShown: false
        }}
      />
    </Tabs>
  );
}

export default TabLayout