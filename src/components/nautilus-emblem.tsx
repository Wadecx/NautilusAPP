import { useMemo } from 'react';
import Svg, { Circle, G, Path } from 'react-native-svg';

import { useTheme } from '@/hooks/use-theme';

// Spirale logarithmique r = a·e^(bθ) : la coquille triple de rayon à chaque tour.
const B = Math.log(3) / (2 * Math.PI);
const TURNS = 2.6;
const CHAMBERS = 22;

function spiralPoint(theta: number, a: number, cx: number, cy: number) {
  const r = a * Math.exp(B * theta);
  return { x: cx + r * Math.cos(theta), y: cy - r * Math.sin(theta) };
}

function spiralPath(from: number, to: number, a: number, cx: number, cy: number, steps = 120) {
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const t = from + ((to - from) * i) / steps;
    const p = spiralPoint(t, a, cx, cy);
    d += `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)} ${p.y.toFixed(2)} `;
  }
  return d;
}

/** Emblème gravé du festival : coupe d'une coquille de nautile. */
export function NautilusEmblem({ size = 160 }: { size?: number }) {
  const theme = useTheme();

  const paths = useMemo(() => {
    const max = TURNS * 2 * Math.PI;
    const cx = 100;
    const cy = 100;
    // Rayon final ≈ 88 unités dans un viewBox de 200.
    const a = 88 / Math.exp(B * max);
    // Décalage du centre pour équilibrer la coquille dans le cadre.
    const ox = cx + 17;
    const oy = cy + 5;

    const outer = spiralPath(0, max, a, ox, oy, 240);
    const lip = spiralPath(max - 2 * Math.PI, max, a * 0.93, ox, oy, 120);

    // Cloisons (septa) : courbes entre la spire et le tour précédent.
    const septa: string[] = [];
    for (let i = 1; i <= CHAMBERS; i++) {
      const t = max - 0.35 - (i * (max - 2 * Math.PI - 0.5)) / CHAMBERS;
      if (t < 2 * Math.PI) break;
      const p1 = spiralPoint(t, a, ox, oy);
      const p2 = spiralPoint(t - 2 * Math.PI, a, ox, oy);
      const c = spiralPoint(t - 0.55, a * 1.45, ox, oy);
      const mx = (p1.x + p2.x) / 2;
      const my = (p1.y + p2.y) / 2;
      septa.push(
        `M${p1.x.toFixed(2)} ${p1.y.toFixed(2)} Q${((mx + c.x) / 2).toFixed(2)} ${((my + c.y) / 2).toFixed(2)} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
      );
    }

    const end = spiralPoint(max, a, ox, oy);
    const endInner = spiralPoint(max - 2 * Math.PI, a, ox, oy);
    const aperture = `M${end.x.toFixed(2)} ${end.y.toFixed(2)} L${endInner.x.toFixed(2)} ${endInner.y.toFixed(2)}`;

    return { outer, lip, septa, aperture };
  }, []);

  return (
    <Svg width={size} height={size} viewBox="0 0 200 200" accessibilityLabel="Emblème du festival Nautilus">
      <Circle cx={100} cy={100} r={97} stroke={theme.text} strokeWidth={1.2} fill="none" />
      <Circle cx={100} cy={100} r={93} stroke={theme.border} strokeWidth={0.6} fill="none" />
      <G fill="none" strokeLinecap="round" strokeLinejoin="round">
        <Path d={paths.outer} stroke={theme.text} strokeWidth={2.2} />
        <Path d={paths.lip} stroke={theme.text} strokeWidth={0.6} strokeDasharray="1 2.5" />
        {paths.septa.map((d, i) => (
          <Path key={i} d={d} stroke={theme.accent} strokeWidth={1} />
        ))}
        <Path d={paths.aperture} stroke={theme.text} strokeWidth={2.2} />
      </G>
    </Svg>
  );
}
