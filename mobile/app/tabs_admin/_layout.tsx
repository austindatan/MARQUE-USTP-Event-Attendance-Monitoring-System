// @ts-nocheck
import { Stack } from "expo-router";
import { StatusBar } from 'react-native';

export default function AdminLayout() {
  return (
    <>
    <StatusBar 
      style="light"
      backgroundColor="#0A0F51"
    />
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
    </>
  );
}
