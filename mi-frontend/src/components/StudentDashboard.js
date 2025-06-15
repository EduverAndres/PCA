import { useState, useEffect } from 'react';

function StudentDashboard({ user, onLogout }) {
  const [assignments, setAssignments] = useState([]);
  const [currentExam, setCurrentExam] = useState(null);
  const [currentAttempt, setCurrentAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(3600);
  const [examStarted, setExamStarted] = useState(false);
  const [examResult, setExamResult] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar asignaciones del estudiante
  useEffect(() => {
    fetchStudentAssignments();
    // eslint-disable-next-line
  }, []);

  const fetchStudentAssignments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/exams/student/${user.id}`);
      const data = await response.json();

      if (data.success) {
        setAssignments(data.assignments);

        // Verificar si hay un examen pendiente o en progreso
        const pendingExam = data.assignments.find(
          assignment => assignment.status === 'pending' || assignment.status === 'in_progress'
        );
        if (pendingExam) {
          setCurrentExam(pendingExam.exam);
          if (pendingExam.status === 'in_progress') {
            startExam(pendingExam.id);
          }
        }

        // Verificar si hay resultados para mostrar
        const completedExam = data.assignments.find(
          assignment => assignment.status === 'completed' && !assignment.feedback_shown
        );
        if (completedExam && completedExam.result) {
          setExamResult(completedExam.result);
        }
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const startExam = async (assignmentId) => {
    try {
      const response = await fetch(`http://localhost:3000/exams/start/${assignmentId}/student/${user.id}`, {
        method: 'POST'
      });
      const data = await response.json();

      if (data.success) {
        setCurrentAttempt(data.attempt);
        setQuestions(data.questions);
        setExamStarted(true);
        setTimeLeft(data.attempt?.time_left ?? (data.exam?.duration_minutes ?? 60) * 60);
      } else {
        alert('Error al iniciar el examen: ' + data.message);
      }
    } catch (error) {
      console.error('Error starting exam:', error);
      alert('Error de conexión al iniciar el examen');
    }
  };

  const handleStartExam = () => {
    const pendingAssignment = assignments.find(
      assignment => assignment.exam.id === currentExam.id
    );
    if (pendingAssignment) {
      startExam(pendingAssignment.id);
    }
  };

  // Timer del examen
  useEffect(() => {
    if (examStarted && timeLeft > 0 && !examResult) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !examResult) {
      handleSubmitExam();
    }
    // eslint-disable-next-line
  }, [timeLeft, examStarted, examResult]);

  const handleSubmitExam = async () => {
    try {
      const submissionData = {
        attemptId: currentAttempt.id,
        answers: Object.keys(answers).map(questionId => ({
          questionId: parseInt(questionId),
          selectedOption: answers[questionId]
        }))
      };

      const response = await fetch('http://localhost:3000/exams/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData)
      });

      const data = await response.json();

      if (data.success) {
        setExamResult(data.result);
        setExamStarted(false);
      } else {
        alert('Error al enviar el examen: ' + data.message);
      }
    } catch (error) {
      console.error('Error submitting exam:', error);
      alert('Error de conexión al enviar el examen');
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId, answerKey) => {
    setAnswers({
      ...answers,
      [questionId]: answerKey
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando exámenes...</p>
        </div>
      </div>
    );
  }

  // Mostrar resultado del examen con feedback de IA
  if (examResult) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Resultado del Examen</h1>
                <p className="text-gray-600">Estudiante: {user?.username}</p>
              </div>
              <button
                onClick={onLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>

          {/* Resultado y estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className={`text-4xl font-bold mb-2 ${
                examResult.score >= 70 ? 'text-green-600' : 
                examResult.score >= 50 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {examResult.score.toFixed(1)}%
              </div>
              <p className="text-gray-600">Puntuación Final</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {examResult.correctAnswers}/{examResult.totalQuestions}
              </div>
              <p className="text-gray-600">Respuestas Correctas</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className={`text-2xl font-bold mb-2 ${
                examResult.score >= 70 ? 'text-green-600' : 'text-red-600'
              }`}>
                {examResult.score >= 70 ? '✅ APROBADO' : '❌ REPROBADO'}
              </div>
              <p className="text-gray-600">Estado</p>
            </div>
          </div>

          {/* Feedback de IA */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🤖 Feedback Personalizado</h3>
            <div className="prose max-w-none">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <div className="whitespace-pre-line text-gray-700">
                  {examResult.feedback}
                </div>
              </div>
            </div>
          </div>

          {/* Análisis de temas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Temas fuertes */}
            {examResult.strongTopics && examResult.strongTopics.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h4 className="text-lg font-semibold text-green-800 mb-4">💪 Temas Dominados</h4>
                <div className="space-y-2">
                  {examResult.strongTopics.map((topic, index) => (
                    <div key={index} className="flex items-center bg-green-50 p-3 rounded-lg">
                      <span className="text-green-600 mr-2">✅</span>
                      <span className="text-green-800 font-medium">{topic}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Temas débiles */}
            {examResult.weakTopics && examResult.weakTopics.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h4 className="text-lg font-semibold text-red-800 mb-4">📚 Temas a Reforzar</h4>
                <div className="space-y-2">
                  {examResult.weakTopics.map((topic, index) => (
                    <div key={index} className="flex items-center bg-red-50 p-3 rounded-lg">
                      <span className="text-red-600 mr-2">⚠️</span>
                      <span className="text-red-800 font-medium">{topic}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Botón para continuar */}
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600 mb-4">
              Revisa el feedback y las recomendaciones para mejorar tu rendimiento en futuros exámenes.
            </p>
            <button
              onClick={() => {
                setExamResult(null);
                setCurrentExam(null);
                fetchStudentAssignments();
              }}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Si hay un examen pendiente, forzar al estudiante a tomarlo
  if (currentExam && !examStarted) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Examen Pendiente</h1>
                <p className="text-gray-600">Estudiante: {user?.username}</p>
              </div>
              <button
                onClick={onLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>

          {/* Información del examen obligatorio */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Tienes un Examen Pendiente</h2>
              <p className="text-red-600 font-medium">Debes completar este examen para continuar</p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-bold text-red-800 mb-4">{currentExam.title}</h3>
              <div className="space-y-2 text-red-700">
                <p><strong>Descripción:</strong> {currentExam.description || 'Sin descripción'}</p>
                <p><strong>Número de preguntas:</strong> {currentExam.num_questions}</p>
                <p><strong>Duración:</strong> {currentExam.duration_minutes} minutos</p>
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 mb-8">
              <h4 className="text-lg font-semibold text-yellow-800 mb-4">📋 Instrucciones Importantes:</h4>
              <ul className="space-y-2 text-yellow-700">
                <li className="flex items-start">
                  <span className="font-bold mr-2">•</span>
                  <span>Una vez que inicies el examen, <strong>no podrás salir</strong> hasta completarlo</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">•</span>
                  <span>El tiempo es limitado y se cuenta automáticamente</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">•</span>
                  <span>Asegúrate de tener una conexión estable a internet</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">•</span>
                  <span>El examen se enviará automáticamente al finalizar el tiempo</span>
                </li>
              </ul>
            </div>

            <div className="text-center">
              <button
                onClick={handleStartExam}
                className="bg-red-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-red-600 transition-colors shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Iniciar Examen Ahora
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla del examen en progreso
  if (examStarted && questions.length > 0) {
    const currentQ = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header con timer */}
        <div className="bg-white shadow-sm border-b border-gray-200 p-4">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-gray-800">{currentExam.title}</h1>
              <p className="text-gray-600">Estudiante: {user?.username}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`px-4 py-2 rounded-lg font-bold ${timeLeft < 300 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                ⏰ {formatTime(timeLeft)}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-6">
          {/* Barra de progreso */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-gray-600">
                Pregunta {currentQuestion + 1} de {questions.length}
              </span>
              <span className="text-sm text-gray-500">{progress.toFixed(0)}% completado</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Pregunta actual */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {currentQ.question_text}
            </h2>

            <div className="space-y-4">
              {[
                { key: 'A', text: currentQ.option_a },
                { key: 'B', text: currentQ.option_b },
                { key: 'C', text: currentQ.option_c },
                { key: 'D', text: currentQ.option_d }
              ].map((option) => (
                <label
                  key={option.key}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                    answers[currentQ.id] === option.key
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQ.id}`}
                    value={option.key}
                    checked={answers[currentQ.id] === option.key}
                    onChange={() => handleAnswerChange(currentQ.id, option.key)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 border-2 rounded-full mr-4 flex items-center justify-center ${
                    answers[currentQ.id] === option.key
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-300'
                  }`}>
                    {answers[currentQ.id] === option.key && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <span className="text-lg text-gray-700">{option.key}. {option.text}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Navegación */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestion === 0}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  currentQuestion === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-500 text-white hover:bg-gray-600'
                }`}
              >
                ← Anterior
              </button>

              <div className="text-center">
                <p className="text-gray-600 mb-2">
                  Respondidas: {Object.keys(answers).length} / {questions.length}
                </p>
                {Object.keys(answers).length === questions.length && (
                  <button
                    onClick={handleSubmitExam}
                    className="bg-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                  >
                    ✓ Enviar Examen
                  </button>
                )}
              </div>

              {currentQuestion < questions.length - 1 ? (
                <button
                  onClick={handleNextQuestion}
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                >
                  Siguiente →
                </button>
              ) : (
                <div className="w-24"></div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No hay exámenes asignados
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Panel del Estudiante</h1>
              <p className="text-gray-600">Estudiante: {user?.username}</p>
            </div>
            <button
              onClick={onLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Sin exámenes */}
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No hay exámenes disponibles</h2>
          <p className="text-gray-600 mb-4">
            Actualmente no tienes exámenes asignados. Tu profesor te notificará cuando haya nuevos exámenes disponibles.
          </p>
          <button
            onClick={fetchStudentAssignments}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Actualizar
          </button>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;