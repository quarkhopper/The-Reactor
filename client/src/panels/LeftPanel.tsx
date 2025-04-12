import MasterButton from '../components/MasterButton';
import SliderControl from '../components/SliderControl';


export default function MasterButtonBlock() {
  return (
    <div>
      <MasterButton x={670} y={655} />
      <SliderControl
        id='target_power'
        x={100}
        y={600}
        moveEvent='target_power_update'
      />
    </div>
  )
}
