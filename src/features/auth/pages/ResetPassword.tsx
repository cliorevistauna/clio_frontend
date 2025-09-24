import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useForm } from "../../../shared/hooks";
import { AppLayout, FormContainer } from "../../../shared/components/layout";
import { Button, Input, FormField } from "../../../shared/components/ui";
import { ROUTES } from "../../../shared/constants";
import { authService } from "../services/authService";

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

const ResetPassword: React.FC = () => {
  const { uidb64, token } = useParams<{ uidb64: string; token: string }>();
  const navigate = useNavigate();
  const [resetComplete, setResetComplete] = useState(false);
  const [resetError, setResetError] = useState("");
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  useEffect(() => {
    // Verificar si tenemos token y uidb64 válidos
    if (!token || !uidb64) {
      setTokenValid(false);
      setResetError("Enlace de recuperación inválido o expirado.");
    } else {
      setTokenValid(true);
    }
  }, [token, uidb64]);

  const {
    getFieldProps,
    handleSubmit,
    isSubmitting,
    errors
  } = useForm({
    initialValues: {
      password: "",
      confirmPassword: ""
    },
    validate: (values) => {
      const errors: any = {};

      // Validación de contraseña mínima (RF-003)
      if (values.password.length < 8) {
        errors.password = "La contraseña debe tener al menos 8 caracteres.";
      }

      // Validación de confirmación de contraseña (RF-003)
      if (values.password !== values.confirmPassword) {
        errors.confirmPassword = "Las contraseñas no coinciden.";
      }

      return errors;
    },
    onSubmit: async (values) => {
      try {
        setResetError("");
        await authService.confirmPasswordReset({
          uidb64: uidb64!,
          token: token!,
          new_password: values.password,
          confirm_password: values.confirmPassword
        });
        setResetComplete(true);
      } catch (error) {
        setResetError(error instanceof Error ? error.message : "Error al restablecer la contraseña");
      }
    }
  });

  // Si el enlace es inválido
  if (tokenValid === false) {
    return (
      <AppLayout>
        <FormContainer>
          <Alert>
            {resetError || "Enlace de recuperación inválido o expirado."}
          </Alert>
          <BackLink>
            <Link to={ROUTES.RECOVER_PASSWORD}>Solicitar nuevo enlace</Link>
          </BackLink>
        </FormContainer>
      </AppLayout>
    );
  }

  // Si la contraseña se restableció exitosamente
  if (resetComplete) {
    return (
      <AppLayout>
        <FormContainer>
          <Alert variant="success">
            Contraseña actualizada exitosamente. Puede iniciar sesión.
          </Alert>
          <BackLink>
            <Link to={ROUTES.LOGIN}>Iniciar sesión</Link>
          </BackLink>
        </FormContainer>
      </AppLayout>
    );
  }

  // Formulario de restablecimiento de contraseña
  return (
    <AppLayout>
      <FormContainer>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>
          Restablecer Contraseña
        </h2>
        <form onSubmit={handleSubmit}>
          <FormField label="Nueva contraseña" required>
            <Input
              type="password"
              placeholder="Ingrese su nueva contraseña"
              {...getFieldProps("password")}
            />
          </FormField>

          {errors.password && <Alert>{errors.password}</Alert>}

          <FormField label="Confirmar nueva contraseña" required>
            <Input
              type="password"
              placeholder="Confirme su nueva contraseña"
              {...getFieldProps("confirmPassword")}
            />
          </FormField>

          {errors.confirmPassword && <Alert>{errors.confirmPassword}</Alert>}

          {/* Mostrar errores del servidor */}
          {resetError && <Alert>{resetError}</Alert>}

          <Button
            type="submit"
            loading={isSubmitting}
            style={{ width: '100%', marginBottom: '1rem' }}
          >
            Actualizar contraseña
          </Button>
        </form>

        <BackLink>
          <Link to={ROUTES.LOGIN}>Volver al inicio de sesión</Link>
        </BackLink>
      </FormContainer>
    </AppLayout>
  );
};

export default ResetPassword;