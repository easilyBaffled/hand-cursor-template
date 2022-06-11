import { useState } from 'react';
import './App.css';
import { configureMediaPipe } from './features/mediapipe';
import { DebugCanvas } from './components/ThreeDebug';

function App() {
  const [handData, setHandData] = useState({ raw: [] });
  const controlElement = useRef();
  const [count, setCount] = useState(0);

  useEffect(() => {
    configureMediaPipe(setHandData, controlElement.current, {
      filterFunc: (el) => el.classList.contains('key'),
      // clickHandler: el => el.click(),
      onPointerEnter(el) {
        console.log(el);
        el.classList.add('hovering');
      },
      onPointerLeave(el) {
        el.classList.remove('hovering');
        el.dataset.selected = false;
      },
      onPointerUp(el) {
        el.dataset.selected = false;
      },
      onPointerDown(el) {
        el.dataset.selected = true;
      },
    });
  }, []);

  const cursorPoint = handData?.centers?.[0] ?? { x: 0, y: 0 };
  const mouseState = handData?.pinchState;

  return (
    <div className="App">
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <div className="container">
        <div className="three-space">
          <DebugCanvas handData={handData.raw} />
        </div>
      </div>
      <div ref={controlElement} className="control-panel"></div>
    </div>
  );
}

export default App;
