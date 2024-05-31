"use client";
import { Card, CardHeader, Input, Button, Chip } from "@nextui-org/react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import React, { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@nextui-org/table";
import { stat } from "fs";

interface AnswerResult {
  attempted: number;
  correct: number;
  wrong: number;
  marks: string;
  xCount: number;
  detailedCheck: {
    [key: number]: {
      correctAnswer: string;
      userAnswer: string;
      status: string;
    };
  };
}

const storedPapers: { [key: string]: string } = {
  "2021":
    "1 C 2 A 3 D 4 B 5 A 6 B 7 B 8 C 9 A 10 D 11 B 12 D 13 C 14 D 15 A 16 B 17 D 18 B 19 A 20 C 21 D 22 A 23 B 24 D 25 C 26 A 27 D 28 A 29 D 30 D 31 B 32 D 33 A 34 A 35 C 36 A 37 C 38 D 39 D 40 C 41 A 42 X 43 D 44 A 45 B 46 D 47 A 48 B 49 D 50 D 51 C 52 C 53 A 54 A 55 C 56 C 57 D 58 B 59 C 60 D 61 A 62 B 63 C 64 C 65 B 66 A 67 X 68 X 69 A 70 X 71 B 72 B 73 B 74 B 75 C 76 D 77 B 78 A 79 B 80 A 81 C 82 B 83 C 84 D 85 C 86 D 87 B 88 B 89 C 90 A 91 C 92 B 93 D 94 A 95 B 96 C 97 A 98 D 99 B 100 D",
  "2023":
    "1 C 2 B 3 D 4 B 5 B 6 X 7 D 8 X 9 D 10 X 11 D 12 B 13 C 14 D 15 B 16 B 17 B 18 B 19 A 20 D 21 C 22 B 23 C 24 A 25 C 26 A 27 A 28 D 29 C 30 B 31 B 32 B 33 B 34 D 35 D 36 A 37 C 38 D 39 D 40 A 41 C 42 B 43 A 44 C 45 D 46 A 47 B 48 D 49 B 50 A 51 B 52 A 53 D 54 X 55 B 56 D 57 C 58 B 59 D 60 B 61 C 62 A 63 C 64 C 65 A 66 B 67 B 68 B 69 C 70 D 71 A 72 X 73 D 74 C 75 D 76 D 77 A 78 C 79 B 80 A 81 A 82 A 83 B 84 C 85 B 86 C 87 A 88 B 89 C 90 B 91 A 92 C 93 B 94 A 95 C 96 C 97 D 98 C 99 B 100 D",
  "2022":
    "1 B 2 A 3 C 4 D 5 B 6 B 7 D 8 A 9 C 10 B 11 B 12 A 13 D 14 B 15 A 16 A 17 C 18 X 19 A 20 C 21 A 22 B 23 D 24 C 25 B 26 C 27 A 28 A 29 D 30 B 31 B 32 A 33 A 34 D 35 D 36 C 37 C 38 B 39 A 40 C 41 A 42 C 43 C 44 C 45 C 46 D 47 B 48 B 49 A 50 A 51 D 52 D 53 D 54 B 55 C 56 C 57 D 58 D 59 X 60 A 61 B 62 C 63 B 64 D 65 C 66 B 67 A 68 A 69 D 70 D 71 A 72 A 73 B 74 B 75 B 76 B 77 A 78 A 79 D 80 C 81 B 82 C 83 A 84 C 85 D 86 C 87 A 88 D 89 B 90 A 91 B 92 D 93 A 94 C 95 B 96 D 97 A 98 B 99 C 100 A",
  "2019":
    "1 B 2 C 3 A 4 D 5 A 6 C 7 B 8 D 9 A 10 A 11 A 12 C 13 D 14 C 15 B 16 A 17 C 18 D 19 B 20 A 21 A 22 C 23 B 24 C 25 B 26 D 27 D 28 D 29 C 30 D 31 A 32 A 33 B 34 C 35 C 36 D 37 D 38 C 39 B 40 B 41 D 42 D 43 C 44 A 45 C 46 A 47 D 48 B 49 C 50 C 51 D 52 C 53 B 54 C 55 B 56 C 57 C 58 C 59 C 60 D 61 B 62 B 63 A 64 C 65 C 66 D 67 B 68 B 69 A 70 D 71 B 72 B 73 B 74 B 75 C 76 D 77 C 78 B 79 A 80 B 81 D 82 C 83 C 84 B 85 D 86 A 87 D 88 D 89 B 90 C 91 B 92 A 93 B 94 C 95 A 96 A 97 B 98 C 99 B 100 B",
  "2018":
    "1 X 2 A 3 C 4 A 5 D 6 C 7 A 8 B 9 A 10 B 11 B 12 C 13 A 14 B 15 D 16 A 17 B 18 A 19 A 20 C 21 C 22 B 23 C 24 D 25 B 26 X 27 A 28 B 29 C 30 B 31 C 32 B 33 A 34 C 35 X 36 C 37 D 38 A 39 C 40 B 41 B 42 C 43 B 44 A 45 D 46 C 47 C 48 A 49 B 50 D 51 B 52 D 53 D 54 C 55 B 56 A 57 A 58 D 59 C 60 B 61 B 62 A 63 A 64 D 65 B 66 A 67 D 68 D 69 A 70 D 71 D 72 C 73 B 74 C 75 A",
  "2017":
    "1 C 2 B 3 D 4 A 5 C 6 D 7 A 8 D 9 D 10 A 11 B 12 A 13 C 14 C 15 B 16 C 17 B 18 A 19 D 20 D 21 A 22 B 23 C 24 D 25 A 26 C 27 B 28 C 29 B 30 C 31 B 32 A 33 C 34 A 35 D 36 B 37 C 38 B 39 C 40 D 41 A 42 B 43 C 44 B 45 D 46 C 47 D 48 B 49 A 50 C 51 D 52 B 53 D 54 D 55 A 56 C 57 A 58 D 59 C 60 B 61 D 62 C 63 C 64 C 65 D 66 A 67 A 68 C 69 A 70 B 71 C 72 A 73 B 74 C 75 A",
};

