const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

async function handle(res) {
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body}`);
  }
  return res.json();
}

export async function getStats() {
  return handle(await fetch(`${API_BASE}/api/stats`));
}

export async function getStudents({ search = "", risk = "all", sortBy = "risk_probability", order = "desc" } = {}) {
  const params = new URLSearchParams({ sort_by: sortBy, order });
  if (search) params.set("search", search);
  if (risk && risk !== "all") params.set("risk", risk);
  return handle(await fetch(`${API_BASE}/api/students?${params.toString()}`));
}

export async function getStudent(studentId) {
  return handle(await fetch(`${API_BASE}/api/students/${studentId}`));
}

export async function predictStudent(payload) {
  return handle(
    await fetch(`${API_BASE}/api/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
  );
}

export async function getModelPerformance() {
  return handle(await fetch(`${API_BASE}/api/model/performance`));
}

export { API_BASE };
