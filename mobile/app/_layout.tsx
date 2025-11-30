import 'react-native-reanimated';
import 'react-native-gesture-handler';
import { Stack } from "expo-router";
import { useFonts } from 'expo-font'; 
import * as SplashScreen from 'expo-splash-screen'; 
import {useEffect} from 'react';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Barlow': require('../assets/fonts/Barlow-Regular.ttf'),
    'Gabarito': require('../assets/fonts/Gabarito-Bold.ttf'),
    'DMSans-Bold': require('../assets/fonts/DMSans_24pt-Bold.ttf'),
    'DMSans-SemiBold': require('../assets/fonts/DMSans-SemiBold.ttf'),
    'DMSans-EXLight': require('../assets/fonts/DMSans_18pt-ExtraLight.ttf'),
    'DMSans-Regular': require('../assets/fonts/DMSans_24pt-Regular.ttf'),
    'DMSans-Medium': require('../assets/fonts/DMSans_18pt-Medium.ttf'),
    'Manrope-EXBold': require('../assets/fonts/Manrope-ExtraBold.ttf'),
    'Manrope-Bold': require('../assets/fonts/Manrope-Bold.ttf'),
    'Inter': require('../assets/fonts/Inter_24pt-Bold.ttf'),
    'Din': require('../assets/fonts/DIN.otf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} /> 
      <Stack.Screen name="login" options={{ headerShown: false }} /> 
      <Stack.Screen name="tabs" options={{ headerShown: false }} /> 
      <Stack.Screen name="tabs_organization" options={{ headerShown: false }} /> 
      <Stack.Screen name="tabs_container_organization" options={{ headerShown: false }} /> 
      <Stack.Screen name="tab_container/Filter_Page" options={{ headerShown: false }} /> 
      <Stack.Screen name="tab_container/EventDetails_ZFeedback" options={{ headerShown: false }} />
      <Stack.Screen name="tab_container/Profile_ChangePassword" options={{ headerShown: false }} />
      <Stack.Screen name="tab_container_organization/Activities" options={{ headerShown: false }} />
      <Stack.Screen name="tab_container_organization/Profile" options={{ headerShown: false }} />
      <Stack.Screen name="tab_container_organization/EditProfile" options={{ headerShown: false }} />
      <Stack.Screen name="tab_container/EventDetails_Concluded" options={{ headerShown: false }} />
      <Stack.Screen name="tab_container_organization/Events" options={{ headerShown: false }} />
      <Stack.Screen name="tab_container_organization/EditEvents" options={{ headerShown: false }} />

      <Stack.Screen 
        name="tab_container/Search_Page" 
        options={{
          headerShown: false,
        }} 
      />
    </Stack>
  );
}