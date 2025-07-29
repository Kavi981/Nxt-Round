import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ThumbsUp, 
  Calendar, 
  Edit3, 
  Trash2,
  Building,
  Save,
  X
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import AnswerSection from '../components/questions/AnswerSection';
import CommentSection from '../components/questions/CommentSection';

interface Question {
  _id: string;
  title: string;
  content: string;
  company: {
    _id: string;
    name: string;
    industry: string;
  };
  author: {
    _id: string;
    name: string;
    avatar: string;
  };
  category: string;
  difficulty: string;
  votes: {
    upvotes: string[];
    downvotes: string[];
  };
  tags: string[];
  createdAt: string;
}

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

interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    name: string;
    avatar: string;
  };
  createdAt: string;
}

const QuestionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { socket } = useSocket();

  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    content: '',
    category: '',
    difficulty: '',
    tags: [] as string[]
  });
  const [userVote, setUserVote] = useState<'upvote' | null>(null);

  useEffect(() => {
    if (id) {
      fetchQuestionDetails();
    }
  }, [id]);

  useEffect(() => {
    if (socket && id) {
      socket.emit('join-question', id);

      socket.on('question-voted', (updatedQuestion) => {
        setQuestion(updatedQuestion);
      });

      socket.on('answer-created', (newAnswer) => {
        setAnswers(prev => [...prev, newAnswer]);
      });

      socket.on('answer-voted', (updatedAnswer) => {
        setAnswers(prev => prev.map(answer => 
          answer._id === updatedAnswer._id ? updatedAnswer : answer
        ));
      });

      socket.on('comment-created', (newComment) => {
        setComments(prev => [...prev, newComment]);
      });

      return () => {
        socket.emit('leave-question', id);
        socket.off('question-voted');
        socket.off('answer-created');
        socket.off('answer-voted');
        socket.off('comment-created');
      };
    }
  }, [socket, id]);

  const fetchQuestionDetails = async () => {
    try {
      const response = await api.get(`/questions/${id}`);
      const { question, answers, comments } = response.data;
      
      setQuestion(question);
      setAnswers(answers);
      setComments(comments);

      // Check user's vote status
      if (user && question) {
        const userId = user.id;
        if (question.votes.upvotes.includes(userId)) {
          setUserVote('upvote');
        } else {
          setUserVote(null);
        }
      }
    } catch (error) {
      console.error('Error fetching question details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async () => {
    if (!isAuthenticated || !question) {
      return;
    }

    try {
      const response = await api.post(`/questions/${question._id}/vote`, { voteType: 'upvote' });
      setQuestion(response.data);
      
      // Update user vote state based on the response
      const userId = user?.id;
      if (userId && response.data.votes.upvotes.includes(userId)) {
        setUserVote('upvote');
      } else {
        setUserVote(null);
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleDelete = async () => {
    if (!question || !window.confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      await api.delete(`/questions/${question._id}`);
      navigate('/questions');
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  const handleEdit = () => {
    if (question) {
      setEditForm({
        title: question.title,
        content: question.content,
        category: question.category,
        difficulty: question.difficulty,
        tags: question.tags
      });
      setIsEditing(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!question) return;

    try {
      const response = await api.put(`/questions/${question._id}`, editForm);
      setQuestion(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating question:', error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'tags') {
      setEditForm(prev => ({
        ...prev,
        tags: value.split(',').map(tag => tag.trim()).filter(tag => tag)
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Aptitude': 'bg-green-100 text-green-800',
      'Coding': 'bg-red-100 text-red-800',
      'Technical HR': 'bg-blue-100 text-blue-800',
      'General HR': 'bg-purple-100 text-purple-800',
      'Behavioral': 'bg-pink-100 text-pink-800',
      'Technical MCQs': 'bg-orange-100 text-orange-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Question not found</h2>
          <p className="text-gray-600 mb-4">The question you're looking for doesn't exist.</p>
          <Link to="/questions" className="text-blue-600 hover:text-blue-700">
            Back to Questions
          </Link>
        </div>
      </div>
    );
  }

  const voteScore = question.votes.upvotes.length;
  const canEdit = user && (user.id === question.author._id || user.role === 'admin');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/questions"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Questions
        </Link>

        {/* Question */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              {/* Tags */}
              <div className="flex items-center space-x-2 mb-3">
                <Link
                  to={`/questions?company=${question.company._id}`}
                  className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full hover:bg-blue-200 transition-colors inline-flex items-center"
                >
                  <Building className="w-3 h-3 mr-1" />
                  {question.company.name}
                </Link>
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${getCategoryColor(question.category)}`}>
                  {question.category}
                </span>
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${getDifficultyColor(question.difficulty)}`}>
                  {question.difficulty}
                </span>
              </div>

              {/* Title */}
              {!isEditing ? (
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  {question.title}
                </h1>
              ) : (
                <input
                  type="text"
                  name="title"
                  value={editForm.title}
                  onChange={handleEditFormChange}
                  className="text-2xl font-bold text-gray-900 mb-4 w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}

              {/* Content */}
              {!isEditing ? (
                <div className="prose max-w-none mb-6">
                  <p className="text-gray-700 whitespace-pre-wrap">{question.content}</p>
                </div>
              ) : (
                <div className="mb-6">
                  <textarea
                    name="content"
                    value={editForm.content}
                    onChange={handleEditFormChange}
                    rows={6}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              )}

              {/* Tags */}
              {question.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {question.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="bg-gray-100 text-gray-700 text-sm px-2 py-1 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Author and Date */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>Posted by {question.author.name}</span>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(question.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {canEdit && (
                  <div className="flex items-center space-x-2">
                    {!isEditing ? (
                      <button 
                        onClick={handleEdit}
                        className="text-blue-600 hover:text-blue-700 p-1"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    ) : (
                      <>
                        <button 
                          onClick={handleSaveEdit}
                          className="text-green-600 hover:text-green-700 p-1"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={handleCancelEdit}
                          className="text-gray-600 hover:text-gray-700 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button 
                      onClick={handleDelete}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Voting */}
            <div className="flex flex-col items-center ml-6 space-y-2">
              <button
                onClick={handleVote}
                className={`p-2 rounded-full transition-colors ${
                  userVote === 'upvote'
                    ? 'bg-green-100 text-green-600'
                    : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                }`}
                disabled={!isAuthenticated}
              >
                <ThumbsUp className="w-5 h-5" />
              </button>
              
              <span className="font-bold text-lg text-gray-900">{voteScore}</span>
              <span className="text-xs text-gray-500">upvotes</span>
            </div>
          </div>
        </div>

        {/* Answers Section */}
        <AnswerSection 
          questionId={question._id}
          answers={answers}
          onAnswerUpdate={setAnswers}
        />

        {/* Comments Section */}
        <CommentSection 
          questionId={question._id}
          comments={comments}
          onCommentUpdate={setComments}
        />
      </div>
    </div>
  );
};

export default QuestionDetail;