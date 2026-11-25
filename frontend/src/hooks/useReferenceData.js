import { useEffect, useState } from 'react';
import { CATEGORY_OPTIONS, LOCATION_OPTIONS } from '../constants/filters';
import { getReferenceData } from '../services/referenceData';

// Starts with the local mirror so the UI renders immediately, then swaps in
// the backend lists once GET /categories and GET /locations respond.
export default function useReferenceData() {
  const [reference, setReference] = useState({
    categories: CATEGORY_OPTIONS,
    locations: LOCATION_OPTIONS,
  });

  useEffect(() => {
    let cancelled = false;
    getReferenceData().then((data) => {
      if (!cancelled) setReference(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return reference;
}
