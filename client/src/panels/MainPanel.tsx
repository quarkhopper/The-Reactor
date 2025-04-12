import LeftBlock from './LeftBlock';
import CoreBlock from './CoreBlock';
import RightBlock from './RightBlock';
import ConditionLightBlock from './ConditionLightBlock';

export default function MainPanel() {
  return (
    <>
      <ConditionLightBlock/>
      <LeftBlock />
      <CoreBlock />
      <RightBlock />
    </>
  );
}
