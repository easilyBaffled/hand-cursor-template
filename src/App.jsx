import { useState, useRef, useEffect } from 'react';
import './App.css';
import { configureMediaPipe } from './features/mediapipe';
import { DebugCanvas } from './components/ThreeDebug';
import { Chain } from './features/lightning';
function App() {
  const [handData, setHandData] = useState({ raw: [] });
  const [isLoading, setLoading] = useState(true);
  const controlElement = useRef();
  const [count, setCount] = useState(0);

  useEffect(() => {
    configureMediaPipe(
      setHandData,
      controlElement.current,
      {
        filterFunc: (el) => el.classList.contains('key'),
        // clickHandler: el => el.click(),
        onPointerEnter(el) {
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
      },
      isLoading,
      setLoading
    );
  }, []);

  const cursorPoint = handData?.centers?.[0] ?? { x: 0, y: 0 };
  const mouseState = handData?.pinchState;
  // console.log(cursorPoint);
  return (
    <div className="App">
      <div className="container">
        <div className="three-space">
          {isLoading ? 'loading' : <DebugCanvas handData={handData.raw} />}
        </div>
      </div>
      <Chain />
      <div ref={controlElement} className="control-panel"></div>
    </div>
  );
}

export default App;
