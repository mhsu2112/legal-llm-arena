import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import type { LegalQuestion } from '@legal-llm-arena/shared';

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<LegalQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState<LegalQuestion | null>(null);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const response = await apiClient.getQuestions(50, 0);
      setQuestions(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading questions:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading questions...</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Question Bank</h1>
        <p className="text-gray-600">
          Browse and explore legal questions used in the arena
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Question list */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h2 className="font-semibold text-gray-900">All Questions ({questions.length})</h2>
            </div>
            <div className="divide-y divide-gray-200 max-h-[calc(100vh-300px)] overflow-y-auto">
              {questions.map((question) => (
                <button
                  key={question.id}
                  onClick={() => setSelectedQuestion(question)}
                  className={`w-full text-left p-4 hover:bg-gray-50 transition ${
                    selectedQuestion?.id === question.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <p className="text-sm text-gray-900 font-medium line-clamp-2 mb-2">
                    {question.content}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {question.domain}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                      {question.complexity}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Question detail */}
        <div className="lg:col-span-2">
          {selectedQuestion ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Question Details</h2>
                  <button
                    onClick={() => setSelectedQuestion(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Taxonomy */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Taxonomy</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge label="Domain" value={selectedQuestion.domain} color="blue" />
                  {selectedQuestion.subdomain && (
                    <Badge label="Subdomain" value={selectedQuestion.subdomain} color="blue" />
                  )}
                  <Badge
                    label="Jurisdiction"
                    value={selectedQuestion.jurisdiction}
                    color="green"
                  />
                  <Badge
                    label="Complexity"
                    value={selectedQuestion.complexity}
                    color="purple"
                  />
                  <Badge label="Task Type" value={selectedQuestion.taskType} color="yellow" />
                </div>
              </div>

              {/* Question content */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Question</h3>
                <p className="text-gray-900 whitespace-pre-wrap">{selectedQuestion.content}</p>
              </div>

              {/* Fact pattern */}
              {selectedQuestion.factPattern && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Fact Pattern</h3>
                  <div className="bg-gray-50 rounded border border-gray-200 p-4">
                    <p className="text-gray-700">{selectedQuestion.factPattern}</p>
                  </div>
                </div>
              )}

              {/* Required reasoning */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Required Reasoning Types
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedQuestion.requiredReasoningTypes.map((type) => (
                    <span
                      key={type}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                    >
                      {type.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>

              {/* Required cognitive skills */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Required Cognitive Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedQuestion.requiredCognitiveSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800"
                    >
                      {skill.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tags */}
              {selectedQuestion.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedQuestion.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-gray-500">
                Select a question from the list to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Badge({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    purple: 'bg-purple-100 text-purple-800',
    yellow: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium ${
        colorClasses[color as keyof typeof colorClasses]
      }`}
    >
      <span className="font-semibold mr-1">{label}:</span> {value.replace(/_/g, ' ')}
    </span>
  );
}
