import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../hooks/useAuth";
import { useForm } from "../../../shared/hooks";
import { AppLayout, FormContainer } from "../../../shared/components/layout";
import { Button, Input, FormField } from "../../../shared/components/ui";
import { ROUTES } from "../../../shared/constants";
import { LoginCredentials } from "../types/User";

const Alert = styled.div`
  color: var(--color-white);
  background: var(--color-error);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  text-align: center;
`;

const LinksRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
  margin-top: var(--spacing-md);

  a {
    color: var(--color-primary);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [loginError, setLoginError] = useState("");

  const {
    getFieldProps,
    handleSubmit,
    isSubmitting,
    errors
  } = useForm({
    initialValues: {
      email: "",
      password: ""
    },
    validate: (values) => {
      const errors: any = {};

      // Validación para campos vacíos (RF-001)
      if (!values.email || !values.password) {
        return { form: "Debe completar todos los campos." };
      }

      // Validación de formato de email (RF-001)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(values.email)) {
        errors.email = "El correo electrónico debe tener formato válido (ejemplo: usuario@dominio.com).";
      }

      return errors;
    },
    onSubmit: async (values) => {
      try {
        setLoginError("");
        const credentials: LoginCredentials = {
          email: values.email,
          password: values.password
        };

        await login(credentials);
        navigate(ROUTES.DASHBOARD);
      } catch (error) {
        setLoginError(error instanceof Error ? error.message : "Error al iniciar sesión");
      }
    }
  });

  return (
    <AppLayout>
      <FormContainer>
        <form onSubmit={handleSubmit}>
          <FormField label="Correo electrónico" required>
            <Input
              type="email"
              {...getFieldProps("email")}
            />
          </FormField>

          <FormField label="Contraseña" required>
            <Input
              type="password"
              {...getFieldProps("password")}
            />
          </FormField>

          {/* Mostrar error de validación de campos vacíos */}
          {errors.form && <Alert>{errors.form}</Alert>}

          {/* Mostrar errores del servidor */}
          {loginError && <Alert>{loginError}</Alert>}

          <Button
            type="submit"
            loading={isSubmitting || isLoading}
            style={{ width: '100%', marginBottom: '0.5rem' }}
          >
            Iniciar sesión
          </Button>

          <LinksRow>
            <Link to={ROUTES.RECOVER_PASSWORD}>¿Olvidaste tu contraseña?</Link>
            <Link to={ROUTES.REGISTER}>Crear cuenta</Link>
          </LinksRow>
        </form>
      </FormContainer>
    </AppLayout>
  );
};

export default Login;