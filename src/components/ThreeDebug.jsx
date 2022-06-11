import { Fragment, useRef, useState } from 'react';
import { Text, OrthographicCamera } from '@react-three/drei';
import { Canvas, useLoader, useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Hands } from '../features/hand';
import { linearScale } from '../linearScale';

const ASSETS_PATH = 'https://assets.codepen.io/430361/';

function Box({ size = 1, ...props }) {
  // This reference gives us direct access to the THREE.Mesh object
  const ref = useRef();
  // Hold state for hovered and clicked events
  const [hovered, hover] = useState(false);
  const [clicked, click] = useState(false);
  // Subscribe this component to the render-loop, rotate the mesh every frame
  useFrame((state, delta) => (ref.current.rotation.x += 0.01));
  // Return the view, these are regular Threejs elements expressed in JSX
  return (
    <mesh
      {...props}
      ref={ref}
      scale={clicked ? 1.5 : size}
      onClick={(event) => click(!clicked)}
      onPointerOver={(event) => hover(true)}
      onPointerOut={(event) => hover(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  );
}

export function DebugCanvas({ children, handData }) {
  let rot = 0;
  try {
    // console.log((handData?.[4]?.x ?? 0).toFixed(2));
    rot = linearScale(
      (handData?.[4]?.x ?? 0).toFixed(2),
      0.03,
      0.9,
      2 * Math.PI
    );
  } catch (e) {
    console.error(e);
  }

  const gltf = useLoader(GLTFLoader, `${ASSETS_PATH}home_button.glb`);
  return (
    <Canvas>
      <OrthographicCamera position={[0, 0, 1]} zoom={105} makeDefault />

      {/* <primitive object={gltf.scene} rotation={[0, rot, 0]} /> */}
      <axesHelper args={[5]} />
      <gridHelper rotation={[1.57, 0, 0]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      {/* <Box position={[-1.2, 0, 0]} /> */}
      {/* {Array(6)
        .fill(0)
        .map((__, i) => (
          <Fragment key={i}>
            <Text
              scale={3}
              position={[0, i, 0.5]}
              color="black" // default
            >
              {i}
            </Text>
            <Text
              scale={3}
              position={[0, -i, 0.5]}
              color="black" // default
            >
              -{i}
            </Text>
            <Text
              scale={3}
              position={[i, 0, 0.5]}
              color="black" // default
            >
              {i}
            </Text>
            <Text
              scale={3}
              position={[-i, 0, 0.5]}
              color="black" // default
            >
              {i}
            </Text>
            <Box position={[i, 0, 0]} size={(i + 1) / 10} />
            <Box position={[i * -1, 0, 0]} size={(i + 1) / 10} />
          </Fragment>
        ))} */}

      <Hands handData={handData} height={8} width={10} />
      {children}
    </Canvas>
  );
}

