import { useEffect, useRef, useState } from "react";
import "./App.css";
import styled, { keyframes } from "styled-components";

const spin = keyframes`
  from {
    --angle: -45deg;
  }
  to {
    --angle: 315deg;
  }
`;

const StyledDiv = styled.div`
  &::after,
  &::before {
    background-image: ${({ color }) =>
      `conic-gradient(from var(--angle), transparent 10%, ${color})`};
  }
  animation: ${spin} 2s linear infinite;
`;

function App() {
  const [points, setPoints] = useState<number | null>(5);
  const [status, setStatus] = useState<JSX.Element>(
    <span className="status" style={{ color: "#fff" }}>
      Let's Play
    </span>
  );
  const [isStop, setIsStop] = useState(false);
  const [isStart, setIsStart] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
  const autoRef = useRef(false);

  const renderItem = () => {
    if (!points || points <= 0) return;

    const items = [];

    if (points) {
      for (let i = 1; i <= points; i++) {
        const left = Math.random() * 725;
        const top = Math.random() * 725;
        items.push({ id: i, left, top, time: 3, isClicked: false, opacity: 1 });
      }
    }
    setCircles(items);
    currentRef.current = 1;
    setIsStop(false);
    setActiveIntervals([]);
  };

  const clearAllInterval = () => {
    setActiveIntervals([]);
    activeIntervals.forEach((interval) => clearInterval(interval));
  };

  //=================== START===================
  const handleStart = () => {
    if (!points || points <= 0) {
      alert("Please enter number of points!");
      return;
    }

    setIsStart(true);

    clearAllInterval();

    const timerInterval = setInterval(() => {
      setTimer((prev) => prev + 0.1);
    }, 100);
    setActiveIntervals([timerInterval]);
  };

  //=================== RESET===================
  const handleReset = () => {
    setIsStop(false);
    setCircles([]);
    autoRef.current = false;
    currentRef.current = 1;
    setStatus(
      <span className="status" style={{ color: "#fff" }}>
        Let's Play
      </span>
    );

    setTimer(0);
    clearAllInterval();
    renderItem();

    const timerInterval = setInterval(() => {
      setTimer((prev) => prev + 0.1);
    }, 100);

    setActiveIntervals([timerInterval]);
  };

  //=================== CLICK===================
  const handleClick = (id: number) => {
    if (isStop) return;

    if (id !== currentRef.current) {
      clearAllInterval();
      setIsStop(true);
      setStatus(<span className="status error-color">Game Over!</span>);
      return;
    }

    const interval = setInterval(() => {
      setCircles((prev) =>
        prev.map((circle) => {
          if (circle.id === id && circle.time > 0) {
            const updatedTime = parseFloat((circle.time - 0.1).toFixed(1));
            const updatedOpacity = Math.max(0, circle.opacity - 0.035);

            return {
              ...circle,
              time: updatedTime,
              isClicked: true,
              opacity: updatedOpacity,
            };
          }
          return circle;
        })
      );
    }, 100);

    setActiveIntervals((prevIntervals) => [...prevIntervals, interval]);
    currentRef.current += 1;
    setTimeout(() => clearInterval(interval), 3000);
  };

  //=================== AUTO===================
  const handleAuto = () => {
    autoRef.current = true;

    const autoInterval = setInterval(() => {
      if (points && currentRef.current > points) {
        clearInterval(autoInterval);
        autoRef.current = false;
        return;
      }

      if (autoRef.current) {
        handleClick(currentRef.current);
      }
    }, 1000);

    setActiveIntervals((prevIntervals) => [...prevIntervals, autoInterval]);
  };

  const handleStopAuto = () => {
    autoRef.current = false;
  };

  useEffect(() => {
    setStatus(
      <span className="status" style={{ color: "#fff" }}>
        Let's Play
      </span>
    );

    if (isStart) {
      renderItem();
    }
  }, [points, isStart]);

  useEffect(() => {
    if (!isStop && isStart) {
      handleStart();
    }
  }, [isStop, isStart]);

  useEffect(() => {
    if (
      circles.length > 0 &&
      circles.every((circle) => circle.isClicked && circle.time === 0)
    ) {
      clearAllInterval();
      setStatus(<span className="status correct-color">All cleared</span>);
    }
  }, [circles]);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  }, []);

  return (
    <>
      {isLoading ? (
        <div className="loading">
          <div>Loading</div>
          <div className="loader"></div>
        </div>
      ) : (
        <div className="container">
          <header>
            <h2>{status}</h2>

            <div className="controller">
              <div>Points:</div>
              <input
                type="number"
                value={points || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "") {
                    setPoints(null);
                  } else {
                    setPoints(Number(value));
                  }
                }}
              />
            </div>

            <div className="controller">
              <div>Time:</div>
              <div>{timer.toFixed(1)}s</div>
            </div>

            <div className="controller-buttons">
              {isStart ? (
                <>
                  <div className="button" onClick={handleReset}>
                    <StyledDiv color="var(--correct)" className="btn-content">
                      <span>Restart</span>
                    </StyledDiv>
                  </div>
                  {!circles.every((circle) => circle.isClicked) && (
                    <div
                      className="button"
                      onClick={autoRef.current ? handleStopAuto : handleAuto}
                    >
                      <StyledDiv color="var(--warning)" className="btn-content">
                        <span>
                          Auto: <span>{autoRef.current ? "OFF" : "ON"}</span>
                        </span>
                      </StyledDiv>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="button" onClick={handleStart}>
                    <StyledDiv color="var(--primity)" className="btn-content">
                      <span>Start</span>
                    </StyledDiv>
                  </div>
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
                  <span
                    style={{ color: circle.isClicked ? "#fff" : "#D25732" }}
                  >
                    {circle.id}
                  </span>
                  {circle.isClicked && <span>{circle.time}s</span>}
                </div>
              ))}
            </div>
          </main>
        </div>
      )}
    </>
  );
}

export default App;
