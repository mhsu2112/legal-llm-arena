import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<any>(null);
  const [domainPerformance, setDomainPerformance] = useState<any[]>([]);
  const [complexityAnalysis, setComplexityAnalysis] = useState<any[]>([]);
  const [errorFrequency, setErrorFrequency] = useState<any[]>([]);
  const [challengingQuestions, setChallengingQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [
        overviewRes,
        domainRes,
        complexityRes,
        errorRes,
        challengingRes,
      ] = await Promise.all([
        apiClient.getOverview(),
        apiClient.getDomainPerformance(),
        apiClient.getComplexityAnalysis(),
        apiClient.getErrorFrequency(),
        apiClient.getChallengingQuestions(),
      ]);

      setOverview(overviewRes.data);
      setDomainPerformance(domainRes.data);
      setComplexityAnalysis(complexityRes.data);
      setErrorFrequency(errorRes.data);
      setChallengingQuestions(challengingRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading analytics:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">
          Insights into model performance, challenging patterns, and evaluation trends
        </p>
      </div>

      {/* Overview stats */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Active Models"
            value={overview.active_models || 0}
            icon="🤖"
            color="blue"
          />
          <StatCard
            title="Questions"
            value={overview.total_questions || 0}
            icon="❓"
            color="purple"
          />
          <StatCard
            title="Comparisons"
            value={overview.completed_comparisons || 0}
            icon="⚔️"
            color="green"
          />
          <StatCard
            title="Responses"
            value={overview.total_responses || 0}
            icon="💬"
            color="yellow"
          />
          <StatCard
            title="Errors Tracked"
            value={overview.total_errors || 0}
            icon="⚠️"
            color="red"
          />
        </div>
      )}

      {/* Domain Performance */}
      {domainPerformance.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Performance by Legal Domain
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={domainPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="domain"
                angle={-45}
                textAnchor="end"
                height={120}
                interval={0}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total_comparisons" fill="#3b82f6" name="Total Comparisons" />
              <Bar dataKey="unique_questions" fill="#8b5cf6" name="Unique Questions" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Complexity Analysis */}
      {complexityAnalysis.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Performance by Complexity Level
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={complexityAnalysis}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="complexity" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total_comparisons" fill="#10b981" name="Comparisons" />
              <Bar dataKey="ties" fill="#f59e0b" name="Ties" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 text-sm text-gray-600">
            <p>
              Higher tie rates at advanced/expert levels indicate questions where models perform
              similarly or both struggle.
            </p>
          </div>
        </div>
      )}

      {/* Error Frequency */}
      {errorFrequency.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Most Common Error Types
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Error Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Domain
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Frequency
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {errorFrequency.slice(0, 10).map((error, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {error.error_type.replace(/_/g, ' ')}
                    </td>
                    <td className="px-6 py-4">
                      <SeverityBadge severity={error.severity} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{error.domain}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {error.frequency}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Challenging Questions */}
      {challengingQuestions.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Most Challenging Questions
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Questions with highest tie rates or error counts (minimum 3 comparisons)
          </p>
          <div className="space-y-4">
            {challengingQuestions.slice(0, 5).map((q, index) => (
              <div key={q.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 font-medium">
                      {q.content.substring(0, 200)}
                      {q.content.length > 200 ? '...' : ''}
                    </p>
                  </div>
                  <div className="ml-4 flex gap-2">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {q.domain}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                      {q.complexity}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>Comparisons: {q.total_comparisons}</span>
                  <span>Ties: {q.ties}</span>
                  <span>Tie Rate: {(q.tie_rate * 100).toFixed(1)}%</span>
                  <span>Errors: {q.error_count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {domainPerformance.length === 0 &&
        complexityAnalysis.length === 0 &&
        errorFrequency.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500">
              No analytics data available yet. Complete some arena matches to see insights!
            </p>
          </div>
        )}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: string;
  color: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700',
    purple: 'bg-purple-50 text-purple-700',
    green: 'bg-green-50 text-green-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    red: 'bg-red-50 text-red-700',
  };

  return (
    <div className={`rounded-lg shadow-md p-6 ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const colors = {
    critical: 'bg-red-100 text-red-800',
    major: 'bg-orange-100 text-orange-800',
    minor: 'bg-yellow-100 text-yellow-800',
    stylistic: 'bg-gray-100 text-gray-800',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        colors[severity as keyof typeof colors] || colors.minor
      }`}
    >
      {severity}
    </span>
  );
}
