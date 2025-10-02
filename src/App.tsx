import { useState, useEffect, useCallback } from 'react';
import type { FC } from 'react';
import styles from './App.module.css';
import clsx from 'clsx';

interface Question {
  id: string;
  number: string;
  focheist: string;
  type: string;
  imageEnUrl: string;
  imageGaUrl: string;
  extractedTextEn: string;
  extractedTextGa: string;
  correctAnswer: string;
  maxMarks: number;
  feedback: {
    en: string;
    ga: string;
  };
}

interface Translations {
  [key: string]: {
    title: string;
    subtitle: string;
    languageToggle: string;
    question: string;
    selectOption: string;
    yourAnswer: string;
    yourScore: string;
    correctAnswer: string;
    feedback: string;
    submitAnswers: string;
    showCorrectAnswers: string;
    hideAnswers: string;
    examSubmitted: string;
    outOf: string;
  };
}

const translations: Translations = {
  en: {
    title: "Digital Technology",
    subtitle: "Unit 1 2024",
    languageToggle: "Gaeilge",
    question: "Question",
    selectOption: "Select an option",
    yourAnswer: "Your Answer:",
    yourScore: "Your Score:",
    correctAnswer: "Correct Answer:",
    feedback: "Feedback:",
    submitAnswers: "Submit Answers",
    showCorrectAnswers: "Show Correct Answers",
    hideAnswers: "Hide Answers",
    examSubmitted: "Exam submitted! Your score is",
    outOf: "out of"
  },
  ga: {
    title: "Teicneolaíocht Dhigiteach",
    subtitle: "Aonad 1 2024",
    languageToggle: "English",
    question: "Ceist",
    selectOption: "Roghnaigh Freagra",
    yourAnswer: "Do Freagra:",
    yourScore: "Do Scór:",
    correctAnswer: "Freagra Ceart:",
    feedback: "Aiseolas:",
    submitAnswers: "Freagraí a sheoladh",
    showCorrectAnswers: "Taispeáin Freagraí Cearta",
    hideAnswers: "Folaigh Freagraí",
    examSubmitted: "Scrúdú curtha isteach! Is é do scór ná",
    outOf: "as"
  }
};

