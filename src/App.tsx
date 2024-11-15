import { useEffect, useRef, useState } from 'react'
import './App.css'

function App() {
  const [points] = useState(5);
  const [isStop, setIsStop] = useState(false);
  const [isStart, setIsStart] = useState(false);
  const [isAuto, setIsAuto] = useState(false);
  const [timer, setTimer] = useState(0);
  const [activeIntervals, setActiveIntervals] = useState<NodeJS.Timeout[]>([]);
  const [circles, setCircles] = useState<
    {
      id: number;
      left: number;
      top: number;
      time: number;
      isClicked: boolean;
      opacity: number;
    }[]
  >([]);

  const currentRef = useRef(1);

  const renderItem = () => {
    const items = [];

    for (let i = 1; i <= points; i++) {
      const left = Math.random() * 725;
      const top = Math.random() * 725;
      items.push({ id: i, left, top, time: 3, isClicked: false, opacity: 1 });
    }
    setCircles(items);
    currentRef.current = 1
    setIsStop(false);
    setActiveIntervals([]);
  }

  const clearAllInterval = () => {
    setActiveIntervals([]);
    activeIntervals.forEach((interval) => clearInterval(interval));
  }

  //=================== START===================
  const handleStart = () => {
    setIsStart(true);

    clearAllInterval()

    const timerInterval = setInterval(() => {
      setTimer(prev => prev + 0.1)
    }, 100)
    setActiveIntervals([timerInterval]);
  }

  //=================== RESET===================
  const handleReset = () => {
    clearAllInterval();
    setCircles([]);
    setIsStop(false); 
    setIsAuto(false);
    currentRef.current = 1
    setTimer(0);
    renderItem();
  }

  //=================== CLICK===================
  const handleClick = (id: number) => {
    if (isStop) return;

    if (id !== currentRef.current) {
      clearAllInterval();
      setIsStop(true);
      return;
    }

    const interval = setInterval(() => {
      setCircles((prev) =>
        prev.map((circle) => {
          if (circle.id === id && circle.time > 0) {
            const updatedTime = parseFloat((circle.time - 0.1).toFixed(1));
            const updatedOpacity = Math.max(0, circle.opacity - 0.035);

            return { ...circle, time: updatedTime, isClicked: true, opacity: updatedOpacity };
          }
          return circle;
        })
      );
    }, 100);

    setActiveIntervals((prevIntervals) => [...prevIntervals, interval]);
    currentRef.current += 1;
    setTimeout(() => clearInterval(interval), 3000);
  }

  //=================== AUTO===================
  const handleAuto = () => {
      setIsAuto(true);
  
      const autoInterval = setInterval(() => {
        if (currentRef.current > points ) {
          clearInterval(autoInterval);
          setIsAuto(false);
          return;
        }

        if (!isAuto) return
  
        handleClick(currentRef.current);
      }, 1000);
  
      setActiveIntervals((prevIntervals) => [...prevIntervals, autoInterval]);

  };

  const handleStopAuto = () => {
    setIsAuto(false);
  };

  useEffect(() => {
    if (isStart) {
      renderItem()
    }
  }, [points, isStart]);

  useEffect(() => {
    if (!isStop && isStart) {
      handleStart();
    }
  }, [isStop, isStart]);

  useEffect(() => {
    if (circles.every((circle) => circle.isClicked && circle.time === 0)) {
      clearAllInterval();
    }
  }, [circles])

  return (
    <div className="container">
      <header>
        <h2>Let's play</h2>

        <div className="">
          <div>Points:</div>
          <input type="text" />
        </div>

        <div>
          <div>Time:</div>
          <div>{timer.toFixed(1)}</div>
        </div>

        <div>
          {isStart ? (
            <>
              <button onClick={handleReset}>Restart</button>
              <button onClick={isAuto ? handleStopAuto : handleAuto}>
                Auto Play: <span>{isAuto ? 'OFF': 'ON'}</span>
              </button>
            </>
          ) : (
            <>
              <button onClick={handleStart}>Start</button>
            </>
          )}
        </div>
      </header>

      <main>
        <div className="game-container">

            {circles.map((circle) => (
              <div
                className="circle"
                key={circle.id}
                style={{
                  left: circle.left,
                  top: circle.top,
                  opacity: circle.opacity,
                  background: circle.isClicked ? "#D25732" : "#fff",
                  zIndex: circle.opacity < 1 ? 0 : circles.length - circle.id,
                  display: circle.opacity === 0 ? "none" : "flex",
                }}
                onClick={() =>
                  !isStart
                    ? alert("Click start first!")
                    : circle.isClicked
                    ? console.log("clicked!")
                    : handleClick(circle.id)
                }
              >
                <span style={{ color: circle.isClicked ? "#fff" : "#D25732" }}>
                  {circle.id}
                </span>
                {circle.isClicked && <span>{circle.time}s</span>}
              </div>
            ))}

        </div>
      </main>
    </div>
  );
}

export default App
