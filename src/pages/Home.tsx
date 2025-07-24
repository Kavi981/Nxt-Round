import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Users, Building, MessageSquare } from 'lucide-react';
import api from '../utils/api';

interface Question {
  _id: string;
  title: string;
  content: string;
  company: {
    name: string;
    industry: string;
  };
  author: {
    name: string;
    avatar: string;
  };
  votes: {
    upvotes: string[];
    downvotes: string[];
  };
  category: string;
  createdAt: string;
}

const Home: React.FC = () => {
  const [topQuestions, setTopQuestions] = useState<Question[]>([]);
  const [stats, setStats] = useState<{ users: number; companies: number; questions: number } | null>(null);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);

  useEffect(() => {
    setIsLoadingQuestions(true);
    Promise.all([
      api.get('/stats'),
      api.get('/questions/top-voted')
    ]).then(([statsRes, questionsRes]) => {
      setStats(statsRes.data);
      setTopQuestions(questionsRes.data);
    }).catch((error) => {
      console.error('Error fetching home data:', error);
    }).finally(() => {
      setIsLoadingQuestions(false);
    });
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-emerald-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Ace Your Next Interview with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                Nxt Round
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Join thousands of job seekers sharing real interview experiences. 
              Get company-specific questions, expert answers, and insider tips.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/questions"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-flex items-center justify-center"
              >
                Explore Questions
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/companies"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Browse Companies
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats && (
              <>
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4`}>
                    <Users className={`w-8 h-8 text-blue-600`} />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stats.users}</div>
                  <div className="text-gray-600">Active Users</div>
                </div>
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4`}>
                    <Building className={`w-8 h-8 text-emerald-600`} />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stats.companies}</div>
                  <div className="text-gray-600">Companies</div>
                </div>
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4`}>
                    <MessageSquare className={`w-8 h-8 text-purple-600`} />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stats.questions}</div>
                  <div className="text-gray-600">Questions</div>
                </div>
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4`}>
                    <TrendingUp className={`w-8 h-8 text-orange-600`} />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">85%</div>
                  <div className="text-gray-600">Success Rate</div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Platform Overview */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Nxt Round?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're not just another platform. We're a community-driven solution 
              designed specifically for modern interview preparation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Company-Specific Content</h3>
              <p className="text-gray-600">
                Get targeted questions and insights for specific companies across all industries, 
                from tech giants to startups.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Community Driven</h3>
              <p className="text-gray-600">
                Learn from real experiences shared by people who've been through the same 
                interview processes at your target companies.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Real-Time Updates</h3>
              <p className="text-gray-600">
                Stay updated with the latest interview trends, questions, and company insights 
                as they happen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Top Voted Questions */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Top Voted Questions</h2>
            <Link
              to="/questions"
              className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center"
            >
              View All Questions
              <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>

          {isLoadingQuestions ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid gap-6">
              {topQuestions.slice(0, 5).map((question) => (
                <Link
                  key={question._id}
                  to={`/questions/${question._id}`}
                  className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                          {question.company.name}
                        </span>
                        <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded">
                          {question.category}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {question.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {question.content}
                      </p>
                      <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                        <span>By {question.author.name}</span>
                        <span>•</span>
                        <span>{new Date(question.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <div className="flex items-center space-x-1 text-green-600">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {question.votes.upvotes.length - question.votes.downvotes.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;