const CheckIcon: FC = () => (
  <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon: FC = () => (
  <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

interface QuestionCardProps {
  question: Question;
  studentAnswer: string;
  onAnswerChange: (questionId: string, answer: string) => void;
  isSubmitted: boolean;
  showFeedback: boolean;
  score: number;
  feedbackText: string;
  language: string;
  onLanguageToggle: (questionId: string) => void;
}

const QuestionCard: FC<QuestionCardProps> = ({ question, studentAnswer, onAnswerChange, isSubmitted, showFeedback, score, feedbackText, language, onLanguageToggle }) => {
  const t = translations[language];

  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>) => {
    onAnswerChange(question.id, e.target.value);
  };

  const isCorrect = score > 0;

  const baseInputClass = "text-xl mt-1 p-3 w-full rounded-md border-2";

  let answerInput;
  if (question.type === 'teacs_gairid') {
    answerInput = (
      <div className="relative">
        <label htmlFor={question.id} className="text-lg font-medium text-gray-700">{t.yourAnswer}</label>
        <textarea
          id={question.id}
          className="text-xl mt-1 p-3 w-full rounded-md border-2 border-green-500"
          rows={6}
          value={studentAnswer || ''}
          onChange={handleAnswerChange}
          disabled={isSubmitted}
        ></textarea>
        {isSubmitted && (
          <div className="absolute top-1/2 right-3 transform -translate-y-1/2 pointer-events-none">
            {isCorrect ? <CheckIcon /> : <XIcon />}
          </div>
        )}
      </div>
    );
  } else if (question.type === 'ilroghnach') {
    answerInput = (
      <div className="relative">
        <label htmlFor={question.id} className="text-lg font-medium text-gray-700">{t.yourAnswer}</label>
        <select
          id={question.id}
          className={clsx(
            baseInputClass,
            'bg-white',
            {
              'border-green-500 ring-green-500': isSubmitted && isCorrect,
              'border-red-500 ring-red-500': isSubmitted && !isCorrect,
              'border-gray-300 focus:ring-blue-500 focus:border-blue-500': !isSubmitted
            }
          )}
          value={studentAnswer || ''}
          onChange={handleAnswerChange}
          disabled={isSubmitted}
        >
          <option value="">{t.selectOption}</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
        </select>
        {isSubmitted && (
          <div className="absolute top-1/2 right-3 transform -translate-y-1/2 pointer-events-none">
            {isCorrect ? <CheckIcon /> : <XIcon />}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col items-center gap-4">
      <div className="flex justify-between items-center mb-2 w-full">
        <h3 className="text-xl font-semibold">{t.question} {question.number}{question.focheist ? `(${question.focheist})` : ''}</h3>
        <button 
          onClick={() => onLanguageToggle(question.id)} 
          className="bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 hover:bg-slate-700 hover:scale-105 text-sm"
        >
          {language === 'en' ? 'Gaeilge' : 'English'}
        </button>
      </div>
      <div className="w-fit">
        <div className="question-images flex justify-center">
          <img src={language === 'en' ? question.imageEnUrl : question.imageGaUrl} alt={`Question ${question.number} image`} className="rounded-lg shadow-inner max-w-full h-auto mb-4" />
        </div>
        {answerInput}
      </div>

      <div
        className={clsx(
          styles.feedbackBlock,
          showFeedback && styles.showFeedback,
          isSubmitted && isCorrect && styles.correct,
          isSubmitted && !isCorrect && styles.incorrect
        )}
      >
        <p className="font-bold text-lg mb-2 text-gray-800">{t.yourScore} <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>{score}</span> / {question.maxMarks}</p>
        <p className="font-medium text-gray-800">{t.correctAnswer} <span className="text-green-600">{question.correctAnswer}</span></p>
        <p className="mt-2 text-gray-600">{t.feedback} <span>{feedbackText}</span></p>
      </div>
    </div>
  );
}

function App() {
  const [studentAnswers, setStudentAnswers] = useState<{ [key: string]: string }>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState<boolean>(false);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [totalMaxMarks, setTotalMaxMarks] = useState<number>(0);
  const [questionFeedback, setQuestionFeedback] = useState<{ [key: string]: { score: number; feedbackText: string } }>({});
  const [questionLanguages, setQuestionLanguages] = useState<{ [key: string]: string }>({});

  const t = translations['ga']; // Default UI language to Irish

  const toggleQuestionLanguage = (questionId: string) => {
    setQuestionLanguages(prev => ({
      ...prev,
      [questionId]: prev[questionId] === 'en' ? 'ga' : 'en'
    }));
  };

  const loadExamData = useCallback(async () => {
    const response = await fetch('/Scruduithe.tsv');
    const tsvData = await response.text();
    const lines = tsvData.split('\r\n');
    const headers = lines[0].split('\t');

    const questions: Question[] = lines.slice(1).map(line => {
      const values = line.split('\t');
      const question: { [key: string]: string } = {};
      headers.forEach((header, i) => {
        question[header] = values[i];
      });
      return {
        id: question.Ceist_ID,
        number: question.ceist,
        focheist: question.focheist,
        type: question.cineal_ceist,
        imageEnUrl: '/scruduithe_images/' + question.snip_Bearla,
        imageGaUrl: '/scruduithe_images/' + question.snip_Gaeilge,
        extractedTextEn: question.ocr_Bearla,
        extractedTextGa: question.ocr_Gaeilge,
        correctAnswer: question.freagra_ceart,
        maxMarks: parseInt(question.marc_ar_fail, 10),
        feedback: {
          en: question.ocr_freagra,
          ga: question.ocr_freagra
        }
      };
    }).filter(q => q.id && q.maxMarks > 0);

    // Sort questions by number (numeric) and focheist (alphabetical)
    questions.sort((a, b) => {
      // Compare number as integer
      const numA = parseInt(a.number, 10);
      const numB = parseInt(b.number, 10);
      if (numA !== numB) return numA - numB;
      // Compare focheist alphabetically (handles i, ii, a, b, etc)
      if (a.focheist && b.focheist) {
        return a.focheist.localeCompare(b.focheist, undefined, { numeric: true });
      } else if (a.focheist) {
        return -1;
      } else if (b.focheist) {
        return 1;
      } else {
        return 0;
      }
    });

    setExamQuestions(questions);

    const initialLangs: { [key: string]: string } = {};
    questions.forEach(q => {
      initialLangs[q.id] = 'ga'; // Default all questions to Irish
    });
    setQuestionLanguages(initialLangs);

    setTotalMaxMarks(questions.reduce((sum, q) => sum + q.maxMarks, 0));
  }, []);

  useEffect(() => {
    loadExamData();
  }, [loadExamData]);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setStudentAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: answer
    }));
  };

  const handleSubmit = () => {
    let score = 0;
    const newQuestionFeedback: { [key: string]: { score: number; feedbackText: string } } = {};

    examQuestions.forEach(q => {
      const studentAns = studentAnswers[q.id];
      const currentLanguage = questionLanguages[q.id] || 'ga';
      let marks = 0;
      let feedbackText = '';

      if (q.type === 'ilroghnach') {
        marks = (studentAns === q.correctAnswer) ? q.maxMarks : 0;
        feedbackText = marks > 0 ? 'Correct!' : 'Incorrect.';
      } else if (q.type === 'teacs_gairid') {
        const studentLower = (studentAns || '').toLowerCase();
        const correctLower = (q.correctAnswer || '').toLowerCase();
        if (studentLower.includes(correctLower)) {
          marks = q.maxMarks;
          feedbackText = 'Great job! Full marks awarded.';
        } else {
          marks = 0;
          feedbackText = 'The key concepts were not mentioned. ' + q.feedback[currentLanguage as 'en' | 'ga'];
        }
      }
      score += marks;
      newQuestionFeedback[q.id] = { score: marks, feedbackText };
    });

    setTotalScore(score);
    setQuestionFeedback(newQuestionFeedback);
    setIsSubmitted(true);
    setShowCorrectAnswers(true);
  };

  const toggleShowAnswers = () => {
    setShowCorrectAnswers(prev => !prev);
  };

  return (
    <div className={styles.container}>
      <header>
        <h1 className={styles.title}>Teicneolaíocht Dhigiteach / Digital Technology</h1>
        <p>Aonad 1 2024 / Unit 1 2024</p>
      </header>

      <main id="exam-container" className="w-full max-w-4xl flex flex-col gap-6">
        {examQuestions.map(q => (
          <QuestionCard
            key={q.id}
            question={q}
            studentAnswer={studentAnswers[q.id]}
            onAnswerChange={handleAnswerChange}
            isSubmitted={isSubmitted}
            showFeedback={showCorrectAnswers}
            score={questionFeedback[q.id]?.score}
            feedbackText={questionFeedback[q.id]?.feedbackText}
            language={questionLanguages[q.id] || 'ga'}
            onLanguageToggle={toggleQuestionLanguage}
          />
        ))}
      </main>

      <div className="w-full max-w-4xl flex flex-col items-center mt-8 gap-4">
        {!isSubmitted && (
          <button
            id="submit-btn"
            className="w-full md:w-1/2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105 duration-300"
            onClick={handleSubmit}
          >
            {translations.ga.submitAnswers} / {translations.en.submitAnswers}
          </button>
        )}
        {isSubmitted && (
          <>
            <div id="result-message" className="p-4 rounded-lg bg-green-100 text-green-700 font-semibold w-full md:w-1/2 text-center">
              {t.examSubmitted} {totalScore} {t.outOf} {totalMaxMarks}.
            </div>
            <button
              id="show-answers-btn"
              className="w-full md:w-1/2 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105 duration-300"
              onClick={toggleShowAnswers}
            >
              {translations.ga.showCorrectAnswers} / {translations.en.showCorrectAnswers}
            </button>
          </>
        )}
      </div>

    </div>
  );
}

export default App;