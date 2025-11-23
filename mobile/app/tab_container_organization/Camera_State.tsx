import React, { useState } from 'react';
import OrgEventDetails from './Org_Event_Details';
import AttendanceCamera from './Attendance_Camera';
import AttendanceHistory from './Attendance_History';

export default function CameraState() {
  const [currentView, setCurrentView] = useState<'home' | 'camera' | 'history'>('home');

  console.log('Current view:', currentView);

  return (
    <>
      {currentView === 'home' && (
        <OrgEventDetails 
          onOpenCamera={() => {
            console.log('Opening camera!');
            setCurrentView('camera');
          }} 
        />
      )}
      
      {currentView === 'camera' && (
        <AttendanceCamera
          onClose={() => setCurrentView('home')}
          onShowHistory={() => setCurrentView('history')}
        />
      )}
      
      {currentView === 'history' && (
        <AttendanceHistory onBack={() => setCurrentView('camera')} />
      )}
    </>
  );
}