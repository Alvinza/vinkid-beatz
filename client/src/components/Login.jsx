import React, { useContext, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";

const Login = () => {
  const { login } = useContext(UserContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Get the backend URL from environment variables
  const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://vinkid-beatz-backend.onrender.com';

  const initialValues = {
    email: "",
    password: "",
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .required("Password is required")
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setIsLoading(true);
    try {
      // Debug log - what we're sending
      console.log('Login attempt:', {
        url: `${API_URL}/api/login`,
        email: values.email,
        passwordLength: values.password.length
      });
      
      const response = await axios.post(`${API_URL}/api/login`, values, {
        headers: {
          'Content-Type': 'application/json',
        },
        // Important: Add this for handling CORS
        withCredentials: true
      });

      // Debug log - response received
      console.log('Server response:', {
        status: response.status,
        data: response.data
      });
      
      const { name, email, isAdmin, token } = response.data;

      if (!token) {
        throw new Error('No token received from server');
      }

      // Store the token
      localStorage.setItem('token', token);
      
      // Configure axios defaults for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Update user context
      login({ name, email, isAdmin, token });

      toast.success(`Welcome back, ${name || email}!`);
      navigate(isAdmin ? "/admin-panel" : "/");
      resetForm();
    } catch (error) {
      // Enhanced error logging
      console.error("Login error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });

      // User-friendly error message
      const errorMessage = 
        error.response?.data?.message ||
        (error.response?.status === 401 ? "Invalid email or password" : 
         error.response?.status === 404 ? "Server not found. Please try again later" :
         "Login failed. Please try again.");

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
          </div>
          
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700" htmlFor="email">
                    Email Address
                  </label>
                  <Field
                    type="email"
                    id="email"
                    name="email"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter your email"
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="mt-1 text-sm text-red-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700" htmlFor="password">
                    Password
                  </label>
                  <Field
                    type="password"
                    id="password"
                    name="password"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter your password"
                  />
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="mt-1 text-sm text-red-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Signing in...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </button>

                <div className="text-center mt-4">
                  <Link to="/register" className="text-sm text-blue-600 hover:text-blue-500">
                    Don't have an account? Create one
                  </Link>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default Login;
