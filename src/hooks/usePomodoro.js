import { useCallback, useEffect, useRef, useState } from 'react';

export function usePomodoro() {
  const [isActive, setIsActive] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [totalSecs, setTotalSecs] = useState(0);
  const [leftSecs, setLeftSecs] = useState(0);
  const intervalRef = useRef(null);

  const openModal = useCallback(() => setShowModal(true), []);
  const closeModal = useCallback(() => setShowModal(false), []);

  const stop = useCallback(() => {
    clearInterval(intervalRef.current);
    setIsActive(false);
    setLeftSecs(0);
    setTotalSecs(0);
  }, []);

  const start = useCallback(
    (mins) => {
      const total = mins * 60;
      setTotalSecs(total);
      setLeftSecs(total);
      setIsActive(true);
      setShowModal(false);

      clearInterval(intervalRef.current);
      let remaining = total;

      intervalRef.current = setInterval(() => {
        remaining -= 1;
        setLeftSecs(remaining);
        if (remaining <= 0) {
          clearInterval(intervalRef.current);
          setTimeout(() => stop(), 2200);
        }
      }, 1000);
    },
    [stop]
  );

  useEffect(
    () => () => {
      clearInterval(intervalRef.current);
    },
    []
  );

  return { isActive, showModal, totalSecs, leftSecs, openModal, closeModal, start, stop };
}
