import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import QuestionCard from '../components/questions/QuestionCard';
import CreateQuestionModal from '../components/questions/CreateQuestionModal';
import CompanySelector from '../components/questions/CompanySelector';

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
  };
  tags: string[];
  createdAt: string;
}

const Questions: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  const { isAuthenticated } = useAuth();

  const categories = ['', 'Aptitude', 'Coding', 'Technical MCQs', 'Technical HR', 'General HR', 'Behavioral'];
  const difficulties = ['', 'Easy', 'Medium', 'Hard'];
  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'popular', label: 'Most Popular' }
  ];

  useEffect(() => {
    // Initialize filters from URL params
    const company = searchParams.get('company') || '';
    const search = searchParams.get('search') || '';
    
    setSelectedCompany(company);
    setSearchQuery(search);
  }, [searchParams]);

  useEffect(() => {
    fetchQuestions();
  }, [selectedCompany, searchQuery, selectedCategory, selectedDifficulty, sortBy]);

  const fetchQuestions = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCompany) params.append('company', selectedCompany);
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedDifficulty) params.append('difficulty', selectedDifficulty);
      if (sortBy) params.append('sort', sortBy);

      const response = await api.get(`/questions?${params.toString()}`);
      setQuestions(response.data);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionCreated = (newQuestion: Question) => {
    setQuestions(prev => [newQuestion, ...prev]);
    setIsCreateModalOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchQuestions();
  };

  // Add a simple skeleton loader component
  const SkeletonLoader = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="animate-pulse bg-gray-200 h-20 rounded-md" />
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Questions</h1>
            <p className="text-gray-600">
              {Array.isArray(questions) ? questions.length : 0} questions from the community
            </p>
          </div>
          {isAuthenticated && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 md:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Post Question
            </button>
          )}
        </div>

        {/* Company Selector */}
        <CompanySelector
          selectedCompany={selectedCompany}
          onCompanyChange={setSelectedCompany}
        />

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <form onSubmit={handleSearch} className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </form>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.filter(Boolean).map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Difficulties</option>
            {difficulties.filter(Boolean).map(difficulty => (
              <option key={difficulty} value={difficulty}>{difficulty}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {/* Questions List */}
        {isLoading ? (
          <SkeletonLoader />
        ) : (
          <div className="space-y-4">
            {questions.map((question) => (
              <QuestionCard key={question._id} question={question} />
            ))}
          </div>
        )}

        {/* Create Question Modal */}
        {isCreateModalOpen && (
          <CreateQuestionModal
            onClose={() => setIsCreateModalOpen(false)}
            onQuestionCreated={handleQuestionCreated}
            preselectedCompany={selectedCompany}
          />
        )}
      </div>
    </div>
  );
};

export default Questions;