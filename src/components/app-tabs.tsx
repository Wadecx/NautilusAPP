import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundSelected}
      tintColor={colors.accent}
      labelStyle={{ selected: { color: colors.accent } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Accueil</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'safari', selected: 'safari.fill' }} md="explore" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="programme">
        <NativeTabs.Trigger.Label>Programme</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="calendar" md="calendar_month" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="plan">
        <NativeTabs.Trigger.Label>Plan</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'map', selected: 'map.fill' }} md="map" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="travaux">
        <NativeTabs.Trigger.Label>Travaux</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'paintpalette', selected: 'paintpalette.fill' }} md="palette" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="timonier">
        <NativeTabs.Trigger.Label>Timonier</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'bubble.left.and.text.bubble.right', selected: 'bubble.left.and.text.bubble.right.fill' }} md="forum" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
