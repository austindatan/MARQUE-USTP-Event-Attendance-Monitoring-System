// @ts-nocheck
import { Stack } from "expo-router";
import { StatusBar } from 'react-native';

export default function AdminLayout() {
  return (
    <>
    <StatusBar 
      translucent
      backgroundColor="transparent"
      barStyle="light-content"
    />
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
    </>
  );
}
