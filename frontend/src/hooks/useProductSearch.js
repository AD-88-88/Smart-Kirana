import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { db } from '../firebase';

// Listens directly to Firestore (not the backend) so a rate change made on
// one device - phone, tablet, or the owner's PC - shows up on every other
// screen within a second, satisfying the PRD's "real-time rate lookup"
// requirement. Read-only data like this is safe to expose straight from
// the client; writes still go through the backend's transactional API.
export function useProductSearch(searchTerm) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      setResults([]);
      return;
    }

    setLoading(true);
    const end = term.replace(/.$/, (c) => String.fromCharCode(c.charCodeAt(0) + 1));

    const nameQuery = query(
      collection(db, 'products'),
      orderBy('nameLower'),
      where('nameLower', '>=', term),
      where('nameLower', '<', end)
    );

    const unsub = onSnapshot(
      nameQuery,
      (snap) => {
        setResults(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      () => setLoading(false)
    );

    return unsub;
  }, [searchTerm]);

  return { results, loading };
}

// Live full catalog listener, used by Inventory list and POS quick-tiles.
export function useAllProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('nameLower'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, []);

  return { products, loading };
}
