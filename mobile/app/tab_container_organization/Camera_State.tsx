import React, { useState } from 'react';
import { View } from 'react-native';
import AttendanceCamera from './Attendance_Camera';
import AttendanceHistory from './Attendance_History';

export default function CameraState() {
  const [currentView, setCurrentView] = useState<'camera' | 'history'>('camera');

  return (
    <View style={{ flex: 1 }}>
      {currentView === 'camera' && (
        <AttendanceCamera
          onShowHistory={() => setCurrentView('history')}
        />
      )}

      {currentView === 'history' && (
        <AttendanceHistory onBack={() => setCurrentView('camera')} />
      )}
    </View>
  );
}
