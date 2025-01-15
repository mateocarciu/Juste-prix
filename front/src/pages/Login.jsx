import React, { useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { UserContext } from "../context/UserContext"; 

const Login = () => {
  const { login, user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.token) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const validationSchema = Yup.object({
    email: Yup.string().email("Email invalide").required("L'email est requis"),
    password: Yup.string().required("Le mot de passe est requis"),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.user);
        navigate("/dashboard");
      } else {
        alert(data.error || "Une erreur est survenue");
      }
    } catch (error) {
      console.error("Erreur lors de la requête:", error);
      alert("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center bg-white dark:bg-gray-800">
      <div className="w-full max-w-md p-8 rounded shadow-lg">
        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <h2 className="text-3xl font-bold mb-6 text-center">Connexion</h2>
              <div className="mb-4">
                <Field
                  type="email"
                  name="email"
                  placeholder="Email"
                  className="input input-bordered w-full"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-600"
                />
              </div>
              <div className="mb-4">
                <Field
                  type="password"
                  name="password"
                  placeholder="Mot de passe"
                  className="input input-bordered w-full"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-600"
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Connexion en cours..." : "Se connecter"}
              </button>
            </Form>
          )}
        </Formik>
        <div className="mt-4 text-center">
          <Link to="/register" className="text-blue-500 hover:underline">
            Inscription
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
