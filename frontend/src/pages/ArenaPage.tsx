import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import type {
  GetArenaMatchResponse,
  LLMResponse,
  LegalQuestion,
  ErrorType,
  ErrorSeverity,
  EvaluationCriterion,
} from '@legal-llm-arena/shared';

type MatchState = 'idle' | 'loading' | 'evaluating' | 'submitting' | 'completed';

export default function ArenaPage() {
  const [matchState, setMatchState] = useState<MatchState>('idle');
  const [match, setMatch] = useState<GetArenaMatchResponse | null>(null);
  const [selectedWinner, setSelectedWinner] = useState<string | null>(null);
  const [showModels, setShowModels] = useState(false);
  const [customQuestion, setCustomQuestion] = useState('');
  const [urls, setUrls] = useState<string[]>(['']);
  const [availableQuestions, setAvailableQuestions] = useState<LegalQuestion[]>([]);

  // Load available questions on mount
  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const response = await apiClient.getQuestions(20, 0);
      setAvailableQuestions(response.data);
    } catch (error) {
      console.error('Error loading questions:', error);
    }
  };

  const startNewMatch = async () => {
    if (!customQuestion.trim()) {
      alert('Please enter a legal question');
      return;
    }

    setMatchState('loading');
    setSelectedWinner(null);
    setShowModels(false);

    try {
      // Filter out empty URLs
      const validUrls = urls.filter(url => url.trim().length > 0);
      const response = await apiClient.createMatch(
        customQuestion.trim(),
        validUrls.length > 0 ? validUrls : undefined
      );

      // Check if either response is a mock response
      const isMockA = response.data.responseA.content.includes('Mock legal analysis') ||
                      response.data.responseA.content.includes('This is a placeholder response');
      const isMockB = response.data.responseB.content.includes('Mock legal analysis') ||
                      response.data.responseB.content.includes('This is a placeholder response');

      if (isMockA || isMockB) {
        console.error('One or both API calls failed, received mock response');
        alert('One or both models failed to generate a response. This usually means an API call failed. Please try again.');
        setMatchState('idle');
        return;
      }

      setMatch(response.data);
      setMatchState('evaluating');
    } catch (error) {
      console.error('Error creating match:', error);
      alert('Failed to create match. Please try again.');
      setMatchState('idle');
    }
  };

  const submitEvaluation = async () => {
    if (!match) return;

    setMatchState('submitting');

    try {
      await apiClient.submitComparison({
        comparisonId: match.comparisonId,
        questionId: match.question.id,
        modelAId: match.modelAId,
        modelBId: match.modelBId,
        winnerId: selectedWinner || undefined,
      });

      setMatchState('completed');
      setShowModels(true);
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      alert('Failed to submit evaluation. Please try again.');
      setMatchState('evaluating');
    }
  };

  const resetToIdle = () => {
    setMatchState('idle');
    setMatch(null);
    setSelectedWinner(null);
    setShowModels(false);
    setCustomQuestion('');
    setUrls(['']);
  };

  const addUrlField = () => {
    setUrls([...urls, '']);
  };

  const removeUrlField = (index: number) => {
    const newUrls = urls.filter((_, i) => i !== index);
    setUrls(newUrls.length === 0 ? [''] : newUrls);
  };

  const updateUrl = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  return (
    <div className="px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Legal LLM Arena</h1>
        <p className="text-lg text-gray-600">
          Compare two anonymous legal AI responses and vote for the better one
        </p>
      </div>

      {/* Question input form */}
      {matchState === 'idle' && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Enter Your Legal Question
            </h2>

            <textarea
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder="Type your legal question here... (e.g., What are the essential elements of a valid contract? or Can a landlord enter a rental property without notice?)"
              className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-4"
            />

            {/* URL inputs section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reference URLs (optional):
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Add URLs to legal documents, cases, or articles that the models should reference when answering your question.
              </p>
              {urls.map((url, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => updateUrl(index, e.target.value)}
                    placeholder="https://example.com/legal-document"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {urls.length > 1 && (
                    <button
                      onClick={() => removeUrlField(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      type="button"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addUrlField}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                type="button"
              >
                + Add another URL
              </button>
            </div>

            {/* Sample questions dropdown */}
            {availableQuestions.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or select from sample questions:
                </label>
                <select
                  onChange={(e) => {
                    const question = availableQuestions.find(q => q.id === e.target.value);
                    if (question) {
                      setCustomQuestion(question.content);
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  defaultValue=""
                >
                  <option value="" disabled>Choose a sample question...</option>
                  {availableQuestions.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.content.substring(0, 100)}...
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={startNewMatch}
              disabled={!customQuestion.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg text-lg transition"
            >
              Start Match
            </button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {matchState === 'loading' && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Generating responses...</p>
        </div>
      )}

      {/* Question and responses */}
      {match && (matchState === 'evaluating' || matchState === 'submitting' || matchState === 'completed') && (
        <div>
          {/* Question */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Legal Question</h2>
              <div className="flex gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {match.question.domain}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {match.question.complexity}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {match.question.jurisdiction}
                </span>
              </div>
            </div>
            <p className="text-gray-700 text-lg whitespace-pre-wrap">{match.question.content}</p>
            {match.question.factPattern && (
              <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-1">Reference Context:</p>
                <p className="text-gray-600 text-sm">
                  {match.question.factPattern.split(/\s+/).slice(0, 20).join(' ')}
                  {match.question.factPattern.split(/\s+/).length > 20 ? '...' : ''}
                </p>
              </div>
            )}
          </div>

          {/* Side-by-side responses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Response A */}
            <ResponseCard
              label="Response A"
              response={match.responseA}
              modelId={match.modelAId}
              isSelected={selectedWinner === match.modelAId}
              isDisabled={matchState !== 'evaluating'}
              showModel={showModels}
              onSelect={() => setSelectedWinner(match.modelAId)}
            />

            {/* Response B */}
            <ResponseCard
              label="Response B"
              response={match.responseB}
              modelId={match.modelBId}
              isSelected={selectedWinner === match.modelBId}
              isDisabled={matchState !== 'evaluating'}
              showModel={showModels}
              onSelect={() => setSelectedWinner(match.modelBId)}
            />
          </div>

          {/* Action buttons */}
          {matchState === 'evaluating' && (
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setSelectedWinner(null)}
                disabled={selectedWinner === null}
                className={`px-6 py-3 rounded-lg font-medium transition ${
                  selectedWinner === null
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                It's a Tie
              </button>
              <button
                onClick={submitEvaluation}
                disabled={selectedWinner === null && selectedWinner !== null}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition"
              >
                Submit Evaluation
              </button>
            </div>
          )}

          {matchState === 'submitting' && (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Submitting...</p>
            </div>
          )}

          {matchState === 'completed' && (
            <div className="text-center">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-green-800 font-medium">✓ Evaluation submitted successfully!</p>
              </div>
              <button
                onClick={resetToIdle}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition"
              >
                Start Another Match
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface ResponseCardProps {
  label: string;
  response: LLMResponse;
  modelId: string;
  isSelected: boolean;
  isDisabled: boolean;
  showModel: boolean;
  onSelect: () => void;
}

function ResponseCard({
  label,
  response,
  modelId,
  isSelected,
  isDisabled,
  showModel,
  onSelect,
}: ResponseCardProps) {
  return (
    <div
      onClick={isDisabled ? undefined : onSelect}
      className={`bg-white rounded-lg shadow-md p-6 transition cursor-pointer ${
        isSelected
          ? 'ring-4 ring-blue-500 shadow-lg'
          : 'hover:shadow-lg hover:ring-2 hover:ring-gray-300'
      } ${isDisabled ? 'cursor-default' : ''}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
        {showModel && (
          <span className="text-sm font-mono text-gray-600 bg-gray-100 px-3 py-1 rounded">
            {modelId.split('-')[0]}...
          </span>
        )}
      </div>
      <div className="prose prose-sm max-w-none">
        <p className="text-gray-700 whitespace-pre-wrap">{response.content}</p>
      </div>
      {response.latencyMs && (
        <div className="mt-4 text-xs text-gray-500">
          Generated in {(response.latencyMs / 1000).toFixed(2)}s
        </div>
      )}
    </div>
  );
}
