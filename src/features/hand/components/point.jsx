import { Circle } from '@react-three/drei';
export function Point({ position }) {
  return (
    <mesh position={position} sizeAttenuation={false}>
      {/* <Circle args={[0.1, 30]} /> */}
      <sphereGeometry args={[0.1, 30, 30]} sizeAttenuation={false} />
      <meshPhongMaterial color="tomato" sizeAttenuation={false} />
    </mesh>
  );
}
