import { get_polygon_centroid } from './get_polygon_centroid';
import pinch, { POINTER_STATE } from './pinch';

const getPointerPinch = (pinchState) => pinchState[1][0] ?? pinchState[0][0];

function getScaledPos({ x, y }) {
  const width =
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth;
  const height =
    window.innerHeight ||
    document.documentElement.clientHeight ||
    document.body.clientHeight;

  return { x: width * x, y: height * y };
}

function findNewTargets({ x, y }, filterFunc = () => true) {
  const point = getScaledPos({ x, y });
  const range = 5;
  const positions = [
    [point.x + range, point.y],
    [point.x - range, point.y],
    [point.x, point.y + range],
    [point.x, point.y - range],
  ];
  return Array.from(
    new Set(positions.flatMap(([x, y]) => document.elementsFromPoint(x, y)))
  ).filter(filterFunc);
}

let prevTargs = [];
function updateTargets(postion, filterFunc) {
  const newTargets = postion ? findNewTargets(postion, filterFunc) : [];

  const groupings = {
    entering: newTargets.filter((targ) => prevTargs.every((t) => t !== targ)),
    staying: prevTargs.filter((targ) => newTargets.find((t) => t === targ)),
    exiting: prevTargs.filter((targ) => newTargets.find((t) => t !== targ)),
  };

  prevTargs = groupings.entering.concat(groupings.staying);

  return groupings;
}

// https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events

const noop = () => true;

export const onFrame =
  (
    setHandData,
    {
      filterFunc,
      onPointerDown = noop, // Fired when a pointer becomes active buttons state.
      onPointerUp = noop, // Fired when a pointer is no longer active buttons state.
      onPointerMove = noop, // Fired when a pointer changes coordinates.
      onPointerOver = noop, // Fired when a pointer is moved into an element's hit test boundaries.
      onPointerOut = noop, // Fired when a pointer is moved out of the hit test boundaries of an element; firing the pointerup event for a device that does not support hover
      onPointerEnter = noop, // Fired when a pointer is moved into the hit test boundaries of an element or one of its descendants, including as a result of a pointerdown event from a device that does not support hover (see pointerdown).
      onPointerLeave = noop, // Fired when a pointer is moved out of the hit test boundaries of an element
    }
  ) =>
  (results) => {
    if (results.multiHandLandmarks) {
      const { pinchState, ...rest } = pinch.onFrame(results);
      const cursorPoint =
        results.multiHandLandmarks.map(get_polygon_centroid)[0] ||
        results.multiHandLandmarks.map(get_polygon_centroid)[1];

      if (cursorPoint) {
        // update element list
        const { entering, staying, exiting } = updateTargets(
          cursorPoint,
          filterFunc
        );

        // "emit" events
        const { x: scaledX, y: scaledY } = getScaledPos(cursorPoint);
        const eventPayload = { ...cursorPoint, scaledX, scaledY };
        const pointerState = getPointerPinch(pinchState);

        entering.forEach((el) => onPointerEnter(el, eventPayload));
        exiting.forEach((el) => onPointerLeave(el, eventPayload));

        entering.concat(staying).forEach((el) => {
          onPointerOver(el, eventPayload);
          if (pointerState === POINTER_STATE.START)
            onPointerDown(el, eventPayload);
          else if (pointerState === POINTER_STATE.RELEASE)
            onPointerUp(el, eventPayload);
        });
      }

      setHandData({
        raw: results.multiHandLandmarks,
        centers: results.multiHandLandmarks.map(get_polygon_centroid),
        pinchState,
        // pinches: results.multiHandLandmarks
      });
    }
  };
