import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import "./App.css";

const CharacterModel = lazy(() => import("./components/Hero"));
const MainContainer = lazy(() => import("./components/MainContainer"));
const MyWorks = lazy(() => import("./pages/MyWorks"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
import { LoadingProvider } from "./context/LoadingProvider";
import { LanguageProvider, useLang } from "./i18n/LanguageProvider";

// GSAP's SplitText mutates heading DOM nodes; when the language toggle changes
// that text, React's reconciler can't find the original nodes (removeChild
// errors). Remounting the whole route subtree on language change rebuilds the
// DOM cleanly. The router and provider sit above this key so URL + lang persist.
const AppRoutes = () => {
  const { lang } = useLang();
  return (
    <div key={lang}>
      <Routes>
        <Route
          path="/"
          element={
            <LoadingProvider>
              <Suspense>
                <MainContainer>
                  <Suspense>
                    <CharacterModel />
                  </Suspense>
                </MainContainer>
              </Suspense>
            </LoadingProvider>
          }
        />
        <Route
          path="/myworks"
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <MyWorks />
            </Suspense>
          }
        />
        <Route
          path="/myworks/:slug"
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <ProjectDetail />
            </Suspense>
          }
        />
      </Routes>
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AppRoutes />
        <Analytics />
        <SpeedInsights />
      </LanguageProvider>
    </BrowserRouter>
  );
};

export default App;
