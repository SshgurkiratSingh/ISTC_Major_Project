import React from "react";
import { Card, CardBody } from "@nextui-org/react";
import { FaCheckCircle, FaTimesCircle, FaQuestionCircle } from "react-icons/fa";

interface SubjectResultProps {
  subject: string;
  attempted: number;
  correct: number;
  wrong: number;
  marks: string;
}

const SubjectResultCard: React.FC<SubjectResultProps> = ({
  subject,
  attempted,
  correct,
  wrong,
  marks,
}) => {
  const totalQuestions = attempted + wrong; // Assuming wrong answers include unattempted as well

  return (
    <Card className="my-6 w-full bg-gradient-to-r from-black to-gray-900 shadow-2xl">
      <CardBody className="flex flex-col items-start text-white p-6 border border-gray-800 rounded-lg">
        <h4 className="font-extrabold text-2xl mb-4 text-neon-green tracking-wide">
          {subject}
        </h4>
        <div className="flex items-center mb-4">
          <FaQuestionCircle className="mr-3 text-neon-yellow" />
          <p className="text-xl">Attempted: {correct + wrong}</p>
        </div>
        <div className="flex items-center mb-4">
          <FaCheckCircle className="mr-3 text-neon-green" />
          <p className="text-xl">Correct: {correct}</p>
        </div>
        <div className="flex items-center mb-4">
          <FaTimesCircle className="mr-3 text-neon-red" />
          <p className="text-xl">Wrong: {wrong}</p>
        </div>
        <p className="text-xl mb-4">Marks: {marks}</p>

        <div className="mt-4 w-full bg-gray-700 rounded-full h-3">
          <div
            className="bg-neon-green h-3 rounded-full"
            style={{ width: `${(correct / 10) * 100}%` }}
          ></div>
        </div>
      </CardBody>
    </Card>
  );
};

export default SubjectResultCard;
