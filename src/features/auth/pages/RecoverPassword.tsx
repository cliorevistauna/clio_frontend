import React, { useState } from "react";
import { Form, Button, Container, Row, Col, Alert } from "react-bootstrap";

const RecoverPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      alert("Por favor, introduce un correo válido.");
      return;
    }

    setSubmitted(true);
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col md={6}>
          <h2>Recuperar Contraseña</h2>
          {!submitted ? (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Correo electrónico</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Introduce tu correo"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>
              <Button variant="primary" type="submit" className="w-100">
                Enviar enlace de recuperación
              </Button>
            </Form>
          ) : (
            <Alert variant="success" className="mt-3">
              Hemos enviado un enlace de recuperación a tu correo.
            </Alert>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default RecoverPassword;