import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import "./App.css";

const CharacterModel = lazy(() => import("./components/Hero"));
const MainContainer = lazy(() => import("./components/MainContainer"));
const MyWorks = lazy(() => import("./pages/MyWorks"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
import { LoadingProvider } from "./context/LoadingProvider";
import { LanguageProvider, useLang, storedLang } from "./i18n/LanguageProvider";

const Home = () => (
  <LoadingProvider>
    <Suspense>
      <MainContainer>
        <Suspense>
          <CharacterModel />
        </Suspense>
      </MainContainer>
    </Suspense>
  </LoadingProvider>
);

// GSAP's SplitText mutates heading DOM nodes; when the language toggle changes
// that text, React's reconciler can't find the original nodes (removeChild
// errors). Remounting the route subtree on language change rebuilds the DOM
// cleanly. The router + provider sit above this key so URL + lang persist.
const AppRoutes = () => {
  const { lang } = useLang();
  return (
    <div key={lang}>
      <Routes>
        <Route path="/:lang" element={<Home />} />
        <Route
          path="/:lang/myworks"
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <MyWorks />
            </Suspense>
          }
        />
        <Route
          path="/:lang/myworks/:slug"
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <ProjectDetail />
            </Suspense>
          }
        />
        {/* Bare paths (no language prefix) redirect to the stored/default language. */}
        <Route path="/" element={<Navigate to={`/${storedLang()}`} replace />} />
        <Route path="/myworks" element={<Navigate to={`/${storedLang()}/myworks`} replace />} />
        <Route path="/myworks/:slug" element={<LegacyProjectRedirect />} />
        <Route path="*" element={<Navigate to={`/${storedLang()}`} replace />} />
      </Routes>
    </div>
  );
};

// Old /myworks/:slug links → /:lang/myworks/:slug
import { useParams } from "react-router-dom";
const LegacyProjectRedirect = () => {
  const { slug } = useParams();
  return <Navigate to={`/${storedLang()}/myworks/${slug}`} replace />;
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