function MarksPage() {
  const [correctAnswer, setCorrectAnswer] = useState<string>("");
  const [userInput, setUserInput] = useState<string>("");
  const [result, setResult] = useState<AnswerResult>({
    attempted: 0,
    correct: 0,
    wrong: 0,
    marks: "0.00",
    xCount: 0,
    detailedCheck: {},
  });

  const parseAnswers = (input: string) => {
    const answers: { [key: number]: string } = {};
    const parts = input.trim().split(/\s+/); // Use a regular expression to split on one or more whitespace characters
    for (let i = 0; i < parts.length; i += 2) {
      const questionNumber = parseInt(parts[i], 10); // Convert to number, explicitly specify base 10
      if (!isNaN(questionNumber)) {
        // Check if the question number is a valid number
        const answer = parts[i + 1].toLowerCase().trim(); // Trim the answer to handle leading/trailing spaces
        answers[questionNumber] = answer;
      }
    }
    return answers;
  };

  const handleCheckAnswer = () => {
    const correctAnswers = parseAnswers(correctAnswer);
    const userAnswers = parseAnswers(userInput);

    let attempted = 0;
    let correct = 0;
    let wrong = 0;
    let marks = 0;
    let xCount = 0;
    const detailedCheck: {
      [key: number]: {
        correctAnswer: string;
        userAnswer: string;
        status: string;
      };
    } = {};

    // Iterate over all correct answers
    for (const [questionNumberStr, correctAnswer] of Object.entries(
      correctAnswers
    )) {
      const questionNumber = parseInt(questionNumberStr, 10);
      const userAnswer = userAnswers[questionNumber] || "";

      if (userAnswer === "") {
        // User didn't attempt this question
        if (correctAnswer === "x") {
          xCount++;
          marks += 1;
          detailedCheck[questionNumber] = {
            correctAnswer,
            userAnswer: "", // Use "x" if user didn't provide an answer
            status: "Marks Given",
          };
        } else {
          detailedCheck[questionNumber] = {
            correctAnswer,
            userAnswer: "",
            status: "Not Attempted",
          };
        }
      } else {
        attempted++;
        if (correctAnswer === "x") {
          xCount++;
          marks += 1;
          detailedCheck[questionNumber] = {
            correctAnswer,
            userAnswer,
            status: "Marks Given",
          };
        } else if (userAnswer === correctAnswer) {
          correct++;
          marks += 1;
          detailedCheck[questionNumber] = {
            correctAnswer,
            userAnswer,
            status: "Correct",
          };
        } else {
          wrong++;
          marks -= 0.25;
          detailedCheck[questionNumber] = {
            correctAnswer,
            userAnswer,
            status: "Wrong",
          };
        }
      }
    }

    setResult({
      attempted,
      correct,
      wrong,
      marks: marks.toFixed(2),
      xCount,
      detailedCheck,
    });
  };

  return (
    <AnimatePresence>
      <MotionConfig transition={{ duration: 0.5 }}>
        <motion.div
          className="flex flex-col items-center justify-center text-white p-4 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 min-h-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Card className="py-4 bg-black/40 min-w-[24rem]  backdrop-blur-xl rounded-lg shadow-lg max-w-[90%]">
            <CardHeader className="pb-2 pt-0 px-4 flex flex-col items-start">
              <motion.div
                className="flex flex-col justify-between items-start gap-4 w-full"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-full">
                  <Input
                    fullWidth
                    color="primary"
                    size="lg"
                    placeholder="Enter correct answer"
                    value={correctAnswer}
                    onChange={(e) => setCorrectAnswer(e.target.value)}
                    className="border border-purple-500 focus:ring-2 focus:ring-purple-600"
                  />
                </div>
                <div className="w-full">
                  <Input
                    fullWidth
                    color="primary"
                    size="lg"
                    placeholder="Enter your answer"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="border border-purple-500 focus:ring-2 focus:ring-purple-600"
                  />
                </div>
                <Button
                  className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white"
                  onClick={handleCheckAnswer}
                >
                  Check Answer
                </Button>
                <div className="w-full flex flex-wrap gap-2 mt-4">
                  {Object.keys(storedPapers).map((year) => (
                    <Button
                      key={year}
                      className="bg-gradient-to-r from-purple-600 to-purple-800 text-white"
                      onClick={() => setCorrectAnswer(storedPapers[year])}
                    >
                      {year}
                    </Button>
                  ))}
                </div>
                {result.attempted > 0 && (
                  <div className="w-full text-white mt-4 p-4 bg-gradient-to-r from-gray-700 via-gray-900 to-black rounded-lg">
                    <p className="text-sm">Attempted: {result.attempted}</p>
                    <p className="text-sm">Correct: {result.correct}</p>
                    <p className="text-sm">Wrong: {result.wrong}</p>
                    <p className="text-sm">Marks: {result.marks}</p>
                    <p className="text-sm">X Count: {result.xCount}</p>
                    <Table className="w-full text-black mt-4">
                      <TableHeader className="bg-gradient-to-r from-purple-600 to-purple-800 text-white">
                        <TableColumn>Question Number</TableColumn>
                        <TableColumn>Correct Answer</TableColumn>
                        <TableColumn>Your Answer</TableColumn>
                        <TableColumn>Status</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(result.detailedCheck).map(
                          ([
                            questionNumber,
                            { correctAnswer, userAnswer, status },
                          ]) => (
                            <TableRow key={questionNumber}>
                              <TableCell>{questionNumber}</TableCell>
                              <TableCell>{correctAnswer}</TableCell>
                              <TableCell>{userAnswer}</TableCell>
                              <TableCell>
                                <Chip
                                  color={
                                    status === "Correct"
                                      ? "success"
                                      : status === "Marks Given"
                                      ? "primary"
                                      : status === "Wrong"
                                      ? "danger"
                                      : "warning"
                                  }
                                >
                                  {status}
                                </Chip>
                              </TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </motion.div>
            </CardHeader>
          </Card>
        </motion.div>
      </MotionConfig>
      <ToastContainer />
    </AnimatePresence>
  );
}

export default MarksPage;
