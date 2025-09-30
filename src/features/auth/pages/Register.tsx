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

const Register: React.FC = () => {
  const { register } = useAuth();
  const [registrationError, setRegistrationError] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const {
    getFieldProps,
    handleSubmit,
    isSubmitting,
    errors
  } = useForm({
    initialValues: {
      nombre: "",
      correo: "",
      password: "",
      confirmPassword: ""
    },
    validate: (values) => {
      const errors: any = {};

      // Validación de nombre (requerido)
      if (!values.nombre || values.nombre.trim().length === 0) {
        errors.nombre = "El nombre es obligatorio.";
      }

      // Validación de formato de email (RF-004)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(values.correo)) {
        errors.correo = "El correo electrónico debe tener formato válido (ejemplo: usuario@dominio.com).";
      }

      // Validación de contraseña - mínimo 8 caracteres, combinación de letras y números (RF-004)
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
      if (!passwordRegex.test(values.password)) {
        errors.password = "La contraseña no cumple con los requisitos de seguridad.";
      }

      // Validación de confirmación de contraseña (RF-004)
      if (values.password !== values.confirmPassword) {
        errors.confirmPassword = "Las contraseñas no coinciden.";
      }

      return errors;
    },
    onSubmit: async (values) => {
      try {
        setRegistrationError("");
        await register({
          nombre: values.nombre,
          correo: values.correo,
          password: values.password,
          password_confirm: values.confirmPassword
        });
        setRegistrationSuccess(true);
      } catch (error) {
        setRegistrationError(error instanceof Error ? error.message : "Error al registrar usuario");
      }
    }
  });

  // Si el registro fue exitoso
  if (registrationSuccess) {
    return (
      <AppLayout>
        <FormContainer>
          <Alert variant="success">
            Registro exitoso. Su cuenta está pendiente de aprobación por un administrador.
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
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Registro de Usuario</h2>
        <form onSubmit={handleSubmit}>
          <FormField label="Nombre completo" required>
            <Input
              type="text"
              placeholder="Ingrese su nombre completo"
              {...getFieldProps("nombre")}
            />
          </FormField>

          {/* Mostrar errores de validación de nombre */}
          {errors.nombre && <Alert>{errors.nombre}</Alert>}

          <FormField label="Correo electrónico" required>
            <Input
              type="email"
              placeholder="usuario@dominio.com"
              {...getFieldProps("correo")}
            />
          </FormField>

          {/* Mostrar errores de validación de email */}
          {errors.correo && <Alert>{errors.correo}</Alert>}

          <FormField label="Contraseña" required>
            <Input
              type="password"
              placeholder="Mínimo 8 caracteres, incluir letras y números"
              {...getFieldProps("password")}
            />
          </FormField>

          {/* Mostrar errores de validación de contraseña */}
          {errors.password && <Alert>{errors.password}</Alert>}

          <FormField label="Confirmación de contraseña" required>
            <Input
              type="password"
              placeholder="Repita su contraseña"
              {...getFieldProps("confirmPassword")}
            />
          </FormField>

          {/* Mostrar errores de confirmación de contraseña */}
          {errors.confirmPassword && <Alert>{errors.confirmPassword}</Alert>}

          {/* Mostrar errores del servidor */}
          {registrationError && <Alert>{registrationError}</Alert>}

          <Button
            type="submit"
            loading={isSubmitting}
            style={{ width: '100%', marginBottom: '1rem' }}
          >
            Crear cuenta
          </Button>
        </form>

        <BackLink>
          <Link to={ROUTES.LOGIN}>Ya tengo cuenta - Iniciar sesión</Link>
        </BackLink>
      </FormContainer>
    </AppLayout>
  );
};

export default Register;