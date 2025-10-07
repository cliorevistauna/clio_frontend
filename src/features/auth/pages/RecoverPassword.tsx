import React, { useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../hooks/useAuth";
import { useForm } from "../../../shared/hooks";
import { AppLayout, FormContainer } from "../../../shared/components/layout";
import { Button, Input, FormField } from "../../../shared/components/ui";
import { ROUTES } from "../../../shared/constants";

const Alert = styled.div<{ variant?: 'error' | 'success' }>`
  color: #fff;
  background: ${props => props.variant === 'success' ? '#28a745' : '#dc3545'};
  border-radius: 8px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  text-align: center;
`;

const BackLink = styled.div`
  text-align: center;
  margin-top: 1rem;

  a {
    color: #034991;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const RecoverPassword: React.FC = () => {
  const { resetPassword } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [resetError, setResetError] = useState("");

  const {
    getFieldProps,
    handleSubmit,
    isSubmitting,
    errors,
    values
  } = useForm({
    initialValues: {
      email: ""
    },
    validate: (values) => {
      const errors: any = {};

      // Validación de formato de email válido (RF-003)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(values.email)) {
        errors.email = "El correo ingresado debe tener formato válido.";
      }

      return errors;
    },
    onSubmit: async (values) => {
      try {
        setResetError("");
        await resetPassword(values.email);
        setSubmitted(true);
      } catch (error) {
        setResetError(error instanceof Error ? error.message : "Error al enviar el correo de recuperación");
      }
    }
  });

  // Validación en tiempo real para el campo de email
  const getEmailError = () => {
    if (!values.email) return "";
    if (!values.email.includes("@")) {
      return "El correo electrónico debe contener un @";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(values.email)) {
      return "El correo ingresado debe tener formato válido.";
    }
    return "";
  };

  const emailRealtimeError = getEmailError();

  if (submitted) {
    return (
      <AppLayout>
        <FormContainer>
          <Alert variant="success">
            Se ha enviado un enlace a su correo para restablecer la contraseña.
          </Alert>
          <BackLink>
            <Link to={ROUTES.LOGIN}>Volver al inicio de sesión</Link>
          </BackLink>
        </FormContainer>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <FormContainer>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Recuperar Contraseña</h2>
        <form onSubmit={handleSubmit}>
          <FormField label="Correo electrónico" required error={emailRealtimeError || errors.email}>
            <Input
              type="text"
              placeholder="Introduce tu correo electrónico"
              {...getFieldProps("email")}
            />
          </FormField>

          {/* Mostrar errores del servidor */}
          {resetError && <Alert>{resetError}</Alert>}

          <Button
            type="submit"
            loading={isSubmitting}
            style={{ width: '100%', marginBottom: '1rem' }}
          >
            Enviar enlace de recuperación
          </Button>
        </form>

        <BackLink>
          <Link to={ROUTES.LOGIN}>Volver al inicio de sesión</Link>
        </BackLink>
      </FormContainer>
    </AppLayout>
  );
};

export default RecoverPassword;