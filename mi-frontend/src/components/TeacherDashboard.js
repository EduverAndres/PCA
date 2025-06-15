// src/components/TeacherDashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TeacherDashboard.css';

const TeacherDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('exams');
  const [exams, setExams] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Estados para crear examen
  const [examForm, setExamForm] = useState({
    title: '',
    description: '',
    specifications: '',
    numQuestions: 10,
    durationMinutes: 60
  });

  // Estados para examen desde PDF
  const [pdfForm, setPdfForm] = useState({
    title: '',
    description: '',
    numQuestions: 10,
    specifications: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);

  // Estados para asignar examen
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [dueDate, setDueDate] = useState('');

  // Estados para enviar material
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [materialMessage, setMaterialMessage] = useState('');
  const [selectedStudentsForMaterial, setSelectedStudentsForMaterial] = useState([]);

  // Estados para subir material
  const [materialForm, setMaterialForm] = useState({
    title: '',
    description: ''
  });
  const [materialFile, setMaterialFile] = useState(null);

  // Estados para resultados
  const [examResults, setExamResults] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [examsRes, materialsRes, studentsRes] = await Promise.all([
        axios.get('/api/exams/teacher', config),
        axios.get('/api/exams/materials/teacher', config),
        axios.get('/api/users/students', config)
      ]);

      setExams(examsRes.data);
      setMaterials(materialsRes.data);
      setStudents(studentsRes.data);
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  // CREAR EXAMEN CON ESPECIFICACIONES
  const handleCreateExam = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      await axios.post('/api/exams/create', examForm, config);
      
      alert('Examen creado exitosamente con IA!');
      setExamForm({
        title: '',
        description: '',
        specifications: '',
        numQuestions: 10,
        durationMinutes: 60
      });
      loadData();
    } catch (error) {
      console.error('Error creando examen:', error);
      alert('Error al crear el examen');
    } finally {
      setLoading(false);
    }
  };

  // CREAR EXAMEN DESDE PDF
  const handleCreateExamFromPDF = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Por favor selecciona un archivo PDF');
      return;
    }

    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('pdf', selectedFile);
      formData.append('title', pdfForm.title);
      formData.append('description', pdfForm.description);
      formData.append('numQuestions', pdfForm.numQuestions.toString());
      formData.append('specifications', pdfForm.specifications);

      const config = { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        } 
      };

      await axios.post('/api/exams/create-from-pdf', formData, config);
      
      alert('Examen creado exitosamente desde PDF!');
      setPdfForm({
        title: '',
        description: '',
        numQuestions: 10,
        specifications: ''
      });
      setSelectedFile(null);
      loadData();
    } catch (error) {
      console.error('Error creando examen desde PDF:', error);
      alert('Error al crear el examen desde PDF');
    } finally {
      setLoading(false);
    }
  };

  // ASIGNAR EXAMEN
  const handleAssignExam = async () => {
    if (!selectedExam || selectedStudents.length === 0) {
      alert('Selecciona un examen y al menos un estudiante');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      await axios.post(`/api/exams/${selectedExam}/assign`, {
        studentIds: selectedStudents,
        dueDate: dueDate || undefined
      }, config);

      alert('Examen asignado exitosamente!');
      setSelectedExam(null);
      setSelectedStudents([]);
      setDueDate('');
      loadData();
    } catch (error) {
      console.error('Error asignando examen:', error);
      alert('Error al asignar el examen');
    }
  };

  // SUBIR MATERIAL
  const handleUploadMaterial = async (e) => {
    e.preventDefault();
    if (!materialFile) {
      alert('Por favor selecciona un archivo');
      return;
    }

    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', materialFile);
      formData.append('title', materialForm.title);
      formData.append('description', materialForm.description);

      const config = { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        } 
      };

      await axios.post('/api/exams/materials/upload', formData, config);
      
      alert('Material subido exitosamente!');
      setMaterialForm({ title: '', description: '' });
      setMaterialFile(null);
      loadData();
    } catch (error) {
      console.error('Error subiendo material:', error);
      alert('Error al subir el material');
    } finally {
      setLoading(false);
    }
  };

  // ENVIAR MATERIAL A ESTUDIANTES
  const handleSendMaterial = async () => {
    if (!selectedMaterial || selectedStudentsForMaterial.length === 0) {
      alert('Selecciona un material y al menos un estudiante');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      await axios.post(`/api/exams/materials/${selectedMaterial}/send`, {
        studentIds: selectedStudentsForMaterial,
        message: materialMessage
      }, config);

      alert('Material enviado exitosamente!');
      setSelectedMaterial(null);
      setSelectedStudentsForMaterial([]);
      setMaterialMessage('');
    } catch (error) {
      console.error('Error enviando material:', error);
      alert('Error al enviar el material');
    }
  };

  // VER RESULTADOS DE EXAMEN
  const handleViewResults = async (examId) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const response = await axios.get(`/api/exams/teacher/results/${examId}`, config);
      setExamResults(response.data);
    } catch (error) {
      console.error('Error obteniendo resultados:', error);
      alert('Error al obtener los resultados');
    }
  };

  return (
    <div className="teacher-dashboard">
      <header className="dashboard-header">
        <h1>Panel del Profesor - {user.name}</h1>
        <button onClick={onLogout} className="logout-btn">Cerrar Sesión</button>
      </header>

      <nav className="dashboard-nav">
        <button 
          className={activeTab === 'exams' ? 'active' : ''} 
          onClick={() => setActiveTab('exams')}
        >
          Exámenes
        </button>
        <button 
          className={activeTab === 'materials' ? 'active' : ''} 
          onClick={() => setActiveTab('materials')}
        >
          Materiales
        </button>
        <button 
          className={activeTab === 'results' ? 'active' : ''} 
          onClick={() => setActiveTab('results')}
        >
          Resultados
        </button>
      </nav>

      <main className="dashboard-content">
        {activeTab === 'exams' && (
          <div className="exams-section">
            <h2>Gestión de Exámenes</h2>
            
            {/* Crear Examen con Especificaciones */}
            <div className="exam-form-section">
              <h3>Crear Examen con IA</h3>
              <form onSubmit={handleCreateExam} className="exam-form">
                <input
                  type="text"
                  placeholder="Título del examen"
                  value={examForm.title}
                  onChange={(e) => setExamForm({...examForm, title: e.target.value})}
                  required
                />
                <textarea
                  placeholder="Descripción (opcional)"
                  value={examForm.description}
                  onChange={(e) => setExamForm({...examForm, description: e.target.value})}
                />
                <textarea
                  placeholder="Especificaciones para la IA (ej: Crear un examen sobre álgebra básica, incluir ecuaciones lineales y problemas de aplicación)"
                  value={examForm.specifications}
                  onChange={(e) => setExamForm({...examForm, specifications: e.target.value})}
                  required
                  rows="4"
                />
                <div className="form-row">
                  <input
                    type="number"
                    placeholder="Número de preguntas"
                    value={examForm.numQuestions}
                    onChange={(e) => setExamForm({...examForm, numQuestions: parseInt(e.target.value)})}
                    min="1"
                    max="50"
                  />
                  <input
                    type="number"
                    placeholder="Duración (minutos)"
                    value={examForm.durationMinutes}
                    onChange={(e) => setExamForm({...examForm, durationMinutes: parseInt(e.target.value)})}
                    min="5"
                  />
                </div>
                <button type="submit" disabled={loading}>
                  {loading ? 'Creando con IA...' : 'Crear Examen'}
                </button>
              </form>
            </div>

            {/* Crear Examen desde PDF */}
            <div className="exam-form-section">
              <h3>Crear Examen desde PDF</h3>
              <form onSubmit={handleCreateExamFromPDF} className="exam-form">
                <input
                  type="text"
                  placeholder="Título del examen"
                  value={pdfForm.title}
                  onChange={(e) => setPdfForm({...pdfForm, title: e.target.value})}
                  required
                />
                <textarea
                  placeholder="Descripción (opcional)"
                  value={pdfForm.description}
                  onChange={(e) => setPdfForm({...pdfForm, description: e.target.value})}
                />
                <textarea
                  placeholder="Especificaciones adicionales para la IA (opcional)"
                  value={pdfForm.specifications}
                  onChange={(e) => setPdfForm({...pdfForm, specifications: e.target.value})}
                  rows="3"
                />
                <input
                  type="number"
                  placeholder="Número de preguntas"
                  value={pdfForm.numQuestions}
                  onChange={(e) => setPdfForm({...pdfForm, numQuestions: parseInt(e.target.value)})}
                  min="1"
                  max="50"
                />
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  required
                />
                <button type="submit" disabled={loading}>
                  {loading ? 'Procesando PDF con IA...' : 'Crear Examen desde PDF'}
                </button>
              </form>
            </div>

            {/* Lista de Exámenes */}
            <div className="exams-list">
              <h3>Mis Exámenes</h3>
              {exams.map(exam => (
                <div key={exam.id} className="exam-item">
                  <h4>{exam.title}</h4>
                  <p>{exam.description}</p>
                  <div className="exam-info">
                    <span>Preguntas: {exam.numQuestions}</span>
                    <span>Estado: {exam.status}</span>
                    <span>Duración: {exam.durationMinutes} min</span>
                  </div>
                  <div className="exam-actions">
                    <button onClick={() => setSelectedExam(exam.id)}>
                      Asignar
                    </button>
                    <button onClick={() => handleViewResults(exam.id)}>
                      Ver Resultados
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Asignar Examen */}
            {selectedExam && (
              <div className="assign-exam-modal">
                <div className="modal-content">
                  <h3>Asignar Examen</h3>
                  <div className="students-selection">
                    <h4>Seleccionar Estudiantes:</h4>
                    {students.map(student => (
                      <label key={student.id} className="student-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStudents([...selectedStudents, student.id]);
                            } else {
                              setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                            }
                          }}
                        />
                        {student.name} ({student.email})
                      </label>
                    ))}
                  </div>
                  <input
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    placeholder="Fecha límite (opcional)"
                  />
                  <div className="modal-actions">
                    <button onClick={handleAssignExam}>Asignar</button>
                    <button onClick={() => setSelectedExam(null)}>Cancelar</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'materials' && (
          <div className="materials-section">
            <h2>Gestión de Materiales</h2>
            
            {/* Subir Material */}
            <div className="material-form-section">
              <h3>Subir Material de Estudio</h3>
              <form onSubmit={handleUploadMaterial} className="material-form">
                <input
                  type="text"
                  placeholder="Título del material"
                  value={materialForm.title}
                  onChange={(e) => setMaterialForm({...materialForm, title: e.target.value})}
                  required
                />
                <textarea
                  placeholder="Descripción del material"
                  value={materialForm.description}
                  onChange={(e) => setMaterialForm({...materialForm, description: e.target.value})}
                />
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx"
                  onChange={(e) => setMaterialFile(e.target.files[0])}
                  required
                />
                <button type="submit" disabled={loading}>
                  {loading ? 'Subiendo...' : 'Subir Material'}
                </button>
              </form>
            </div>

            {/* Lista de Materiales */}
            <div className="materials-list">
              <h3>Mis Materiales</h3>
              {materials.map(material => (
                <div key={material.id} className="material-item">
                  <h4>{material.title}</h4>
                  <p>{material.description}</p>
                  {material.contentSummary && (
                    <div className="ai-summary">
                      <strong>Resumen IA:</strong> {material.contentSummary}
                    </div>
                  )}
                  {material.topicsCovered && (
                    <div className="topics">
                      <strong>Temas:</strong> {material.topicsCovered.join(', ')}
                    </div>
                  )}
                  <div className="material-info">
                    <span>Archivo: {material.fileName}</span>
                    <span>Tamaño: {(material.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                  <button onClick={() => setSelectedMaterial(material.id)}>
                    Enviar a Estudiantes
                  </button>
                </div>
              ))}
            </div>

            {/* Enviar Material */}
            {selectedMaterial && (
              <div className="send-material-modal">
                <div className="modal-content">
                  <h3>Enviar Material a Estudiantes</h3>
                  <div className="students-selection">
                    <h4>Seleccionar Estudiantes:</h4>
                    {students.map(student => (
                      <label key={student.id} className="student-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedStudentsForMaterial.includes(student.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStudentsForMaterial([...selectedStudentsForMaterial, student.id]);
                            } else {
                              setSelectedStudentsForMaterial(selectedStudentsForMaterial.filter(id => id !== student.id));
                            }
                          }}
                        />
                        {student.name} ({student.email})
                      </label>
                    ))}
                  </div>
                  <textarea
                    placeholder="Mensaje para los estudiantes (opcional)"
                    value={materialMessage}
                    onChange={(e) => setMaterialMessage(e.target.value)}
                    rows="3"
                  />
                  <div className="modal-actions">
                    <button onClick={handleSendMaterial}>Enviar</button>
                    <button onClick={() => setSelectedMaterial(null)}>Cancelar</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'results' && (
          <div className="results-section">
            <h2>Resultados de Exámenes</h2>
            
            {examResults && (
              <div className="exam-results">
                <h3>Resultados: {examResults.exam.title}</h3>
                
                <div className="results-overview">
                  <div className="stat-card">
                    <h4>Total Estudiantes</h4>
                    <span>{examResults.results.length}</span>
                  </div>
                  <div className="stat-card">
                    <h4>Promedio</h4>
                    <span>
                      {examResults.results.length > 0 
                        ? (examResults.results.reduce((sum, r) => sum + r.score, 0) / examResults.results.length).toFixed(1)
                        : 0
                      }%
                    </span>
                  </div>
                </div>

                <div className="students-results">
                  {examResults.results.map((result, index) => (
                    <div key={index} className="student-result">
                      <div className="student-info">
                        <h4>{result.student.name}</h4>
                        <span className="score">{result.score.toFixed(1)}%</span>
                        <span className="answers">{result.correctAnswers}/{result.totalQuestions}</span>
                      </div>
                      
                      <div className="ai-feedback">
                        <h5>Análisis IA para el Profesor:</h5>
                        <p>{result.teacherFeedback}</p>
                        
                        {result.weakTopics && result.weakTopics.length > 0 && (
                          <div className="weak-topics">
                            <strong>Temas a reforzar:</strong>
                            <ul>
                              {result.weakTopics.map((topic, i) => <li key={i}>{topic}</li>)}
                            </ul>
                          </div>
                        )}
                        
                        {result.strongTopics && result.strongTopics.length > 0 && (
                          <div className="strong-topics">
                            <strong>Fortalezas:</strong>
                            <ul>
                              {result.strongTopics.map((topic, i) => <li key={i}>{topic}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>
                      
                      <div className="result-actions">
                        <button onClick={() => {
                          // Aquí podrías implementar envío automático de material
                          alert(`Recomendaciones para ${result.student.name}: ${result.weakTopics ? result.weakTopics.join(', ') : 'Revisar conceptos generales'}`);
                        }}>
                          Enviar Material Recomendado
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {!examResults && (
              <p>Selecciona "Ver Resultados" en un examen para ver el análisis detallado.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default TeacherDashboard;