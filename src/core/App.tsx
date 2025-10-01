import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Login, RecoverPassword, Register, ResetPassword, Profile } from "../features/auth/pages";
import Home from "./Home";
import BuildDefault from "./BuildDefault";
import { CreateEditorialNumber, ModifyEditorialNumber } from "../features/editorial-numbers/pages";
import { CreateResearcher, ModifyResearcher } from "../features/researchers/pages";
import { ManageUsers } from "../features/users/pages";
import { CreateArticle } from "../features/articles/pages";
import { CreateThematicLine, ModifyThematicLine, DeactivateThematicLine } from "../features/thematic-lines/pages";
import { ROUTES } from "../shared/constants";
import { useAuth } from "../features/auth/hooks";
import ProtectedRoute from "../shared/components/ProtectedRoute";

const App: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route
          path={ROUTES.HOME}
          element={
            isAuthenticated ?
              <Navigate to={ROUTES.DASHBOARD} replace /> :
              <Navigate to={ROUTES.LOGIN} replace />
          }
        />
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route
          path={ROUTES.DASHBOARD}
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route path={ROUTES.RECOVER_PASSWORD} element={<RecoverPassword />} />
        <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
        <Route path={ROUTES.REGISTER} element={<Register />} />
        <Route
          path={ROUTES.BUILD}
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'EDITOR', 'ASISTENTE']}>
              <BuildDefault />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.CREATE_EDITORIAL_NUMBER}
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <CreateEditorialNumber />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.MODIFY_EDITORIAL_NUMBER}
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <ModifyEditorialNumber />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.CREATE_RESEARCHER}
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'EDITOR']}>
              <CreateResearcher />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.MODIFY_RESEARCHER}
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'EDITOR']}>
              <ModifyResearcher />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.MANAGE_USERS}
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <ManageUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.PROFILE}
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'EDITOR', 'ASISTENTE']}>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.CREATE_ARTICLE}
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'EDITOR']}>
              <CreateArticle />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.CREATE_THEMATIC_LINE}
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <CreateThematicLine />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.MODIFY_THEMATIC_LINE}
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <ModifyThematicLine />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.DEACTIVATE_THEMATIC_LINE}
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <DeactivateThematicLine />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;