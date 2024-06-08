import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.3.136/pdf.min.mjs`;
interface ExamModalProps {
  onAnswersChange: (answers: string) => void;
  selectedYear: string;
}

const options = ["A", "B", "C", "D"];

const ExamModal: React.FC<ExamModalProps> = ({
  onAnswersChange,
  selectedYear,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pdfLoading, setPdfLoading] = useState<boolean>(true);

  useEffect(() => {
    const answers = Object.entries(userAnswers)
      .map(([q, a]) => `${q} ${a}`)
      .join(" ");
    onAnswersChange(answers);
  }, [userAnswers, onAnswersChange]);

  const handleOptionClick = (question: number, option: string) => {
    setUserAnswers((prev) => ({ ...prev, [question]: option }));
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPdfLoading(false);
  };

  const changePage = (offset: number) => {
    setPageNumber((prevPage) => {
      const nextPage = prevPage + offset;
      return nextPage > 0 && nextPage <= numPages ? nextPage : prevPage;
    });
  };

  return (
    <>
      <Button onPress={onOpen} color="primary">
        Open Advanced
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        scrollBehavior="outside"
        className="dark min-w-[90%] "
      >
        <ModalContent>
          <ModalHeader>Exam Paper {selectedYear}</ModalHeader>
          <ModalBody>
            <div className="flex gap-4 flex-row  justify-evenly  ">
              <div className=" h-[70vh] flex flex-col  ">
                <div>
                  <embed
                    src={`http://localhost:3000/${selectedYear}.pdf#page=${pageNumber}`}
                    width={"900"}
                    height="600"
                  />
                </div>
                <div className="flex justify-between w-full mt-4"></div>
              </div>
              <div className=" h-[70vh] overflow-auto">
                <div className="grid grid-cols-1 gap-2 p-2 m-2">
                  {Array.from({ length: 100 }, (_, i) => i + 1).map((q) => (
                    <div key={q} className="mb-2">
                      <p className="font-semibold">{q}.</p>
                      <div className="flex space-x-2">
                        {options.map((opt) => (
                          <Button
                            key={opt}
                            size="sm"
                            color={
                              userAnswers[q] === opt ? "success" : "default"
                            }
                            onPress={() => handleOptionClick(q, opt)}
                          >
                            {opt}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
