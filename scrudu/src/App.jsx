import { useState, useEffect, useCallback } from 'react';
import './App.css';

const translations = {
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

function QuestionCard({ question, studentAnswer, onAnswerChange, isSubmitted, showFeedback, score, feedbackText, language, onLanguageToggle }) {
  const t = translations[language];

  const handleAnswerChange = (e) => {
    onAnswerChange(question.id, e.target.value);
  };

  let answerInput;
  if (question.type === 'teacs_gairid') {
    answerInput = (
      <>
        <label htmlFor={question.id} className="text-lg font-medium text-gray-700">{t.yourAnswer}</label>
        <textarea
          id={question.id}
          className="text-xl mt-1 p-3 w-full rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          rows="6"
          value={studentAnswer || ''}
          onChange={handleAnswerChange}
          disabled={isSubmitted}
        ></textarea>
      </>
    );
  } else if (question.type === 'ilroghnach') {
    answerInput = (
      <>
        <label htmlFor={question.id} className="text-lg font-medium text-gray-700">{t.yourAnswer}</label>
        <select
          id={question.id}
          className="mt-1 p-3 w-full rounded-md border border-gray-300 bg-white focus:ring-blue-500 focus:border-blue-500"
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
      </>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col gap-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-semibold">{t.question} {question.number}</h3>
        <button 
          onClick={() => onLanguageToggle(question.id)} 
          className="bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 hover:bg-slate-700 hover:scale-105 text-sm"
        >
          {language === 'en' ? 'Gaeilge' : 'English'}
        </button>
      </div>
      <div className="question-images flex justify-center">
        <img src={language === 'en' ? question.imageEnUrl : question.imageGaUrl} alt={`Question ${question.number} image`} className="rounded-lg shadow-inner max-w-full h-auto mb-4" />
      </div>
      {answerInput}

      <div className={`transition-all duration-500 ease-in-out overflow-hidden max-h-0 ${showFeedback ? 'max-h-[500px] p-6 mt-4' : ''} bg-gray-50 border border-gray-200 rounded-lg`}>
        <p className="font-bold text-lg mb-2 text-gray-800">{t.yourScore} <span className="text-green-600">{score}</span> / {question.maxMarks}</p>
        <p className="font-medium text-gray-800">{t.correctAnswer} <span className="text-green-600">{question.correctAnswer}</span></p>
        <p className="mt-2 text-gray-600">{t.feedback} <span>{feedbackText}</span></p>
      </div>
    </div>
  );
}

function App() {
  const [studentAnswers, setStudentAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [examQuestions, setExamQuestions] = useState([]);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [totalMaxMarks, setTotalMaxMarks] = useState(0);
  const [questionFeedback, setQuestionFeedback] = useState({});
  const [questionLanguages, setQuestionLanguages] = useState({});

  const t = translations['ga']; // Default UI language to Irish

  const toggleQuestionLanguage = (questionId) => {
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

    const questions = lines.slice(1).map(line => {
      const values = line.split('\t');
      const question = {};
      headers.forEach((header, i) => {
        question[header] = values[i];
      });
      return {
        id: question.Ceist_ID,
        number: question.ceist,
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
    setExamQuestions(questions);

    const initialLangs = {};
    questions.forEach(q => {
      initialLangs[q.id] = 'ga'; // Default all questions to Irish
    });
    setQuestionLanguages(initialLangs);

    setTotalMaxMarks(questions.reduce((sum, q) => sum + q.maxMarks, 0));
  }, []);

  useEffect(() => {
    loadExamData();
  }, [loadExamData]);

  const handleAnswerChange = (questionId, answer) => {
    setStudentAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: answer
    }));
  };

  const handleSubmit = () => {
    let score = 0;
    const newQuestionFeedback = {};

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
          feedbackText = 'The key concepts were not mentioned. ' + q.feedback[currentLanguage];
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
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 bg-gray-100">

      <header className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-6 mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-1">Teicneolaíocht Dhigiteach / Digital Technology</h1>
        <p className="text-lg text-slate-600">Aonad 1 2024 / Unit 1 2024</p>
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