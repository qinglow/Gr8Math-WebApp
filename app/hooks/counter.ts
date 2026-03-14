
import { useState, useEffect, useCallback } from 'react';

export function counter(initialSeconds: number = 0) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft]);

  const startCountdown = useCallback((seconds: number) => {
    setTimeLeft(seconds);
  }, []);

  return { timeLeft, startCountdown };
}