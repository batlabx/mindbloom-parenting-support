
/**
 * Simple analytics service for MindBloom
 * In a real production app, this would send data to a backend.
 */
export const trackEvent = (eventName: string, properties?: any) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    event: eventName,
    time: timestamp,
    ...properties
  };
  
  // Builder can see these in the browser console
  console.log('%c[MindBloom Analytics]', 'color: #7D9D85; font-weight: bold;', logEntry);
  
  // Optionally persist logs locally for later retrieval
  const logs = JSON.parse(localStorage.getItem('mindbloom_analytics') || '[]');
  logs.push(logEntry);
  localStorage.setItem('mindbloom_analytics', JSON.stringify(logs.slice(-100))); // Keep last 100
};
