import React, { useState } from 'react';
import { View } from 'react-native';
import AttendanceCamera from './Attendance_Camera';
import AttendanceHistory from './Attendance_History';
import { useLocalSearchParams } from 'expo-router';

export default function CameraState() {
  const params = useLocalSearchParams();
  const eventId = params.eventId as string; // explicitly type as string
  const [currentView, setCurrentView] = useState<'camera' | 'history'>('camera');

  return (
    <View style={{ flex: 1 }}>
      {currentView === 'camera' && (
        <AttendanceCamera
          eventId={eventId} // pass eventId safely
          onShowHistory={() => setCurrentView('history')}
        />
      )}

      {currentView === 'history' && (
        <AttendanceHistory
          eventId={eventId} // ✅ pass eventId here as well
          onBack={() => setCurrentView('camera')}
        />
      )}
    </View>
  );
}
