import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { generate } from "random-words";

export const Board = () => {
  // const [numRows, setNumRows] = useState(6);
  // const [numCells, setNumCells] = useState(5);
  const numRows = 6;
  const numCells = 5;
  const [focusedRow, setFocusedRow] = useState(0);
  const [word, setWord] = useState<string[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    const newWord = generate({ minLength: 5, maxLength: 5 });
    console.log(newWord);
    for (let i = 0; i < numCells; i++) {
      setWord((prevWord) => [...prevWord, newWord[i]]);
    }
  }, []);

  console.log(word);

  const rows = [];
  for (let i = 0; i < numRows; i++) {
    rows.push(
      <Row
        key={i}
        cellCount={numCells}
        rowNum={i}
        focusedRow={focusedRow}
        focusNextRow={setFocusedRow}
        word={word}
        game={{
          isGameOver,
          setIsGameOver,
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col justify-center items-center gap-[5px]">
        {rows}
      </div>
    </div>
  );
};

interface LetterCount {
  [key: string]: number;
}

const Row = (props: {
  cellCount: number;
  rowNum: number;
  focusedRow: number;
  focusNextRow: React.Dispatch<React.SetStateAction<number>>;
  word: string[];
  game: {
    isGameOver: boolean;
    setIsGameOver: React.Dispatch<React.SetStateAction<boolean>>;
  };
}) => {
  const { cellCount = 5, rowNum, focusedRow, focusNextRow, word, game } = props;
  // console.log("word is ", word);
  const [guess, setGuess] = useState<string[]>(new Array(cellCount).fill(""));
  const [validities, setValidities] = useState<
    ("present" | "correct" | "absent" | null)[]
  >(new Array(cellCount).fill(""));
  const [animateScaleIndex, setAnimateScaleIndex] = useState<number | null>(
    null
  );
  const [animateFlip, setAnimateFlip] = useState(false);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (game.isGameOver || rowNum !== focusedRow) return;

      const newGuess = [...guess];
      if (
        /^[a-zA-Z]$/.test(event.key) &&
        newGuess.join("").length < cellCount
      ) {
        const index = newGuess.join("").length;
        newGuess[index] = event.key;
        setGuess(newGuess);
        // Trigger scale animation
        setAnimateScaleIndex(index);
      } else if (event.key === "Backspace") {
        const index = Math.max(newGuess.join("").length - 1, 0);
        newGuess[index] = "";
        setGuess(newGuess);
        // Reset scale animation
        setAnimateScaleIndex(null);
      } else if (
        event.key === "Enter" &&
        newGuess.join("").length === cellCount
      ) {
        // Count each letter's occurrence in the target word
        const wordLetterCount = word.reduce((acc: LetterCount, letter) => {
          acc[letter] = (acc[letter] || 0) + 1;
          return acc;
        }, {} as LetterCount);

        // First pass: Mark 'correct' letters and reduce count
        const newValidities: ("present" | "correct" | "absent" | null)[] =
          newGuess.map((g, i) => {
            if (g === word[i]) {
              wordLetterCount[g]--; // Decrement the count of the correctly guessed letter
              return "correct";
            }
            return null; // Placeholder for letters not yet determined
          });

        // Second pass: Mark 'present' and 'absent' letters
        newValidities.forEach((val, i) => {
          if (val === null) {
            if (
              word.includes(newGuess[i]) &&
              wordLetterCount[newGuess[i]] > 0
            ) {
              wordLetterCount[newGuess[i]]--;
              newValidities[i] = "present";
            } else {
              newValidities[i] = "absent";
            }
          }
        });

        setValidities(newValidities);

        // Trigger flip animation
        setAnimateFlip(true);

        if (focusedRow !== 5) {
          console.log("focusedRow is ", focusedRow);
          focusNextRow((prev) => prev + 1);
        } else {
          // alert("You lose!");
          game.setIsGameOver(true);
        }
      }
    },
    [cellCount, focusNextRow, focusedRow, game, guess, rowNum, word]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    cellCount,
    focusedRow,
    guess,
    rowNum,
    word,
    focusNextRow,
    validities,
    handleKeyDown,
  ]);

  useEffect(() => {
    // console.log("validities are ", validities);
    if (validities.every((v) => v === "correct")) {
      console.log("You win!");
      game.setIsGameOver(true);
    }
  }, [game, handleKeyDown, validities]);

  return (
    <div className="flex justify-center items-center gap-[5px]">
      {guess.map((letter, i) => (
        <Cell
          key={i}
          letter={letter}
          animateScale={animateScaleIndex === i}
          animateFlip={animateFlip}
          validity={validities[i]}
          delay={(i + 1) * 0.1}
        />
      ))}
    </div>
  );
};

const Cell = (props: {
  letter: string;
  animateScale: boolean;
  animateFlip: boolean;
  validity: "present" | "correct" | "absent" | null;
  delay: number;
}) => {
  const { letter, animateScale, animateFlip, validity, delay } = props;
  let animation = {};
  if (animateFlip) {
    animation = {
      rotateX: 180,
      backgroundColor: getValidityColor(validity),
      borderColor: getValidityColor(validity),
      transition: { delay, duration: 0.7 },
    };
  } else if (animateScale) {
    animation = {
      scale: [1, 1.2, 1],
      transition: { duration: 0.4 },
    };
  }

  // The letter cell flips 180 in the real wordle,
  // but this leaves the letter upside down, so
  // flip the letter 180 degrees in the opposite
  // direction to correct it.
  const letterFlipAnimation = {
    rotateX: -180,
    transition: { delay, duration: 0.5 },
  };

  return (
    <motion.div
      className="w-16 h-16 text-zinc-100 text-center text-4xl font-bold capitalize flex justify-center items-center border-2 border-[#3A3A3C]"
      animate={animation}
    >
      {animateFlip ? (
        <motion.div animate={letterFlipAnimation}>{letter}</motion.div>
      ) : (
        letter
      )}
    </motion.div>
  );
};

function getValidityColor(
  validity: "present" | "correct" | "absent" | null
): string {
  switch (validity) {
    case "correct":
      return "#538D4E";
    case "present":
      return "#B59F3B";
    case "absent":
      return "#3A3A3C";
    default:
      return "#121213";
  }
}
