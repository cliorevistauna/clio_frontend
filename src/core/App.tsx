import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Login, RecoverPassword, Register } from "../features/auth/pages";
import Home from "./Home";
import BuildDefault from "./BuildDefault";
import { CreateEditorialNumber } from "../features/editorial-numbers/pages";
import { CreateResearcher } from "../features/researchers/pages";
import { ROUTES } from "../shared/constants";
import { useAuth } from "../features/auth/hooks";

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
        <Route path={ROUTES.DASHBOARD} element={<Home />} />
        <Route path={ROUTES.RECOVER_PASSWORD} element={<RecoverPassword />} />
        <Route path={ROUTES.REGISTER} element={<Register />} />
        <Route path={ROUTES.BUILD} element={<BuildDefault />} />
        <Route path={ROUTES.CREATE_EDITORIAL_NUMBER} element={<CreateEditorialNumber />} />
        <Route path={ROUTES.CREATE_RESEARCHER} element={<CreateResearcher />} />
      </Routes>
    </Router>
  );
};

export default App;