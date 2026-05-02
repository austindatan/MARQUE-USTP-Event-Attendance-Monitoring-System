import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Catch-all route — handles unmatched paths gracefully
export default function NotFoundScreen() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Small delay to avoid interfering with initial navigation
    const timer = setTimeout(() => setReady(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleGoHome = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userRole = await AsyncStorage.getItem('userRole');
      if (token) {
        if (userRole === 'Admin') {
          router.replace('/tabs_admin/Dashboard');
        } else {
          router.replace('/tabs/Events');
        }
      } else {
        router.replace('/login');
      }
    } catch {
      router.replace('/login');
    }
  };

  if (!ready) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.code}>404</Text>
      <Text style={styles.title}>Page not found</Text>
      <Text style={styles.subtitle}>This route doesn't exist.</Text>
      <TouchableOpacity style={styles.button} onPress={handleGoHome}>
        <Text style={styles.buttonText}>Go Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0A0F51', padding: 24 },
  code: { fontSize: 72, fontWeight: 'bold', color: '#FECB20' },
  title: { fontSize: 22, fontWeight: '700', color: '#fff', marginTop: 8 },
  subtitle: { fontSize: 14, color: '#aaa', marginTop: 4, marginBottom: 32 },
  button: { backgroundColor: '#FECB20', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  buttonText: { color: '#0A0F51', fontWeight: '700', fontSize: 15 },
});
