import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, use, useCallback, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'nautilus:favoris';

type FavoritesContextValue = {
  favorites: Set<string>;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

/** « Mon parcours » : les évènements mis en favori, conservés sur l'appareil (hors connexion). */
export function FavoritesProvider({ children }: PropsWithChildren) {
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setFavorites(new Set(JSON.parse(raw) as string[]));
      })
      .catch(() => {});
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...next])).catch(() => {});
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ favorites, isFavorite: (id: string) => favorites.has(id), toggleFavorite }),
    [favorites, toggleFavorite]
  );

  return <FavoritesContext value={value}>{children}</FavoritesContext>;
}

export function useFavorites() {
  const context = use(FavoritesContext);
  if (!context) throw new Error('useFavorites doit être utilisé dans <FavoritesProvider>');
  return context;
}
