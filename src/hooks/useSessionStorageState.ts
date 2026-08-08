import { useState, useEffect, Dispatch, SetStateAction } from "react";

export function useSessionStorageState<T>(
  key: string,
  defaultValue: T
): [T, Dispatch<SetStateAction<T>>, boolean] {
  const [state, setState] = useState<T>(defaultValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const item = sessionStorage.getItem(key);
      if (item !== null) {
        const parsed = JSON.parse(item);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setState(() => parsed);
      }
    } catch (error) {
      console.error("Error reading sessionStorage key:", key, error);
    }
    setIsLoaded(true);
  }, [key]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      sessionStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error("Error writing sessionStorage key:", key, error);
    }
  }, [key, state, isLoaded]);

  return [state, setState, isLoaded];
}
