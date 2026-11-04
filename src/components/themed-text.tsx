import { StyleSheet, Text, type TextProps } from 'react-native';

import { ThemeColor, Typefaces } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?:
    | 'default'
    | 'italic'
    | 'title'
    | 'subtitle'
    | 'heading'
    | 'small'
    | 'smallBold'
    | 'kicker'
    | 'link';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? (type === 'link' ? 'accent' : 'text')] },
        styles[type],
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontFamily: Typefaces.body,
    fontSize: 17,
    lineHeight: 25,
  },
  italic: {
    fontFamily: Typefaces.bodyItalic,
    fontSize: 17,
    lineHeight: 25,
  },
  small: {
    fontFamily: Typefaces.body,
    fontSize: 15,
    lineHeight: 21,
  },
  smallBold: {
    fontFamily: Typefaces.bodyBold,
    fontSize: 15,
    lineHeight: 21,
  },
  title: {
    fontFamily: Typefaces.display,
    fontSize: 46,
    lineHeight: 52,
    letterSpacing: 2,
  },
  subtitle: {
    fontFamily: Typefaces.heading,
    fontSize: 32,
    lineHeight: 38,
  },
  heading: {
    fontFamily: Typefaces.heading,
    fontSize: 22,
    lineHeight: 27,
  },
  kicker: {
    fontFamily: Typefaces.display,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 2,
  },
  link: {
    fontFamily: Typefaces.bodyItalic,
    fontSize: 16,
    lineHeight: 22,
    textDecorationLine: 'underline',
  },
});
