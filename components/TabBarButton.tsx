import { Pressable, View, Text, StyleSheet } from 'react-native'
import React, { useEffect } from 'react'
import { useTheme } from '@react-navigation/native';
import { icon } from '@/constants/icon';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const TabBarButton = ({ onPress, onLongPress, isFocused, routeName, label }) => {
    const { colors, dark } = useTheme();
    const scale = useSharedValue(0);

    useEffect(() => {
        scale.value = withSpring(isFocused ? 1 : 0, { duration: 350 });
    }, [scale, isFocused]);

    const animatedIconStyle = useAnimatedStyle(() => ({
        transform: [{ scale: interpolate(scale.value, [0, 1], [1, 1.2]) }],
        top: interpolate(scale.value, [0, 1], [0, 10]),
    }));

    const animatedTextStyle = useAnimatedStyle(() => ({
        opacity: interpolate(scale.value, [0, 1], [1, 0]),
    }));

    return (
        <Pressable onPress={onPress} onLongPress={onLongPress} style={styles.tabbarItem}>
            <Animated.View style={animatedIconStyle}>
                {icon[routeName]({
                    color: dark && isFocused ? "#000" : dark ? "#CCC" : isFocused ? "#CCC" : "black",
                })}
            </Animated.View>
            <Animated.Text style={[{ color: isFocused ? colors.primary : colors.text, fontSize: 12 }, animatedTextStyle]}>
                {label}
            </Animated.Text>
        </Pressable>
    );
};

export default TabBarButton;

const styles = StyleSheet.create({
    tabbarItem: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 3,
        paddingTop: 7
    }
});