import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import CommonForms from './ComonForms' 
import { loginFormController } from '../../Data/Data'
import { useDispatch } from 'react-redux'
import { authAction } from '../../redux/store'
import ShopName from '@/component/ShopName'
import { withCsrf } from '../../lib/csrf'

const initialState = { email: '', password: '' }

const Login = () => {
  const [formData, setFormData] = useState(initialState)
  const [isLoading, setIsLoading] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    const errorToastStyle = {
      style: {
        border: '2px solid #ef4444',
        padding: '12px 16px',
        color: '#1f2937',
        fontWeight: '500',
        backgroundColor: '#fff',
      },
      duration: 4000,
    };

    try {

      const baseConfig = await withCsrf({ withCredentials: true });

      // 🚀 FIXED: If a route requires a token, fetch it using the key you saved ('token')
      const token = localStorage.getItem("token");
      
      const config = {
        ...baseConfig,
        headers: {
          ...baseConfig.headers,
          // Conditionally inject Bearer token if it exists (Optional for login, critical for standard requests)
          ...(token && { Authorization: `Bearer ${token}` })
        }
      };

      // Send authentication payload cleanly with full validation configurations
      const response = await axios.post('/api/v1/user-login', formData, config);
      const { user } = response.data

      if (user?.isSuspended || user?.status === 'suspended') {
        toast.error('Your account is suspended. Contact customer care.', errorToastStyle)
        setIsLoading(false)
        return
      }

      dispatch(authAction.login({ user, role: user?.role }))
      toast.success('Login successful!')

      const role = user?.role?.toUpperCase()
      if (role === 'ADMIN') navigate('/admin')
      else if (role === 'DEALER') navigate('/dealer')
      else navigate('/')
    } catch (error) {
      console.error("Login component trace logs:", error)
      const serverMessage = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(serverMessage, errorToastStyle)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full h-auto p-4 sm:p-5 rounded-2xl shadow-xl lg:shadow-md md:border-gray-100 flex flex-col justify-center overflow-hidden max-h-full mx-auto">
      <div className="w-full max-w-md flex flex-col justify-center h-full max-h-full space-y-3 overflow-hidden">
        <div className="text-center shrink-0">
          <ShopName />
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight leading-none">
            Sign in to your
          </h2>
          <p className="text-[11px] text-gray-400 mt-0.5">
            <span className="font-semibold text-indigo-600">Asapong</span> account
          </p>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden py-1">
          <CommonForms
            formControl={loginFormController}
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            buttonText={isLoading ? 'Signing in...' : 'Sign In'}
          />
        </div>

        <div className="pt-2 border-t border-gray-100 text-center shrink-0 space-y-1.5">
          <p className="text-xs text-gray-400">
            Don't have an account?{' '}
            <Link to="/auth/register" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors duration-200 underline underline-offset-4 decoration-indigo-200 hover:decoration-indigo-500">
              Create one
            </Link>
          </p>
          <p className="text-xs text-gray-400">
            <Link to="/auth/reset-password" className="font-medium text-slate-500 hover:text-indigo-600 transition-colors duration-200">
              Forgot password?
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
