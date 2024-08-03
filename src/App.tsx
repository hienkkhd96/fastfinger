import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
const MINISECONDS_IN_SECOND = 1000;

function App() {
  const [timeCountDown, setTimeCountDown] = useState(
    60 * MINISECONDS_IN_SECOND
  );

  const [data, setData] = useState(
    JSON.parse(localStorage.getItem("data") || "[]")
  );
  const [indexInput, setIndexInput] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [correctList, setCorrectList] = useState<number[]>([]);
  const [wrongList, setWrongList] = useState<number[]>([]);
  const [isStart, setIsStart] = useState(false);
  const [isShowEndGame, setIsShowEndGame] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeString = useMemo(() => {
    return dayjs(timeCountDown, "ss").format("mm:ss");
  }, [timeCountDown]);

  const handleInput = useCallback(
    (e: any) => {
      if (e.target.value.endsWith(" ")) {
        handleCheckText(e.target.value.trim());
        setIndexInput((prev) => prev + 1);
        setInputValue("");
      } else {
        setInputValue(e.target.value);
      }
    },
    [timeCountDown, indexInput]
  );
  const handleCheckText = (value: string) => {
    if (value === randomedData[indexInput].toString()) {
      setCorrectList((prev) => [...prev, indexInput]);
    } else {
      setWrongList((prev) => [...prev, indexInput]);
    }
  };
  const getClassName = (index: number) => {
    let className = ["rounded-sm"];
    if (correctList.includes(index)) {
      className.push("text-[green]");
    }
    if (wrongList.includes(index)) {
      className.push("text-[red]");
    }
    if (index === indexInput) {
      className.push("bg-[#bcbcbc]");
      if (
        inputValue !== randomedData[indexInput].toString() &&
        inputValue !== ""
      ) {
        className.push("!bg-[red]");
      }
      if (
        inputValue === randomedData[indexInput].toString() &&
        inputValue !== ""
      ) {
        className.push("!bg-[green]");
      }
    }
    return className.join(" ");
  };
  useEffect(() => {
    if (indexInput === randomedData.length) {
      setIsStart(false);
    }
    if (ref.current && containerRef.current) {
      const rect = ref.current.getBoundingClientRect();
      const lineHeight = rect.height;
      const rectContainer = containerRef.current?.getBoundingClientRect();
      const line = Math.floor((rect.top - rectContainer.top) / lineHeight); // Tính toán dòng dựa trên độ cao của mỗi dòng
      if (line > 0) {
        containerRef.current.style.transform = `translateY(-${
          line * lineHeight
        }px)`;
      }
      console.log("Phần tử đang ở dòng thứ:", line);
    }
  }, [indexInput]);
  const handleUpdateData = (e: any) => {
    const value = e.target.value;
    const newData = value.split(",");
    setData(newData);
    localStorage.setItem("data", JSON.stringify(newData));
    setIndexInput(0);
  };
  const getRandomList = (originalList: any[]) => {
    let shuffled = [...originalList].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, originalList.length);
  };
  const randomedData = useMemo(() => {
    const randomList = getRandomList(data);
    return randomList.filter((item) => item.trim() !== "");
  }, [data]);
  const handleShowEndGame = () => {
    setIsShowEndGame(true);
    if (inputRef.current) {
      inputRef.current?.blur();
    }
  };
  const handleEndGame = () => {
    setIsStart(false);
    setIndexInput(0);
    setCorrectList([]);
    setWrongList([]);
    setData([...data]);
    setInputValue("");

    if (containerRef.current) {
      containerRef.current.style.transform = `translateY(0px)`;
    }
  };
  useEffect(() => {
    if (isStart) {
      const interval = setInterval(() => {
        setTimeCountDown((prev) => prev - 1000);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setTimeCountDown(60 * MINISECONDS_IN_SECOND);
      setIndexInput(0);
    }
  }, [isStart]);
  useEffect(() => {
    if (timeCountDown <= 0 || indexInput === randomedData.length) {
      handleShowEndGame();
    }
  }, [timeCountDown, indexInput]);
  return (
    <>
      <div className="flex justify-center items-center flex-col h-screen bg-[#bddefe] relative px-2 lg:px-0">
        {isShowEndGame && (
          <div className="fixed h-full w-full bg-gray-400 z-40 flex justify-center items-center bg-opacity-50">
            <div className="bg-white p-4 rounded-md w-[400px] h-[200px] flex justify-center items-center flex-col">
              <h1 className="text-3xl font-semibold">Kết thúc</h1>
              <div className="mt-2">
                <p>Chính xác: {correctList.length}</p>
                <p>Sai: {wrongList.length}</p>
              </div>
              <button
                className="px-3 bg-[#3c4d5c] rounded-md text-white font-semibold text-[18px] mt-2"
                onClick={() => {
                  setIsShowEndGame(false);
                  handleEndGame();
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        )}
        <h1 className="text-3xl font-semibold mb-2">Speed Typing</h1>
        <div className="container max-w-[1000px]">
          <div className="w-full h-[110px] bg-white rounded-md break-before-all whitespace-break-spaces p-1 overflow-hidden">
            <div className={`relative `} ref={containerRef}>
              {randomedData.map((item, index) => (
                <span
                  key={index}
                  ref={index === indexInput ? ref : null}
                  className={`${getClassName(
                    index
                  )} text-center inline-block px-[6px] text-[24px] lg:text-[2rem]`}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="px-[200px] py-2 flex justify-center gap-x-2 mt-2 bg-[#a7c8e7]">
            <input
              type="text"
              value={inputValue}
              ref={inputRef}
              className="h-[46px] w-[460px] rounded-md shadow-md p-2"
              onChange={(e) => {
                if (!isStart) {
                  setIsStart(true);
                }
                handleInput(e);
              }}
              disabled={timeCountDown <= 0}
            />
            <button className="px-3 bg-[#3c4d5c] rounded-md text-white font-semibold text-[18px]">
              {timeString}
            </button>
            <button
              className="px-3 font-semibold text-[18px] bg-[#428bca] text-white rounded-md"
              onClick={() => {
                setIsStart(false);
                setIndexInput(0);
                setCorrectList([]);
                setWrongList([]);
                setData([...data]);
                setInputValue("");
              }}
            >
              Random
            </button>
          </div>
          <div className="mt-2">
            Chính xác ({correctList.length}) - Sai ({wrongList.length})
          </div>
          <div className="mt-2">
            <div>
              <textarea
                value={data.join(",")}
                className="w-full h-[100px] md:h-[400px] rounded-md mt-2 p-2"
                placeholder="Mỗi từ cách nhau bằng dấu ,"
                onChange={handleUpdateData}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
