import { useEffect, useState } from "react";

export const Board = () => {
  const [numRows, setNumRows] = useState(6);
  const [numCells, setNumCells] = useState(5);
  const [focusedRow, setFocusedRow] = useState(0);

  useEffect(() => {
    console.log("focusedRow is ", focusedRow);
  }, [focusedRow]);

  const word = ["h", "e", "l", "l", "o"];

  const rows = [];
  for (let i = 0; i < numRows; i++) {
    rows.push(<Row key={i} cellCount={numCells} rowNum={i} focusedRow={focusedRow} focusNextRow={setFocusedRow} word={word} />);
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col justify-center items-center gap-[5px]">{rows}</div>
    </div>
  );
};

const Row = (props: { cellCount: number; rowNum: number; focusedRow: number; focusNextRow: React.Dispatch<React.SetStateAction<number>>; word: string[] }) => {
  const { cellCount = 5, rowNum, focusedRow, focusNextRow, word } = props;
  const [guess, setGuess] = useState<string[]>([]);
  const cells = [];
  for (let i = 0; i < cellCount; i++) {
    cells.push(<Cell key={i} letter={guess[i]} validity="" />);
  }

  useEffect(() => {
    // console.log("guess is ", guess);
  }, [guess]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (rowNum === focusedRow) {
        // console.log(`event.key: ${event.key}, focusedRow: ${focusedRow}, rowNum: ${rowNum}, guess: (${guess.join(", ")}), guess.length: ${guess.length}, cellCount: ${cellCount}`);
        if (/^[a-zA-Z]$/.test(event.key)) {
          if (guess.length < cellCount) {
            setGuess((prevGuess) => [...prevGuess, event.key]);
          }
        } else if (event.key === "Backspace") {
          if (guess.length > 0) {
            setGuess((prevGuess) => prevGuess.slice(0, prevGuess.length - 1));
          }
        } else if (event.key === "Enter" && guess.length === cellCount) {
          focusNextRow((prevRowNum) => prevRowNum + 1);
          for (let i = 0; i < 5; i++) {
            if (guess[i] !== word[i]) {
              console.log(guess[i], word[i], "incorrect");
            }
          }
        }
      } else {
        // console.log(`not focused ${rowNum}`);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [cellCount, focusNextRow, focusedRow, guess, rowNum, word]);

  return <div className={`flex justify-center items-center gap-[5px] ${rowNum === focusedRow ? "bg-green-300" : "bg-red-300"}`}>{cells}</div>;
};

const Cell = (props: { letter: string; validity: "wrong-letter" | "wrong-place" | "right-place" | "" }) => {
  const { letter, validity } = props;
  const [validityStyle, setValidityStyle] = useState("bg-transparent border-[#3A3A3C] border-2");
  useEffect(() => {
    switch (validity) {
      case "wrong-letter":
        setValidityStyle("bg-[#3A3A3C]");
        break;
      case "wrong-place":
        setValidityStyle("bg-[#B59F3B]");
        break;
      case "right-place":
        setValidityStyle("bg-[#538D4E]");
        break;
      default:
        setValidityStyle("bg-transparent border-[#3A3A3C] border-2");
    }
  }, [validity]);

  return <div className={`${validityStyle}  w-16 h-16 text-zinc-100 text-center text-4xl font-bold capitalize flex justify-center items-center focus:border-[#565758]`}>{letter}</div>;
};
