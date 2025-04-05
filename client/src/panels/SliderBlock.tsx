import SliderControl from '../components/SliderControl';

export default function SliderBlock() {
  const sliders = [];
  const baseX = 52;
  const baseY = 855;
  const spacingX = 65;

  for (let i = 0; i < 8; i++) {
    sliders.push(
      <SliderControl
        key={`slider_${i}`}
        id={`slider_${i}`}
        x={baseX + i * spacingX}
        y={baseY}
        target="rod"
        index={i}
      />
    );
  }

  return <>{sliders}</>;
}
