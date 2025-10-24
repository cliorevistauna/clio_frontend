import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Login, RecoverPassword, Register, ResetPassword, Profile } from "../features/auth/pages";
import Home from "./Home";
import BuildDefault from "./BuildDefault";
import { ROUTES } from "../shared/constants";
import { useAuth } from "../features/auth/hooks";
import ProtectedRoute from "../shared/components/ProtectedRoute";
import { Skeleton } from "../shared/components/Skeleton";
import { ViewModeProvider } from "../shared/contexts/ViewModeContext";
import "./App.css";

// Lazy loading de componentes pesados
const CreateEditorialNumber = lazy(() => import("../features/editorial-numbers/pages").then(m => ({ default: m.CreateEditorialNumber })));
const ModifyEditorialNumber = lazy(() => import("../features/editorial-numbers/pages").then(m => ({ default: m.ModifyEditorialNumber })));
const CreateResearcher = lazy(() => import("../features/researchers/pages").then(m => ({ default: m.CreateResearcher })));
const ModifyResearcher = lazy(() => import("../features/researchers/pages").then(m => ({ default: m.ModifyResearcher })));
const ManageUsers = lazy(() => import("../features/users/pages").then(m => ({ default: m.ManageUsers })));
const CreateArticle = lazy(() => import("../features/articles/pages").then(m => ({ default: m.CreateArticle })));
const UpdateArticle = lazy(() => import("../features/articles/pages").then(m => ({ default: m.UpdateArticle })));
const ModifyArticle = lazy(() => import("../features/articles/pages").then(m => ({ default: m.ModifyArticle })));
const CreateThematicLine = lazy(() => import("../features/thematic-lines/pages").then(m => ({ default: m.CreateThematicLine })));
const ModifyThematicLine = lazy(() => import("../features/thematic-lines/pages").then(m => ({ default: m.ModifyThematicLine })));
const DeactivateThematicLine = lazy(() => import("../features/thematic-lines/pages").then(m => ({ default: m.DeactivateThematicLine })));
const CreateLanguage = lazy(() => import("../features/languages/pages").then(m => ({ default: m.CreateLanguage })));
const ModifyLanguage = lazy(() => import("../features/languages/pages").then(m => ({ default: m.ModifyLanguage })));
const EvaluatorHistoryReport = lazy(() => import("../features/reports/pages").then(m => ({ default: m.EvaluatorHistoryReport })));
const EvaluatorsByThemeReport = lazy(() => import("../features/reports/pages").then(m => ({ default: m.EvaluatorsByThemeReport })));
const EvaluatorWorkloadReport = lazy(() => import("../features/reports/pages").then(m => ({ default: m.EvaluatorWorkloadReport })));
const InvitationsByIssueReport = lazy(() => import("../features/reports/pages").then(m => ({ default: m.InvitationsByIssueReport })));
const ParticipationByArticleReport = lazy(() => import("../features/reports/pages").then(m => ({ default: m.ParticipationByArticleReport })));
const PreviousParticipationReport = lazy(() => import("../features/reports/pages").then(m => ({ default: m.PreviousParticipationReport })));

const App: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <ViewModeProvider>
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
              <Suspense fallback={<Skeleton variant="page" />}>
                <CreateEditorialNumber />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.MODIFY_EDITORIAL_NUMBER}
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <Suspense fallback={<Skeleton variant="page" />}>
                <ModifyEditorialNumber />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.CREATE_RESEARCHER}
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'EDITOR']}>
              <Suspense fallback={<Skeleton variant="page" />}>
                <CreateResearcher />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.MODIFY_RESEARCHER}
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'EDITOR']}>
              <Suspense fallback={<Skeleton variant="page" />}>
                <ModifyResearcher />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.MANAGE_USERS}
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <Suspense fallback={<Skeleton variant="page" />}>
                <ManageUsers />
              </Suspense>
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
              <Suspense fallback={<Skeleton variant="page" />}>
                <CreateArticle />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.MODIFY_ARTICLE}
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'EDITOR']}>
              <Suspense fallback={<Skeleton variant="page" />}>
                <ModifyArticle />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.EDIT_ARTICLE}
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'EDITOR']}>
              <Suspense fallback={<Skeleton variant="page" />}>
                <UpdateArticle />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.CREATE_THEMATIC_LINE}
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <Suspense fallback={<Skeleton variant="page" />}>
                <CreateThematicLine />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.MODIFY_THEMATIC_LINE}
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <Suspense fallback={<Skeleton variant="page" />}>
                <ModifyThematicLine />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.DEACTIVATE_THEMATIC_LINE}
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <Suspense fallback={<Skeleton variant="page" />}>
                <DeactivateThematicLine />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.CREATE_LANGUAGE}
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <Suspense fallback={<Skeleton variant="page" />}>
                <CreateLanguage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.MODIFY_LANGUAGE}
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <Suspense fallback={<Skeleton variant="page" />}>
                <ModifyLanguage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.EVALUATOR_HISTORY_REPORT}
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'EDITOR', 'ASISTENTE']}>
              <Suspense fallback={<Skeleton variant="page" />}>
                <EvaluatorHistoryReport />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.EVALUATORS_BY_THEME_REPORT}
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'EDITOR', 'ASISTENTE']}>
              <Suspense fallback={<Skeleton variant="page" />}>
                <EvaluatorsByThemeReport />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.EVALUATOR_WORKLOAD_REPORT}
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'EDITOR', 'ASISTENTE']}>
              <Suspense fallback={<Skeleton variant="page" />}>
                <EvaluatorWorkloadReport />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.INVITATIONS_BY_ISSUE_REPORT}
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'EDITOR', 'ASISTENTE']}>
              <Suspense fallback={<Skeleton variant="page" />}>
                <InvitationsByIssueReport />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.PARTICIPATION_BY_ARTICLE_REPORT}
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'EDITOR', 'ASISTENTE']}>
              <Suspense fallback={<Skeleton variant="page" />}>
                <ParticipationByArticleReport />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.PREVIOUS_PARTICIPATION_REPORT}
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'EDITOR', 'ASISTENTE']}>
              <Suspense fallback={<Skeleton variant="page" />}>
                <PreviousParticipationReport />
              </Suspense>
            </ProtectedRoute>
          }
        />
        </Routes>
      </Router>
    </ViewModeProvider>
  );
};

export default App;