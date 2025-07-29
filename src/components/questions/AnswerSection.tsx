import React, { useState } from 'react';
import { MessageSquare, ThumbsUp, Trash2, Calendar } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

interface Answer {
  _id: string;
  content: string;
  author: {
    _id: string;
    name: string;
    avatar: string;
  };
  votes: {
    upvotes: string[];
    downvotes: string[];
  };
  createdAt: string;
}

interface AnswerSectionProps {
  questionId: string;
  answers: Answer[];
  onAnswerUpdate: (answers: Answer[]) => void;
}

const AnswerSection: React.FC<AnswerSectionProps> = ({ questionId, answers, onAnswerUpdate }) => {
  const { user, isAuthenticated } = useAuth();
  const [newAnswer, setNewAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedAnswers, setExpandedAnswers] = useState<Set<string>>(new Set());

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnswer.trim() || !isAuthenticated) return;

    setIsSubmitting(true);
    try {
      const response = await api.post('/answers', {
        content: newAnswer,
        question: questionId
      });
      
      onAnswerUpdate([...answers, response.data]);
      setNewAnswer('');
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVoteAnswer = async (answerId: string) => {
    if (!isAuthenticated) return;

    try {
      const response = await api.post(`/answers/${answerId}/vote`, { voteType: 'upvote' });
      onAnswerUpdate(answers.map(answer => 
        answer._id === answerId ? response.data : answer
      ));
    } catch (error) {
      console.error('Error voting on answer:', error);
    }
  };

  const getUserVote = (answer: Answer) => {
    if (!user) return null;
    const userId = user.id;
    if (answer.votes && Array.isArray(answer.votes.upvotes) && answer.votes.upvotes.includes(userId)) return 'upvote';
    return null;
  };

  const toggleExpanded = (answerId: string) => {
    const newExpanded = new Set(expandedAnswers);
    if (newExpanded.has(answerId)) {
      newExpanded.delete(answerId);
    } else {
      newExpanded.add(answerId);
    }
    setExpandedAnswers(newExpanded);
  };

  const truncateContent = (content: string, maxLength: number = 300) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const handleDeleteAnswer = async (answerId: string) => {
    if (!window.confirm('Are you sure you want to delete this answer?')) return;

    try {
      await api.delete(`/answers/${answerId}`);
      onAnswerUpdate(answers.filter(answer => answer._id !== answerId));
    } catch (error) {
      console.error('Error deleting answer:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <MessageSquare className="w-5 h-5 mr-2" />
        Answers ({Array.isArray(answers) ? answers.length : 0})
      </h2>

      {/* Answer Form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmitAnswer} className="mb-8">
          <textarea
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            placeholder="Share your answer or experience..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <div className="flex justify-end mt-3">
            <button
              type="submit"
              disabled={!newAnswer.trim() || isSubmitting}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Answer'}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8 text-center">
          <p className="text-gray-600">
            <a href="/login" className="text-blue-600 hover:text-blue-700">Login</a> to share your answer
          </p>
        </div>
      )}

      {/* Answers List */}
      {Array.isArray(answers) && answers.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No answers yet. Be the first to share your experience!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {answers.map((answer) => {
            const voteScore = answer.votes && Array.isArray(answer.votes.upvotes) ? answer.votes.upvotes.length : 0;
            const userVote = getUserVote(answer);
            const isExpanded = expandedAnswers.has(answer._id);
            const shouldTruncate = answer.content.length > 300;
            const canEdit = user && (user.id === answer.author._id || user.role === 'admin');

            return (
              <div key={answer._id} className="border-l-4 border-blue-100 pl-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="prose max-w-none mb-4">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {shouldTruncate && !isExpanded 
                          ? truncateContent(answer.content)
                          : answer.content
                        }
                      </p>
                      {shouldTruncate && (
                        <button
                          onClick={() => toggleExpanded(answer._id)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2"
                        >
                          {isExpanded ? 'Read less' : 'Read more'}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>{answer.author.name}</span>
                        <span>•</span>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(answer.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {canEdit && (
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleDeleteAnswer(answer._id)}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Answer Voting */}
                  <div className="flex flex-col items-center ml-6 space-y-1">
                    <button
                      onClick={() => handleVoteAnswer(answer._id)}
                      className={`p-1 rounded transition-colors ${
                        userVote === 'upvote'
                          ? 'bg-green-100 text-green-600'
                          : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                      }`}
                      disabled={!isAuthenticated}
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    
                    <span className="text-sm font-medium text-gray-900">{voteScore}</span>
                    
                    <span className="text-xs text-gray-500">upvotes</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AnswerSection;