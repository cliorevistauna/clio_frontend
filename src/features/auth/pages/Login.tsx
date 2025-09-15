import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../hooks/useAuth";
import { useForm } from "../../../shared/hooks";
import { validateEmail, validatePassword } from "../../../shared/utils";
import { AppLayout, FormContainer } from "../../../shared/components/layout";
import { Button, Input, FormField } from "../../../shared/components/ui";
import { ROUTES } from "../../../shared/constants";
import { LoginCredentials } from "../types/User";

const Alert = styled.div`
  color: #fff;
  background: #dc3545;
  border-radius: 8px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  text-align: center;
`;

const LinksRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
  margin-top: 1rem;

  a {
    color: #034991;
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
    isSubmitting
  } = useForm({
    initialValues: {
      email: "",
      password: ""
    },
    validate: (values) => {
      const errors: any = {};

      const emailError = validateEmail(values.email);
      if (emailError) errors.email = emailError;

      const passwordError = validatePassword(values.password);
      if (passwordError) errors.password = passwordError;

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
      <FormContainer title="Iniciar sesión">
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
            <Link to={ROUTES.REGISTER}>Registrarse</Link>
          </LinksRow>
        </form>
      </FormContainer>
    </AppLayout>
  );
};

export default Login;