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
    'DMSans-EXLight': require('../assets/fonts/DMSans_18pt-ExtraLight.ttf'),
    'DMSans-Regular': require('../assets/fonts/DMSans_24pt-Regular.ttf'),
    'DMSans-Medium': require('../assets/fonts/DMSans_18pt-Medium.ttf'),
    'Manrope-EXBold': require('../assets/fonts/Manrope-ExtraBold.ttf'),
    'Manrope-Bold': require('../assets/fonts/Manrope-Bold.ttf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return <Stack screenOptions={{headerShown: false}}/>;
}