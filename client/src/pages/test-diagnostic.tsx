import { useEffect } from 'react';

export default function TestDiagnostic() {
  useEffect(() => {
    console.log('TestDiagnostic page loaded');
    console.log('Window object:', typeof window);
    console.log('LocalStorage available:', typeof localStorage !== 'undefined');
    
    // Test accessibility preferences
    try {
      const prefs = localStorage.getItem('accessibilityPreferences');
      console.log('Stored preferences:', prefs);
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Diagnostic Test Page</h1>
      <p>Check browser console for diagnostic information</p>
      <div className="mt-4 space-y-2">
        <p>Window: {typeof window !== 'undefined' ? 'Available' : 'Not available'}</p>
        <p>LocalStorage: {typeof localStorage !== 'undefined' ? 'Available' : 'Not available'}</p>
      </div>
    </div>
  );
}