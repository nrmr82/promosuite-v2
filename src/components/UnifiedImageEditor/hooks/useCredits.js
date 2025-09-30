import { useState, useEffect, useCallback } from 'react';

// This would typically integrate with your existing user credit system
const useCredits = () => {
  const [credits, setCredits] = useState(50); // Initial credits for demo
  const [usage, setUsage] = useState([]);

  // Load credits from localStorage or API
  useEffect(() => {
    const savedCredits = localStorage.getItem('imageEditor_credits');
    if (savedCredits) {
      setCredits(parseInt(savedCredits, 10));
    }

    const savedUsage = localStorage.getItem('imageEditor_usage');
    if (savedUsage) {
      setUsage(JSON.parse(savedUsage));
    }
  }, []);

  // Save credits to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('imageEditor_credits', credits.toString());
  }, [credits]);

  // Save usage tracking
  useEffect(() => {
    localStorage.setItem('imageEditor_usage', JSON.stringify(usage));
  }, [usage]);

  const checkBalance = useCallback((requiredCredits) => {
    return credits >= requiredCredits;
  }, [credits]);

  const deductCredits = useCallback(async (amount, operation) => {
    if (credits < amount) {
      throw new Error('Insufficient credits');
    }

    // In a real app, this would make an API call to your backend
    // await api.deductCredits(amount, operation);

    setCredits(prev => prev - amount);
    
    // Track usage
    const usageEntry = {
      operation,
      amount,
      timestamp: new Date().toISOString(),
      remaining: credits - amount
    };
    
    setUsage(prev => [usageEntry, ...prev.slice(0, 49)]); // Keep last 50 entries

    return true;
  }, [credits]);

  const addCredits = useCallback((amount) => {
    // This would typically be called after a purchase
    setCredits(prev => prev + amount);
  }, []);

  const getUsageHistory = useCallback(() => {
    return usage;
  }, [usage]);

  const showInsufficientCredits = useCallback(() => {
    // This would show a modal or navigate to pricing page
    alert('Insufficient credits. Please purchase more credits to continue.');
  }, []);

  const trackOperation = useCallback((operation, cost) => {
    // Track operation without deducting credits (for analytics)
    const trackingEntry = {
      operation,
      cost,
      timestamp: new Date().toISOString(),
      type: 'tracking'
    };
    
    setUsage(prev => [trackingEntry, ...prev.slice(0, 49)]);
  }, []);

  return {
    credits,
    checkBalance,
    deductCredits,
    addCredits,
    showInsufficientCredits,
    trackOperation,
    getUsageHistory
  };
};

export { useCredits };