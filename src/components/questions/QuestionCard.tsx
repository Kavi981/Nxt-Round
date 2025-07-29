import React from 'react';
import { Link } from 'react-router-dom';
import { ThumbsUp, Calendar } from 'lucide-react';

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

interface QuestionCardProps {
  question: Question;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question }) => {
  const voteScore = question.votes.upvotes.length;

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

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Tags */}
          <div className="flex items-center space-x-2 mb-3">
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
              {question.company.name}
            </span>
            <span className={`text-xs font-medium px-2 py-1 rounded ${getCategoryColor(question.category)}`}>
              {question.category}
            </span>
            <span className={`text-xs font-medium px-2 py-1 rounded ${getDifficultyColor(question.difficulty)}`}>
              {question.difficulty}
            </span>
          </div>

          {/* Title */}
          <Link 
            to={`/questions/${question._id}`}
            className="block group"
          >
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
              {question.title}
            </h3>
          </Link>

          {/* Content Preview */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {question.content}
          </p>

          {/* Tags */}
          {question.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {question.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Author and Date */}
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <span>{question.author.name}</span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(question.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Vote Score */}
        <div className="flex flex-col items-center ml-6">
          {/* In the UI, only show upvotes */}
          <div className="flex items-center space-x-1 text-sm">
            <ThumbsUp className="w-4 h-4 text-green-600" />
            <span className="font-medium text-gray-900">{voteScore}</span>
          </div>
          <span className="text-xs text-gray-500">upvotes</span>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;