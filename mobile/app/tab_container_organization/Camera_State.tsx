import React, { useState } from 'react';
import { View } from 'react-native';
import AttendanceCamera from './Attendance_Camera';
import AttendanceHistory from './Attendance_History';
import { useLocalSearchParams } from 'expo-router';

export default function CameraState() {
  const params = useLocalSearchParams();
  const eventId = params.eventId as string;
  const [currentView, setCurrentView] = useState<'camera' | 'history'>('camera');

  return (
    <View style={{ flex: 1 }}>
      {currentView === 'camera' && (
        <AttendanceCamera
          eventId={eventId}
          onShowHistory={() => setCurrentView('history')}
        />
      )}

      {currentView === 'history' && (
        <AttendanceHistory
          eventId={eventId}
          onBack={() => setCurrentView('camera')}
        />
      )}
    </View>
  );
}
