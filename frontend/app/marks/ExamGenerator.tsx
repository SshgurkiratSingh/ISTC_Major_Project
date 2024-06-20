"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Radio,
  RadioGroup,
} from "@nextui-org/react";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

interface Question {
  id: number;
  Question: string;
  Options: string[];
  Answer: string;
}

interface SubjectQuestions {
  [subject: string]: Question[];
}

interface AnswerState {
  [questionId: string]: string | null;
}

const subjectLocation: { [subject: string]: string[] } = {
  Math: ["Math12.json"],
  Physics: ["Physics11.json", "Physics12.json"],
  Electrical: ["Transformer.json", "DCmachine.json", "ElectricalMachine.json"],
  Electronics: ["analog.json", "Digital.json", "EDC.json"],
  Programming: ["C.json", "c++.json"],
  Mechanical: [
    "Thermodynamics.json",
    "Thermal.json",
    "Strength.json",
    "mech2.json",
  ],
  Civil: ["WasteWater.json", "Material.json", "Civil.json"],
  Chemical: ["Chemical.json", "Chemistry11.json", "Chemistry12.json"],
  Chemistry: ["Chemistry.json", "Heat.json"],
  EnglishAndAptitude: ["Engine.json", "MaterialScience.json", "FluidMech.json"],
};

export default function ExamGenerator() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [questions, setQuestions] = useState<SubjectQuestions>({});
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [showExplanations, setShowExplanations] = useState<{
    [questionId: string]: boolean;
  }>({});
  const [timeRemaining, setTimeRemaining] = useState(90 * 60); // 1.5 hours in seconds
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (isOpen) {
      generateExam();
      startTimer();
    }
  }, [isOpen]);

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining]);

  const generateExam = async () => {
    setLoading(true);
    const generatedQuestions: SubjectQuestions = {};

    for (const subject in subjectLocation) {
      generatedQuestions[subject] = [];
      for (const file of subjectLocation[subject]) {
        try {
          const response = await fetch(`/${file}`);
          const data: Question[] = await response.json();
          const randomQuestions = getRandomQuestions(data, 10);
          generatedQuestions[subject].push(...randomQuestions);
        } catch (error) {
          console.error(`Error loading questions from ${file}:`, error);
        }
      }

      while (generatedQuestions[subject].length < 10) {
        generatedQuestions[subject].push(
          generatePlaceholderQuestion(
            subject,
            generatedQuestions[subject].length + 1
          )
        );
      }

      generatedQuestions[subject] = generatedQuestions[subject].slice(0, 10);
    }

    setQuestions(generatedQuestions);
    setLoading(false);
  };

  const getRandomQuestions = (
    questions: Question[],
    count: number
  ): Question[] => {
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const generatePlaceholderQuestion = (
    subject: string,
    id: number
  ): Question => {
    return {
      id,
      Question: `Placeholder question for ${subject}`,
      Options: ["Option A", "Option B", "Option C", "Option D"],
      Answer:
        "Answer: Placeholder\nExplanation: This is a placeholder question.",
    };
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    setShowExplanations((prev) => ({ ...prev, [questionId]: true }));

    const [subject, index] = questionId.split("-");
    const question = questions[subject][parseInt(index)];
    const correctAnswer = question.Answer.match(regex)?.[1];
    console.log(correctAnswer + " " + answer);
    if (answer === correctAnswer) {
      setScore((prev) => prev + 1);
    } else {
      setScore((prev) => prev - 0.25);
    }
  };
  const regex = /Answer: (\w)/;

  const startTimer = () => {
    setTimeRemaining(90 * 60);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const renderMath = (text: string) => {
    const regex = /\$(.*?)\$/g;
    const parts = text.split(regex);
    return parts.map((part, index) =>
      index % 2 === 0 ? part : <InlineMath key={index} math={part} />
    );
  };

  return (
    <>
      <Button onPress={onOpen} color="primary">
        Open Exam Generator
      </Button>

      <Modal
        isOpen={false}
        onClose={onClose}
        scrollBehavior="outside"
        className="dark min-w-[90%] max-h-[100%] bg-gradient-to-tr from-red-700 to-blue-800 overflow-auto"
        backdrop="blur"
      >
        <ModalContent>
          <ModalHeader className="flex justify-between items-center">
            <span>Exam Generator</span>
            <span>Time Remaining: {formatTime(timeRemaining)}</span>
          </ModalHeader>
          <ModalBody className="flex relative">
            <div className="w-full pr-4">
              {loading ? (
                <p>Loading questions...</p>
              ) : (
                Object.entries(questions).map(([subject, subjectQuestions]) => (
                  <div key={subject}>
                    <h2 className="text-xl font-bold mt-4 mb-2">{subject}</h2>
                    {subjectQuestions.map((question, index) => (
                      <div key={`${subject}-${index}`} className="mb-4">
                        <p className="font-semibold">
                          {renderMath(`${index + 1}. ${question.Question}`)}
                        </p>
                        <RadioGroup
                          onChange={(e) =>
                            handleAnswerChange(
                              `${subject}-${index}`,
                              e.target.value
                            )
                          }
                          value={answers[`${subject}-${index}`] || ""}
                        >
                          {question.Options.map((option, optionIndex) => (
                            <Radio
                              key={optionIndex}
                              value={
                                optionIndex == 0
                                  ? "a"
                                  : optionIndex == 1
                                  ? "b"
                                  : optionIndex == 2
                                  ? "c"
                                  : "d"
                              }
                            >
                              {renderMath(option)}
                            </Radio>
                          ))}
                        </RadioGroup>
                        {showExplanations[`${subject}-${index}`] && (
                          <p className="mt-2">
                            <p>{question.Answer.match(regex)?.[0]}</p>
                            <strong>Explanation:</strong>{" "}
                            {renderMath(
                              question.Answer.split("\n")[1].replace(
                                "Explanation: ",
                                ""
                              )
                            )}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
            <div className="absolute top-0 right-0 w-1/4 p-4 bg-gray-800 rounded-lg shadow-lg">
              <h3 className="text-lg font-bold mb-2">Score</h3>
              <p>{score.toFixed(2)} / 100</p>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Close
            </Button>
            <Button color="primary" onPress={generateExam}>
              Regenerate Exam
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
