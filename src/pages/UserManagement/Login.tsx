import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loginError, setLoginError] = useState("");

  const validateEmail = (value: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) return "Debe completar todos los campos.";
    if (!regex.test(value)) return "Formato de correo inválido.";
    return "";
  };

  const validatePassword = (value: string) => {
    if (!value) return "Debe completar todos los campos.";
    return "";
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailError(validateEmail(e.target.value));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setPasswordError(validatePassword(e.target.value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);

    setEmailError(emailErr);
    setPasswordError(passwordErr);

    if (emailErr || passwordErr) return;

    // Simulación de login correcto
    if (email === "admin@dominio.com" && password === "12345678") {
      setLoginError("");
      // ✅ Redirigir a Home
      navigate("/home");
    } else {
      setLoginError("Credenciales incorrectas. Intente nuevamente.");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <h2 className="mb-4">Iniciar sesión</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Correo electrónico</label>
          <input
            type="email"
            className={`form-control ${emailError ? "is-invalid" : ""}`}
            value={email}
            onChange={handleEmailChange}
          />
          {emailError && <div className="invalid-feedback">{emailError}</div>}
        </div>

        <div className="mb-3">
          <label>Contraseña</label>
          <input
            type="password"
            className={`form-control ${passwordError ? "is-invalid" : ""}`}
            value={password}
            onChange={handlePasswordChange}
          />
          {passwordError && (
            <div className="invalid-feedback">{passwordError}</div>
          )}
        </div>

        {loginError && <div className="alert alert-danger">{loginError}</div>}

        <button type="submit" className="btn btn-primary w-100 mb-2">
          Iniciar sesión
        </button>

        <div className="d-flex justify-content-between">
          <Link to="/recover">¿Olvidaste tu contraseña?</Link>
          <Link to="/register">Registrarse</Link>
        </div>
      </form>
    </div>
  );
};

export default Login;