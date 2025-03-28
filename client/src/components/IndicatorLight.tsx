import off from '../images/indicator_off.png';
import amber from '../images/indicator_amber.png';
import green from '../images/indicator_green.png';
import red from '../images/indicator_red.png';
import white from '../images/indicator_white.png';

import '../css/components/IndicatorLight.css';

export type IndicatorColor = 'amber' | 'green' | 'red' | 'white' | 'off';

interface IndicatorLightProps {
  x: number;
  y: number;
  color: IndicatorColor;
  label?: string;
  topLabel?: string;
}

export default function IndicatorLight({
  x,
  y,
  color,
  label,
  topLabel,
}: IndicatorLightProps) {
  const colorMap: Record<IndicatorColor, string> = {
    amber,
    green,
    red,
    white,
    off,
  };

  return (
    <div className="indicator-light-wrapper" style={{ top: y, left: x }}>
      {topLabel && <div className="indicator-light-top-label">{topLabel}</div>}
      <img src={colorMap[color]} className="indicator-light-img" />
      {label && <div className="indicator-light-label">{label}</div>}
    </div>
  );
}
