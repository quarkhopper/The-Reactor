// client/src/panels/DigitalDisplayBlock.tsx
import DigitalDisplayPanel from '../components/DigitalDisplayPanel';

export default function DigitalDisplayBlock() {
  return (
    <>
      <DigitalDisplayPanel
        x={58}
        y={340}
        columns={12}
        rows={1}
        spacingX={126}
        spacingY={150}
        values={[
          { value: 0.25, label: 'PWR' },
          { value: 0.57, label: 'TMP' },
          { value: 0.88, label: 'FLX' },
          { value: 0.02, label: 'RDN' },
          { value: 0.31, label: 'ALT' },
          { value: 0.95, label: 'AMP' },
          { value: 0.25, label: 'PWR' },
          { value: 0.57, label: 'TMP' },
          { value: 0.88, label: 'FLX' },
          { value: 0.02, label: 'RDN' },
          { value: 0.31, label: 'ALT' },
          { value: 0.95, label: 'AMP' },
        ]}
      />

      <DigitalDisplayPanel
        x={988}
        y={750}
        columns={1}
        rows={3}
        spacingX={126}
        spacingY={80}
        values={[
          { value: 0.25, label: 'PWR' },
          { value: 0.57, label: 'TMP' },
          { value: 0.88, label: 'FLX' },
        ]}
      />
    </>
  );
}
