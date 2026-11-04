import { PropsWithChildren, ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type PressableProps,
  type ScrollViewProps,
  type ViewProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Écran défilant sur fond de papier, centré et borné en largeur. */
export function PaperScroll({
  children,
  withTabBar = true,
  contentContainerStyle,
  ...props
}: ScrollViewProps & { withTabBar?: boolean }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingTop: (withTabBar ? insets.top : 0) + Spacing.three,
          paddingBottom: insets.bottom + (withTabBar ? BottomTabInset : 0) + Spacing.five,
        },
        contentContainerStyle,
      ]}
      {...props}>
      <View style={styles.column}>{children}</View>
    </ScrollView>
  );
}

/** En-tête d'écran : surtitre en petites capitales, titre gravé, filet orné. */
export function ScreenHeader({
  kicker,
  title,
  subtitle,
}: {
  kicker: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.header}>
      <ThemedText type="kicker" themeColor="accent">
        {kicker}
      </ThemedText>
      <ThemedText type="subtitle" accessibilityRole="header">
        {title}
      </ThemedText>
      {subtitle ? (
        <ThemedText type="italic" themeColor="textSecondary">
          {subtitle}
        </ThemedText>
      ) : null}
      <Ornament />
    </View>
  );
}

/** Filet typographique ——— ❦ ——— */
export function Ornament({ glyph = '❦' }: { glyph?: string }) {
  const theme = useTheme();
  return (
    <View style={styles.ornament} accessibilityElementsHidden importantForAccessibility="no">
      <View style={[styles.rule, { backgroundColor: theme.border }]} />
      <ThemedText style={styles.glyph} themeColor="accent">
        {glyph}
      </ThemedText>
      <View style={[styles.rule, { backgroundColor: theme.border }]} />
    </View>
  );
}

/** Cadre à double filet, comme un cartouche de carte ancienne. */
export function Plate({ children, style, ...props }: ViewProps) {
  const theme = useTheme();
  return (
    <View
      style={[styles.plateOuter, { borderColor: theme.text, backgroundColor: theme.land }, style]}
      {...props}>
      <View style={[styles.plateInner, { borderColor: theme.border }]}>{children}</View>
    </View>
  );
}

export function SectionTitle({ children, aside }: PropsWithChildren<{ aside?: ReactNode }>) {
  return (
    <View style={styles.sectionTitle}>
      <ThemedText type="heading" accessibilityRole="header" style={{ flex: 1 }}>
        {children}
      </ThemedText>
      {aside}
    </View>
  );
}

export function Chip({
  label,
  selected,
  ...props
}: PressableProps & { label: string; selected?: boolean }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.chip,
        {
          borderColor: selected ? theme.accent : theme.border,
          backgroundColor: selected ? theme.accent : 'transparent',
        },
        pressed && styles.pressed,
      ]}
      {...props}>
      <ThemedText type="small" style={{ color: selected ? theme.background : theme.text }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
  },
  column: {
    flex: 1,
    minWidth: 0,
    maxWidth: MaxContentWidth,
    gap: Spacing.four,
  },
  header: {
    gap: Spacing.one,
    alignItems: 'center',
  },
  ornament: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    alignSelf: 'stretch',
    marginTop: Spacing.two,
  },
  rule: {
    flex: 1,
    height: StyleSheet.hairlineWidth * 2,
  },
  glyph: {
    fontSize: 20,
    lineHeight: 24,
  },
  plateOuter: {
    borderWidth: 1.5,
    padding: 3,
  },
  plateInner: {
    borderWidth: StyleSheet.hairlineWidth * 2,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.two,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  pressed: {
    opacity: 0.6,
  },
});
