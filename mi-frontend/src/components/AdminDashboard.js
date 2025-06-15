import { useState, useEffect } from 'react';

function AdminDashboard({ user, onLogout }) {
  const [activeSection, setActiveSection] = useState('overview');
  const [users, setUsers] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // Estados para la gestión de usuarios
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: ''
  });

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    fetchUserStats();
    if (activeSection === 'users') {
      fetchUsers();
    }
  }, [activeSection]);

  const fetchUserStats = async () => {
    try {
      const response = await fetch("http://localhost:3000/users/stats");
      const data = await response.json();
      if (data.success) {
        setUserStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/users");
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      const data = await response.json();
      if (data.success) {
        alert("Usuario creado exitosamente");
        setShowCreateUser(false);
        setNewUser({ username: '', email: '', password: '', role: '' });
        fetchUsers();
        fetchUserStats();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      alert("Error de conexión");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      try {
        const response = await fetch(`http://localhost:3000/users/${userId}`, {
          method: "DELETE",
        });

        const data = await response.json();
        if (data.success) {
          alert("Usuario eliminado exitosamente");
          fetchUsers();
          fetchUserStats();
        } else {
          alert(`Error: ${data.message}`);
        }
      } catch (error) {
        alert("Error de conexión");
      }
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      const response = await fetch(`http://localhost:3000/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Rol actualizado exitosamente");
        fetchUsers();
        fetchUserStats();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      alert("Error de conexión");
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      'estudiante': 'bg-blue-100 text-blue-800',
      'profesor': 'bg-green-100 text-green-800',
      'administrador': 'bg-red-100 text-red-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getRoleIcon = (role) => {
    const icons = {
      'estudiante': '👨‍🎓',
      'profesor': '👨‍🏫',
      'administrador': '👨‍💼'
    };
    return icons[role] || '👤';
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-800">{userStats?.total || 0}</p>
              <p className="text-gray-600">Total Usuarios</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👨‍🎓</span>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-blue-600">{userStats?.estudiantes || 0}</p>
              <p className="text-gray-600">Estudiantes</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👨‍🏫</span>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-green-600">{userStats?.profesores || 0}</p>
              <p className="text-gray-600">Profesores</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👨‍💼</span>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-red-600">{userStats?.administradores || 0}</p>
              <p className="text-gray-600">Administradores</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de distribución */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Distribución de Usuarios por Rol</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-2xl mr-3">👨‍🎓</span>
              <span className="text-gray-700">Estudiantes</span>
            </div>
            <div className="flex items-center w-2/3">
              <div className="w-full bg-gray-200 rounded-full h-3 mr-4">
                <div 
                  className="bg-blue-500 h-3 rounded-full" 
                  style={{ width: `${((userStats?.estudiantes || 0) / (userStats?.total || 1)) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-600 w-16">
                {userStats?.estudiantes || 0} ({Math.round(((userStats?.estudiantes || 0) / (userStats?.total || 1)) * 100)}%)
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-2xl mr-3">👨‍🏫</span>
              <span className="text-gray-700">Profesores</span>
            </div>
            <div className="flex items-center w-2/3">
              <div className="w-full bg-gray-200 rounded-full h-3 mr-4">
                <div 
                  className="bg-green-500 h-3 rounded-full" 
                  style={{ width: `${((userStats?.profesores || 0) / (userStats?.total || 1)) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-600 w-16">
                {userStats?.profesores || 0} ({Math.round(((userStats?.profesores || 0) / (userStats?.total || 1)) * 100)}%)
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-2xl mr-3">👨‍💼</span>
              <span className="text-gray-700">Administradores</span>
            </div>
            <div className="flex items-center w-2/3">
              <div className="w-full bg-gray-200 rounded-full h-3 mr-4">
                <div 
                  className="bg-red-500 h-3 rounded-full" 
                  style={{ width: `${((userStats?.administradores || 0) / (userStats?.total || 1)) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-600 w-16">
                {userStats?.administradores || 0} ({Math.round(((userStats?.administradores || 0) / (userStats?.total || 1)) * 100)}%)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsersManagement = () => (
    <div className="space-y-6">
      {/* Header con botones */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Gestión de Usuarios</h3>
          <button
            onClick={() => setShowCreateUser(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            + Agregar Usuario
          </button>
        </div>
      </div>

      {/* Modal para crear usuario */}
      {showCreateUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Crear Nuevo Usuario</h3>
            <form onSubmit={handleCreateUser}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Seleccionar rol</option>
                    <option value="estudiante">👨‍🎓 Estudiante</option>
                    <option value="profesor">👨‍🏫 Profesor</option>
                    <option value="administrador">👨‍💼 Administrador</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateUser(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                  Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabla de usuarios */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Usuario</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Rol</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Fecha Registro</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((userItem) => (
                  <tr key={userItem.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium mr-3 ${
                          userItem.role === 'estudiante' ? 'bg-blue-500' :
                          userItem.role === 'profesor' ? 'bg-green-500' : 'bg-red-500'
                        }`}>
                          {userItem.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800">{userItem.username}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{userItem.email}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(userItem.role)}`}>
                        {getRoleIcon(userItem.role)} {userItem.role}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {new Date(userItem.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <select
                          value={userItem.role}
                          onChange={(e) => handleUpdateRole(userItem.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="estudiante">👨‍🎓 Estudiante</option>
                          <option value="profesor">👨‍🏫 Profesor</option>
                          <option value="administrador">👨‍💼 Administrador</option>
                        </select>
                        <button
                          onClick={() => handleDeleteUser(userItem.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                          disabled={userItem.id === user.id}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h1 className="ml-3 text-xl font-semibold text-gray-900">Panel de Administración</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.username?.charAt(0).toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.username || 'Administrador'}
                  </p>
                  <p className="text-xs text-gray-500">👨‍💼 Administrador</p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="ml-4 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <div className="flex">
        <nav className="w-64 bg-white shadow-sm h-screen sticky top-0">
          <div className="p-4">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setActiveSection('overview')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeSection === 'overview'
                      ? 'bg-red-100 text-red-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  📊 Resumen General
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveSection('users')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeSection === 'users'
                      ? 'bg-red-100 text-red-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  👥 Gestión de Usuarios
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveSection('students')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeSection === 'students'
                      ? 'bg-red-100 text-red-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  👨‍🎓 Vista de Estudiante
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveSection('teachers')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeSection === 'teachers'
                      ? 'bg-red-100 text-red-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  👨‍🏫 Vista de Profesor
                </button>
              </li>
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeSection === 'overview' && renderOverview()}
          {activeSection === 'users' && renderUsersManagement()}
          {activeSection === 'students' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">👨‍🎓 Módulo de Estudiante</h3>
              <p className="text-blue-700 mb-4">
                Vista previa del módulo de estudiante. Los estudiantes pueden realizar exámenes y ver sus calificaciones.
              </p>
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <h4 className="font-medium text-gray-800 mb-2">Funcionalidades disponibles:</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Realizar exámenes en línea</li>
                  <li>• Ver resultados y calificaciones</li>
                  <li>• Seguimiento del progreso académico</li>
                  <li>• Historial de exámenes realizados</li>
                </ul>
                <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                  Ver Demo del Examen
                </button>
              </div>
            </div>
          )}
          {activeSection === 'teachers' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-4">👨‍🏫 Módulo de Profesor</h3>
              <p className="text-green-700 mb-4">
                Vista previa del módulo de profesor. Los profesores pueden gestionar estudiantes, crear exámenes y calificar.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <h4 className="font-medium text-gray-800 mb-2">👥 Gestión de Estudiantes</h4>
                  <ul className="text-gray-600 text-sm space-y-1">
                    <li>• Lista de estudiantes</li>
                    <li>• Seguimiento de progreso</li>
                    <li>• Gestión de grupos</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <h4 className="font-medium text-gray-800 mb-2">📝 Crear Exámenes</h4>
                  <ul className="text-gray-600 text-sm space-y-1">
                    <li>• Editor de preguntas</li>
                    <li>• Configurar tiempo</li>
                    <li>• Programar fechas</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <h4 className="font-medium text-gray-800 mb-2">📊 Calificaciones</h4>
                  <ul className="text-gray-600 text-sm space-y-1">
                    <li>• Revisión automática</li>
                    <li>• Reportes de rendimiento</li>
                    <li>• Retroalimentación</li>
                  </ul>
                </div>
              </div>
              <button className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                Acceder al Panel de Profesor
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;