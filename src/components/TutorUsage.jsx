import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { loadChatAnalytics } from "../state/chatAnalytics";

const DONUT_COLORS = ["#58cc02", "#ff4b4b"]; // answered (green), not-in-material (red)

function Card({ label, value, sub }) {
  return (
    <div className="tutor-card">
      <div className="tutor-card-value">{value}</div>
      <div className="tutor-card-label">{label}</div>
      {sub ? <div className="tutor-card-sub">{sub}</div> : null}
    </div>
  );
}

// `totalStudents` (optional) is the roster size, used to compute adoption %.
export default function TutorUsage({ totalStudents = 0 }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const shaped = await loadChatAnalytics(totalStudents);
      setData(shaped);
    } catch (err) {
      setError(err?.message || "Couldn't load tutor usage.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalStudents]);

  return (
    <section className="admin-walk-feedback tutor-usage">
      <div className="tutor-usage-head">
        <h2>Tutor usage</h2>
        <button
          type="button"
          className="admin-name-btn"
          onClick={refresh}
          disabled={loading}
        >
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      {error && <p className="chat-error">{error}</p>}

      {!error && data && data.summary.totalQueries === 0 && (
        <p className="admin-empty">
          No tutor questions have been logged yet. Once students use the tutor,
          usage will appear here.
        </p>
      )}

      {!error && data && data.summary.totalQueries > 0 && (
        <>
          {/* Big-number cards */}
          <div className="tutor-cards">
            <Card label="Total questions" value={data.summary.totalQueries} />
            <Card
              label="Students who used it"
              value={data.summary.uniqueStudents}
              sub={
                data.summary.adoptionPct != null
                  ? `${data.summary.adoptionPct}% of ${totalStudents}`
                  : undefined
              }
            />
            <Card label="Chat sessions" value={data.summary.totalSessions} />
            <Card
              label="Avg per session"
              value={data.summary.avgPerSession.toFixed(1)}
            />
          </div>

          {/* Queries per topic */}
          <div className="tutor-chart">
            <h3>Questions by topic</h3>
            <ResponsiveContainer width="100%" height={Math.max(220, data.topics.length * 34)}>
              <BarChart
                data={data.topics}
                layout="vertical"
                margin={{ top: 4, right: 16, bottom: 4, left: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="topic"
                  width={140}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Bar dataKey="queries" fill="#1cb0f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Uses over time */}
          <div className="tutor-chart">
            <h3>Questions over time</h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart
                data={data.daily}
                margin={{ top: 4, right: 16, bottom: 4, left: 0 }}
              >
                <defs>
                  <linearGradient id="tutorArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1cb0f6" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#1cb0f6" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="queries"
                  stroke="#1cb0f6"
                  fill="url(#tutorArea)"
                  name="Questions"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Answered vs not-in-material */}
          <div className="tutor-chart tutor-chart-split">
            <div className="tutor-donut">
              <h3>Answered vs not in material</h3>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={data.answeredSplit}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                  >
                    {data.answeredSplit.map((entry, i) => (
                      <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Content gaps */}
            <div className="tutor-gaps">
              <h3>Content gaps (unanswered by topic)</h3>
              {data.gaps.length === 0 ? (
                <p className="admin-empty">
                  No unanswered questions. The slides are covering what students
                  ask.
                </p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Topic</th>
                      <th>Unanswered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.gaps.map((g) => (
                      <tr key={g.topic}>
                        <td>{g.topic}</td>
                        <td>{g.unanswered}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Per-student usage */}
          <div className="tutor-chart">
            <h3>Usage by student</h3>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Questions</th>
                    <th>Sessions</th>
                    <th>Last used (SGT)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.students.map((s) => (
                    <tr key={s.email}>
                      <td>{s.email}</td>
                      <td>{s.queries}</td>
                      <td>{s.sessions}</td>
                      <td>
                        {s.lastUsed
                          ? String(s.lastUsed).replace("T", " ").slice(0, 16)
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
