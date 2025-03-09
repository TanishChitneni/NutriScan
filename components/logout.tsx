import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';

export default function logout(props: any) {

    const {bottom} = useSafeAreaInsets();
    const navigation = useNavigation();

    const closeDrawer = () => {
        navigation.dispatch(DrawerActions.closeDrawer());
    }
  return (
    <View
        style={{flex: 1}}
    >
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
      <Pressable onPress = {closeDrawer} style={{padding: 20, paddingBottom: bottom+10}}>
        <Text>Logout</Text>
      </Pressable>
    </View>
  )
}