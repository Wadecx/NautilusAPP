import { Tabs, TabList, TabSlot, TabTrigger, TabTriggerSlotProps, TabListProps } from 'expo-router/ui';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from './themed-text';

import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// Sur le web (PWA installée sur téléphone), barre d'onglets fixée en bas de l'écran.
export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="index" href="/" asChild>
            <TabButton glyph="✧">Accueil</TabButton>
          </TabTrigger>
          <TabTrigger name="programme" href="/programme" asChild>
            <TabButton glyph="☰">Programme</TabButton>
          </TabTrigger>
          <TabTrigger name="plan" href="/plan" asChild>
            <TabButton glyph="⌖">Plan</TabButton>
          </TabTrigger>
          <TabTrigger name="travaux" href="/travaux" asChild>
            <TabButton glyph="❦">Travaux</TabButton>
          </TabTrigger>
          <TabTrigger name="timonier" href="/timonier" asChild>
            <TabButton glyph="⚓">Timonier</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

function TabButton({ children, isFocused, glyph, ...props }: TabTriggerSlotProps & { glyph: string }) {
  const theme = useTheme();
  const color = isFocused ? theme.accent : theme.textSecondary;
  return (
    <Pressable {...props} style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}>
      <ThemedText style={[styles.glyph, { color }]}>{glyph}</ThemedText>
      <ThemedText type="kicker" style={[styles.label, { color }]}>
        {children}
      </ThemedText>
    </Pressable>
  );
}

function CustomTabList(props: TabListProps) {
  const theme = useTheme();
  return (
    <View {...props} style={[styles.bar, { backgroundColor: theme.background, borderTopColor: theme.text }]}>
      <View style={styles.inner}>{props.children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderTopWidth: 1.5,
    paddingBottom: 'env(safe-area-inset-bottom)' as unknown as number,
  },
  inner: {
    flexDirection: 'row',
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.two,
    gap: Spacing.half,
  },
  glyph: {
    fontSize: 20,
    lineHeight: 24,
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1,
  },
  pressed: {
    opacity: 0.6,
  },
});
