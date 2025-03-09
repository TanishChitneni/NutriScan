import { View, Platform, StyleSheet, LayoutChangeEvent} from 'react-native';
import Feather from '@react-native-vector-icons/feather'
import { useLinkBuilder, useTheme } from '@react-navigation/native';
import { Text, PlatformPressable } from '@react-navigation/elements';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarButton from './TabBarButton';
import { useState } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

export function TabBar({ state, descriptors, navigation } : BottomTabBarProps) {
  const { colors, dark } = useTheme();
  const isDarkMode = dark;
  const { buildHref } = useLinkBuilder();
  const [dimensions, setDimensions] = useState({height: 20, width: 100});

  const buttonWidth = dimensions.width / state.routes.length;

  const onTabbarLayout = (e:LayoutChangeEvent) => {
    setDimensions({
      height: e.nativeEvent.layout.height,
      width: e.nativeEvent.layout.width,
    });
  };

  const tabPositionX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateX: tabPositionX.value}]
    }
  });

  return (
    <View onLayout={onTabbarLayout} style={[styles.tabbar, { backgroundColor: dark ? '#222' : '#fff' }]}> 
      <Animated.View style={[animatedStyle, {
        position: 'absolute',
        backgroundColor: colors.text,
        borderRadius: 30,
        paddingTop: 10,
        marginHorizontal: 12,
        height: dimensions.height - 15,
        width: buttonWidth - 25
      }]}/>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          tabPositionX.value = withSpring(buttonWidth * index, {duration: 1500});

          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TabBarButton 
            key={route.name}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabbarItem}
            isFocused={isFocused}
            routeName={route.name}
            color={isFocused ? isDarkMode ? 'black' : 'white' : 'white'}
            label={label}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
    tabbar: {
        position: 'absolute',
        bottom: 20,
        alignSelf: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        width: 300,
        height: 60,
        borderRadius: 35,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 10,
        shadowOpacity: 0.1
    },
    tabbarItem: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5
    }
})
