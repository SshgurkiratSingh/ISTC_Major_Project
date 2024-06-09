import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Chip,
} from "@nextui-org/react";
import { Document, Page, pdfjs } from "react-pdf";
import { AnswerResult } from "./MarksPage";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.3.136/pdf.min.mjs`;

interface ExamModalProps {
  onAnswersChange: (answers: string) => void;
  selectedYear: string;
  correctAnswers: string;
  userInput: string;
}

const options = ["A", "B", "C", "D"];

const ExamModal: React.FC<ExamModalProps> = ({
  onAnswersChange,
  selectedYear,
  correctAnswers,
  userInput,
}) => {
  const parseAnswers = (input: string) => {
    const answers: { [key: number]: string } = {};
    const parts = input.trim().split(/\s+/);
    for (let i = 0; i < parts.length; i += 2) {
      const questionNumber = parseInt(parts[i], 10);
      if (!isNaN(questionNumber)) {
        const answer = parts[i + 1]?.toLowerCase().trim() || ""; // Use optional chaining to handle undefined
        answers[questionNumber] = answer;
      }
    }
    return answers;
  };

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>(
    parseAnswers(userInput)
  );
  const [visible, setVisible] = useState(false);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pdfLoading, setPdfLoading] = useState<boolean>(true);
  const [modalUserInput, setModalUserInput] = useState("");
  const [examResult, setExamResult] = useState<AnswerResult>({
    attempted: 0,
    correct: 0,
    wrong: 0,
    marks: "0.00",
    xCount: 0,
    detailedCheck: {},
  });
  const [answersChecked, setAnswersChecked] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setModalUserInput(
        Object.entries(parseAnswers(userInput))
          .map(([q, a]) => `${q} ${a}`)
          .join(" ")
      );
    }
  }, [isOpen, userInput]);

  const handleOptionClick = (question: number, option: string) => {
    const newAnswers = { ...userAnswers, [question]: option };
    setUserAnswers(newAnswers);
    const answers = Object.entries(newAnswers)
      .map(([q, a]) => `${q} ${a}`)
      .join(" ");
    onAnswersChange(answers);

    const correctAnswer = parseAnswers(correctAnswers)[question];
    if (correctAnswer) {
      let status = "";
      let marksImpact = "";
      if (correctAnswer === "x") {
        status = "Marks Given";
        marksImpact = "+1";
      } else if (option.toLowerCase() === correctAnswer) {
        status = "Correct";
        marksImpact = "+1";
      } else {
        status = "Wrong";
        marksImpact = "-0.25";
      }

      setExamResult((prev) => ({
        ...prev,
        detailedCheck: {
          ...prev.detailedCheck,
          [question]: {
            correctAnswer,
            userAnswer: option,
            status,
            marksImpact,
          },
        },
      }));
    }
  };

  const handleCheckAnswer = () => {
    const correctAnswersObj = parseAnswers(correctAnswers);

    let attempted = 0,
      correct = 0,
      wrong = 0,
      marks = 0,
      xCount = 0;
    const newDetailedCheck: AnswerResult["detailedCheck"] = {};

    for (const [questionNumberStr, correctAnswer] of Object.entries(
      correctAnswersObj
    )) {
      const questionNumber = parseInt(questionNumberStr, 10);
      const userAnswer = userAnswers[questionNumber] || "";

      let status = "Not Attempted";
      let marksImpact = "";

      if (userAnswer) {
        attempted++;
        if (correctAnswer === "x") {
          status = "Marks Given";
          marksImpact = "+1";
          xCount++;
          marks += 1;
        } else if (userAnswer.toLowerCase() === correctAnswer) {
          status = "Correct";
          marksImpact = "+1";
          correct++;
          marks += 1;
        } else {
          status = "Wrong";
          marksImpact = "-0.25";
          wrong++;
          marks -= 0.25;
        }
      }

      newDetailedCheck[questionNumber] = {
        correctAnswer,
        userAnswer,
        status,
        marksImpact,
      };
    }

    const newExamResult: AnswerResult = {
      attempted,
      correct,
      wrong,
      marks: marks.toFixed(2),
      xCount,
      detailedCheck: newDetailedCheck,
    };
    setExamResult(newExamResult);
    setAnswersChecked(true);
  };

  return (
    <>
      <Button onPress={onOpen} color="primary">
        Open Advanced Examinator
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        scrollBehavior="outside"
        className="dark min-w-[90%] max-h-[100%] bg-gradient-to-tr from-neutral-400/90 overflow-auto "
        backdrop="blur"
      >
        <ModalContent>
          <ModalHeader>Exam Paper {selectedYear}</ModalHeader>
          <ModalBody>
            <div className="flex gap-4 flex-row justify-evenly">
              <div className="h-[70vh] flex flex-col ">
                {window.innerWidth > 768 && (
                  <div>
                    <embed
                      src={`http://localhost:3000/${selectedYear}.pdf#page=${2}`}
                      width="900"
                      height="600"
                    />
                  </div>
                )}
                <div className="flex justify-between w-full mt-4"></div>
              </div>
              <div className="h-[70vh] overflow-auto">
                <div className="grid grid-cols-1 gap-2 p-2 m-2">
                  {Array.from({ length: 100 }, (_, i) => i + 1).map((q) => {
                    const answerDetail = examResult.detailedCheck[q] || {
                      status: "Not Attempted",
                      correctAnswer: "",
                      userAnswer: "",
                      marksImpact: "",
                    };
                    const statusColor =
                      answerDetail.status === "Correct"
                        ? "success"
                        : answerDetail.status === "Marks Given"
                        ? "primary"
                        : answerDetail.status === "Wrong"
                        ? "danger"
                        : "warning";

                    return (
                      <div key={q} className="mb-2 p-2 bg-gray-800 rounded-md">
                        <div className="flex items-center mb-1">
                          <p className="font-semibold mr-2">{q}.</p>
                          {answersChecked && (
                            <Chip color={statusColor} size="sm">
                              {answerDetail.status}
                            </Chip>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          {options.map((opt) => (
                            <Button
                              key={opt}
                              size="sm"
                              color={
                                userAnswers[q] === opt
                                  ? answersChecked
                                    ? statusColor
                                    : "secondary"
                                  : "default"
                              }
                              onPress={() => handleOptionClick(q, opt)}
                            >
                              {opt}
                            </Button>
                          ))}
                        </div>
                        {answersChecked &&
                          answerDetail.status !== "Not Attempted" && (
                            <div className="mt-2 text-sm">
                              <p>
                                Correct:{" "}
                                <span className="font-bold">
                                  {answerDetail.correctAnswer.toUpperCase()}
                                </span>
                                , Your:{" "}
                                <span className="font-bold">
                                  {answerDetail.userAnswer.toUpperCase()}
                                </span>
                              </p>
                              {answerDetail.marksImpact && (
                                <p
                                  className={`${
                                    answerDetail.marksImpact.startsWith("+")
                                      ? "text-green-500"
                                      : "text-red-500"
                                  } font-bold`}
                                >
                                  {answerDetail.marksImpact}
                                </p>
                              )}
                            </div>
                          )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <Button
              color="primary"
              onPress={handleCheckAnswer}
              className="mt-4 w-full"
            >
              Check Answers
            </Button>
            {examResult.attempted > 0 && (
              <div className="mt-4 p-4 bg-gradient-to-r from-gray-700 via-gray-900 to-black rounded-lg text-white">
                <p>Attempted: {examResult.attempted}</p>
                <p>Correct: {examResult.correct}</p>
                <p>Wrong: {examResult.wrong}</p>
                <p>Marks: {examResult.marks}</p>
                <p>X Count: {examResult.xCount}</p>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="danger" onPress={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ExamModal;
