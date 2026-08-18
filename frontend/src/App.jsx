import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import StudentDetail from "./pages/StudentDetail";
import Predict from "./pages/Predict";
import ModelPerformance from "./pages/ModelPerformance";

export default function App() {
  const [active, setActive] = useState("dashboard");
  const [studentsRiskFilter, setStudentsRiskFilter] = useState("All");
  const [selectedStudent, setSelectedStudent] = useState(null);

  const goToStudents = (riskFilter = "All") => {
    setStudentsRiskFilter(riskFilter);
    setActive("students");
  };

  return (
    <div className="flex min-h-screen" style={{ background: "var(--color-bg)" }}>
      <Sidebar active={active} onNavigate={setActive} />
      <main className="flex-1 px-8 py-8 max-w-6xl">
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
      </main>
      {selectedStudent && (
        <StudentDetail studentId={selectedStudent} onClose={() => setSelectedStudent(null)} />
      )}
    </div>
  );
}
