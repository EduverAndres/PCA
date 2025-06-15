// src/components/Login.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:3000/auth/login', formData);
      onLogin(response.data);
    } catch (error) {
      setError(
        error.response?.data?.message || 
        'Error al iniciar sesión. Verifica tus credenciales.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo - Información de la universidad */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-university-red-600 to-university-red-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 text-center">
          <div className="mb-8">
            <AcademicCapIcon className="w-24 h-24 mx-auto mb-6 text-white/90" />
            <h1 className="text-4xl font-bold mb-4">
              Sistema de Evaluación
            </h1>
            <p className="text-xl text-white/90 leading-relaxed max-w-md">
              Plataforma inteligente para la gestión de exámenes y evaluaciones académicas
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold mb-1">500+</div>
              <div className="text-white/80">Estudiantes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-1">50+</div>
              <div className="text-white/80">Profesores</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-1">1000+</div>
              <div className="text-white/80">Exámenes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-1">AI</div>
              <div className="text-white/80">Inteligencia Artificial</div>
            </div>
          </div>
        </div>
        
        {/* Elementos decorativos */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full translate-y-48 -translate-x-48"></div>
      </div>

      {/* Panel derecho - Formulario de login */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="lg:hidden mb-4">
              <AcademicCapIcon className="w-16 h-16 mx-auto text-university-red-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              Bienvenido
            </h2>
            <p className="text-slate-600">
              Ingresa tus credenciales para acceder al sistema
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-university-red-500 focus:border-university-red-500 transition-colors duration-200 bg-white/50 backdrop-blur-sm"
                placeholder="tu@universidad.edu"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-university-red-500 focus:border-university-red-500 transition-colors duration-200 bg-white/50 backdrop-blur-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-200"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg animate-slide-down">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Remember me y forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-university-red-600 border-slate-300 rounded focus:ring-university-red-500"
                />
                <span className="ml-2 text-sm text-slate-600">Recordarme</span>
              </label>
              <button
                type="button"
                className="text-sm text-university-red-600 hover:text-university-red-700 font-medium transition-colors duration-200"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-university-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-university-red-700 focus:ring-4 focus:ring-university-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Iniciando sesión...
                </div>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          {/* Register link */}
          <div className="mt-8 text-center">
            <p className="text-slate-600">
              ¿No tienes una cuenta?{' '}
              <Link
                to="/register"
                className="text-university-red-600 hover:text-university-red-700 font-medium transition-colors duration-200"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-slate-100 rounded-lg">
            <p className="text-xs text-slate-500 text-center mb-2">Credenciales de demo:</p>
            <div className="text-xs text-slate-600 space-y-1">
              <div>👨‍🏫 Profesor: profesor@universidad.edu / 123456</div>
              <div>👨‍🎓 Estudiante: estudiante@universidad.edu / 123456</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;