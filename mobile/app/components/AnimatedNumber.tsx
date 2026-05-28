// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import { Text } from 'react-native';

interface AnimatedNumberProps {
  value: number | null | undefined;
  suffix?: string;
  decimals?: number;
  duration?: number;
  style?: object;
  fallback?: string;
}

/**
 * Smoothly animates a numeric value from its previous to new value.
 * Uses requestAnimationFrame with a quadratic ease-out curve.
 */
const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  suffix = '',
  decimals = 0,
  duration = 900,
  style,
  fallback = '—',
}) => {
  const [displayValue, setDisplayValue] = useState<number | null>(null);
  const prevValueRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (value == null) {
      setDisplayValue(null);
      prevValueRef.current = null;
      return;
    }

    const from = prevValueRef.current ?? value;
    const to = value;

    // Cancel any in-flight animation
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
    }

    if (from === to) {
      setDisplayValue(to);
      prevValueRef.current = to;
      return;
    }

    startTimeRef.current = null;

    const step = (timestamp: number) => {
      if (startTimeRef.current == null) {
        startTimeRef.current = timestamp;
      }
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Quadratic ease-out: decelerate towards the end
      const eased = 1 - (1 - progress) * (1 - progress);
      const current = from + (to - from) * eased;

      setDisplayValue(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setDisplayValue(to);
        prevValueRef.current = to;
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [value, duration]);

  if (displayValue == null) {
    return <Text style={style}>{fallback}</Text>;
  }

  const formatted = decimals > 0
    ? displayValue.toFixed(decimals)
    : Math.round(displayValue).toString();

  return <Text style={style}>{`${formatted}${suffix}`}</Text>;
};

export default AnimatedNumber;
