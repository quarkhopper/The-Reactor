import SliderRow from '../components/SliderRow';

export default function SliderBlock() {
  return (
    <SliderRow
      x={280}
      y={850}
      columns={8}
      spacingX={65}
      height={200}
      onChange={(i, v) => {
        console.log(`Slider ${i} = ${v.toFixed(2)}`);
      }}
    />
  );
}
