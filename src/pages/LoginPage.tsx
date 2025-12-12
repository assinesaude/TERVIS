import React from 'react'
import { Navigate } from 'react-router-dom'
import { LoginForm } from '../components/auth/LoginForm'
import { useAuth } from '../hooks/useAuth'

export function LoginPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <img
            src="/tervisaibonito.png"
            alt="Tervis.AI"
            className="mx-auto h-12 w-auto"
          />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Entre na sua conta
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ou{' '}
            <a href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
              crie uma nova conta
            </a>
          </p>
        </div>
        
        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <LoginForm onSuccess={() => window.location.href = '/'} />
        </div>
      </div>
    </div>
  )
}