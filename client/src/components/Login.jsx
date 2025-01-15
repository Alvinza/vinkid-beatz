import React, { useContext } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";

const Login = () => {
  const { login } = useContext(UserContext);
  const navigate = useNavigate();

  const initialValues = {
    email: "",
    password: "",
  };

  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email address").required("Email is required"),
    password: Yup.string().required("Password is required"),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
  try {
    console.log('Attempting login with:', values);
    const response = await axios.post(
      "https://vinkid-beatz-backend.onrender.com/api/login", 
      values,
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    
    console.log('Login response:', response.data);
    const { name, email, isAdmin, token } = response.data;

    // Store the token
    localStorage.setItem('token', token);
    
    // Set axios default authorization header
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    login({ name, email, isAdmin, token });

    if (isAdmin) {
      toast.success("Admin login successful");
      navigate("/admin-panel");
    } else {
      toast.success("Login successful");
      navigate("/");
    }
    resetForm();
  } catch (error) {
    console.error("Login error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    toast.error(error.response?.data?.message || "Login failed");
  }
  setSubmitting(false);
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-50 p-4">
      <div className="w-full max-w-md transform transition-all duration-300 hover:shadow-xl">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10">
          <div className="flex justify-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Welcome Back</h2>
          </div>
          
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700" htmlFor="email">
                    Email Address
                  </label>
                  <Field
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ease-in-out"
                    placeholder="Enter your email"
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-red-500 text-sm mt-1 font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700" htmlFor="password">
                    Password
                  </label>
                  <Field
                    type="password"
                    id="password"
                    name="password"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ease-in-out"
                    placeholder="Enter your password"
                  />
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="text-red-500 text-sm mt-1 font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transform transition-all duration-200 ease-in-out hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Logging in...
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </button>

                <div className="mt-6 text-center">
                  <span className="text-gray-600">Don't have an account? </span>
                  <Link 
                    to="/register" 
                    className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200"
                  >
                    Create Account
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
