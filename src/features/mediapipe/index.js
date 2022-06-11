import '../../../node_modules/@mediapipe/hands/';
import { onFrame } from './onFrame';
const mpHands = window;
const controls = window;

const config = {
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@${mpHands.VERSION}/${file}`;
  },
}; // We'll add this to our control panel later, but we'll save it here so we can

const createControlPanel = (controlsElement, hands) =>
  new controls.ControlPanel(controlsElement, {
    selfieMode: true,
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  })
    .add([
      new controls.SourcePicker({
        onFrame: async (input, size) => {
          await hands.send({
            image: input,
          });
        },
      }),
    ])
    .on((options) => {
      hands.setOptions(options);
    });

export function configureMediaPipe(setHandData, controlElement, eventConfig) {
  const hands = new mpHands.Hands(config);
  hands.onResults(onFrame(setHandData, eventConfig));
  createControlPanel(controlElement, hands);
}
