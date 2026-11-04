import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

const sAbonner = () => () => {};

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  // `false` pendant le rendu statique et l'hydratation, `true` ensuite dans le navigateur.
  const hasHydrated = useSyncExternalStore(
    sAbonner,
    () => true,
    () => false
  );
  const colorScheme = useRNColorScheme();

  return hasHydrated ? colorScheme : 'light';
}
