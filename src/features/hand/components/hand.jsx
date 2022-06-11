import { Point } from './point';
import { linearScale } from '../../../utils/linearScale';

const palmPoints = [0, 5, 9, 13, 17];
function get_polygon_centroid(handData) {
  let pts = palmPoints.map((index) => handData[index]);
  var first = pts[0],
    last = pts[pts.length - 1];
  if (first.x != last.x || first.y != last.y) pts.push(first);
  var twicearea = 0,
    x = 0,
    y = 0,
    nPts = pts.length,
    p1,
    p2,
    f;
  for (var i = 0, j = nPts - 1; i < nPts; j = i++) {
    p1 = pts[i];
    p2 = pts[j];
    f = p1.x * p2.y - p2.x * p1.y;
    twicearea += f;
    x += (p1.x + p2.x) * f;
    y += (p1.y + p2.y) * f;
  }
  f = twicearea * 3;
  return { x: x / f, y: y / f };
}

export const Hands = ({ handData, ...props }) => {
  return handData.map((data) => <Hand handData={data} {...props} />);
};

export const Hand = ({ handData = [], scaling, height, width }) => {
  const scaleX = (x) => linearScale.to(x, -width / 2, width / 2);
  const scaleY = (y) => linearScale.to(y, height / 2, -height / 2);

  const { x, y } = get_polygon_centroid(handData) ?? { x: 0, y: 0 };

  return (
    // <ErrorBoundary handData={handData}>
    <group>
      {(handData ?? []).map(({ x, y, z }) => (
        <Point
          position={[scaleX(x), scaleY(y), z]}
          key={JSON.stringify({ x, y, z })}
        />
      ))}
      <Point
        position={[scaleX(x), scaleY(y), 0]}
        key={JSON.stringify({ x, y })}
      />
    </group>
    // </ErrorBoundary>
  );
};
