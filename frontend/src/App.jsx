import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Sidebar, { MobileMenuButton } from "./components/Sidebar";
import PageTransition from "./components/PageTransition";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import StudentDetail from "./pages/StudentDetail";
import Predict from "./pages/Predict";
import ModelPerformance from "./pages/ModelPerformance";

export default function App() {
  const [active, setActive] = useState("dashboard");
  const [studentsRiskFilter, setStudentsRiskFilter] = useState("All");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const goToStudents = (riskFilter = "All") => {
    setStudentsRiskFilter(riskFilter);
    setActive("students");
  };

  return (
    <div className="relative flex min-h-screen" style={{ background: "var(--color-bg)" }}>
      <div className="ambient-bg" aria-hidden="true" />
      <Sidebar
        active={active}
        onNavigate={setActive}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />
      <main className="relative z-10 flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-6xl w-full min-w-0">
        <div className="mb-5 lg:hidden">
          <MobileMenuButton onClick={() => setMobileNavOpen(true)} />
        </div>
        <AnimatePresence mode="wait">
          <PageTransition key={active}>
            {active === "dashboard" && <Dashboard onGoToStudents={goToStudents} />}
            {active === "students" && (
              <Students
                key={studentsRiskFilter}
                initialRisk={studentsRiskFilter}
                onSelectStudent={(id) => setSelectedStudent(id)}
              />
            )}
            {active === "predict" && <Predict />}
            {active === "performance" && <ModelPerformance />}
          </PageTransition>
        </AnimatePresence>
      </main>
      {selectedStudent && (
        <StudentDetail studentId={selectedStudent} onClose={() => setSelectedStudent(null)} />
      )}
    </div>
  );
}
