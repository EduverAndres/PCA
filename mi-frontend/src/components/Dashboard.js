import { useState, useEffect } from 'react';

function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [userStats, setUserStats] = useState(null);

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    const fetchStats = async () => {
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

    fetchStats();
  }, []);

  const getRoleDisplayName = (role) => {
    const roleNames = {
      'estudiante': '👨‍🎓 Estudiante',
      'profesor': '👨‍🏫 Profesor', 
      'administrador': '👨‍💼 Administrador'
    };
    return roleNames[role] || '👤 Usuario';
  };

  const getRoleColor = (role) => {
    const roleColors = {
      'estudiante': 'bg-blue-100 text-blue-800',
      'profesor': 'bg-green-100 text-green-800',
      'administrador': 'bg-red-100 text-red-800'
    };
    return roleColors[role] || 'bg-gray-100 text-gray-800';
  };

  const stats = [
    {
      name: 'Total Usuarios',
      value: userStats?.total || '0',
      change: '+4.75%',
      changeType: 'positive',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      )
    },
    {
      name: 'Estudiantes',
      value: userStats?.estudiantes || '0',
      change: '+12.3%',
      changeType: 'positive',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        </svg>
      )
    },
    {
      name: 'Profesores',
      value: userStats?.profesores || '0',
      change: '+5.2%',
      changeType: 'positive',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      name: 'Administradores',
      value: userStats?.administradores || '0',
      change: '0%',
      changeType: 'neutral',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    }
  ];

  const recentActivities = [
    { id: 1, user: 'Juan Pérez', action: 'Inició sesión', time: 'Hace 2 minutos', type: 'login' },
    { id: 2, user: 'María González', action: 'Actualizó perfil', time: 'Hace 5 minutos', type: 'update' },
    { id: 3, user: 'Carlos López', action: 'Subió documento', time: 'Hace 8 minutos', type: 'upload' },
    { id: 4, user: 'Ana Martínez', action: 'Cerró sesión', time: 'Hace 12 minutos', type: 'logout' },
    { id: 5, user: 'Diego Rodríguez', action: 'Creó proyecto', time: 'Hace 15 minutos', type: 'create' }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'login':
        return <div className="w-2 h-2 bg-green-400 rounded-full"></div>;
      case 'logout':
        return <div className="w-2 h-2 bg-red-400 rounded-full"></div>;
      case 'update':
        return <div className="w-2 h-2 bg-blue-400 rounded-full"></div>;
      case 'upload':
        return <div className="w-2 h-2 bg-purple-400 rounded-full"></div>;
      case 'create':
        return <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>;
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full"></div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo y título */}
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="ml-3 text-xl font-semibold text-gray-900">Dashboard</h1>
            </div>

            {/* Usuario y logout */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.username || 'Usuario'}
                  </p>
                  <p className="text-xs text-gray-500">{getRoleDisplayName(user?.role)}</p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="ml-4 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Bienvenida con rol destacado */}
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  ¡Bienvenido de vuelta, {user?.username || 'Usuario'}! 👋
                </h2>
                <p className="text-red-100 mb-3">
                  Aquí tienes un resumen de la actividad de hoy.
                </p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user?.role)} bg-white bg-opacity-20 text-white border border-white border-opacity-30`}>
                  {getRoleDisplayName(user?.role)}
                </span>
              </div>
              <div className="hidden sm:block">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {stats.map((stat) => (
              <div key={stat.name} className="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-200">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center text-red-600">
                        {stat.icon}
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {stat.name}
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {stat.value}
                          </div>
                          <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                            stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            <svg className={`self-center flex-shrink-0 h-5 w-5 ${
                              stat.changeType === 'positive' ? 'text-green-500' : 'text-red-500'
                            }`} fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d={
                                stat.changeType === 'positive' 
                                  ? "M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                                  : "M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                              } clipRule="evenodd" />
                            </svg>
                            <span className="sr-only">
                              {stat.changeType === 'positive' ? 'Increased' : 'Decreased'} by
                            </span>
                            {stat.change}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sección de actividad reciente */}
          <div className="bg-white shadow-lg rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Actividad Reciente
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Últimas acciones realizadas por los usuarios
              </p>
            </div>
            <div className="divide-y divide-gray-200">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-3">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {activity.user}
                        </p>
                        <p className="text-sm text-gray-500">
                          {activity.action}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">
                      {activity.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;