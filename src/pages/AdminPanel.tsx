import React, { useState, useEffect } from 'react';
import { Users, Building, MessageSquare, Shield, Edit3, Trash2, Crown, Save, X, Upload } from 'lucide-react';
import api from '../utils/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar: string;
  createdAt: string;
}

interface Company {
  _id: string;
  name: string;
  industry: string;
  description: string;
  createdBy: {
    name: string;
  };
  createdAt: string;
  logo?: string;
  website?: string;
}

interface Question {
  _id: string;
  title: string;
  content: string;
  company: {
    name: string;
  };
  author: {
    _id: string;
    name: string;
  };
  category: string;
  difficulty: string;
  createdAt: string;
}

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCompany, setEditingCompany] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [editCompanyForm, setEditCompanyForm] = useState({
    name: '',
    industry: '',
    description: '',
    logo: '',
    website: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [editQuestionForm, setEditQuestionForm] = useState({
    title: '',
    content: '',
    category: '',
    difficulty: ''
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      switch (activeTab) {
        case 'users':
          const usersResponse = await api.get('/users');
          setUsers(usersResponse.data);
          break;
        case 'companies':
          const companiesResponse = await api.get('/companies');
          setCompanies(companiesResponse.data);
          break;
        case 'questions':
          const questionsResponse = await api.get('/questions');
          setQuestions(questionsResponse.data);
          break;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const promoteUser = async (userId: string) => {
    try {
      await api.put(`/users/${userId}/promote`);
      fetchData();
    } catch (error) {
      console.error('Error promoting user:', error);
    }
  };

  const deleteCompany = async (companyId: string) => {
    if (!window.confirm('Are you sure you want to delete this company? This will also delete all related questions.')) {
      return;
    }

    try {
      await api.delete(`/companies/${companyId}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting company:', error);
    }
  };

  const deleteQuestion = async (questionId: string) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      await api.delete(`/questions/${questionId}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company._id);
    setEditCompanyForm({
      name: company.name,
      industry: company.industry,
      description: company.description,
      logo: company.logo || '',
      website: company.website || ''
    });
    setSelectedFile(null);
    setPreviewUrl('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const handleSaveCompanyEdit = async (companyId: string) => {
    try {
      let logoUrl = editCompanyForm.logo;

      // If a file is selected, upload it first
      if (selectedFile) {
        const formDataFile = new FormData();
        formDataFile.append('logo', selectedFile);
        
        const uploadResponse = await api.post('/companies/upload/logo', formDataFile, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        logoUrl = uploadResponse.data.url;
      }

      await api.put(`/companies/${companyId}`, {
        ...editCompanyForm,
        logo: logoUrl
      });
      setEditingCompany(null);
      setSelectedFile(null);
      setPreviewUrl('');
      fetchData();
    } catch (error) {
      console.error('Error updating company:', error);
    }
  };

  const handleCancelCompanyEdit = () => {
    setEditingCompany(null);
    setSelectedFile(null);
    setPreviewUrl('');
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question._id);
    setEditQuestionForm({
      title: question.title,
      content: question.content,
      category: question.category,
      difficulty: question.difficulty
    });
  };

  const handleSaveQuestionEdit = async (questionId: string) => {
    try {
      await api.put(`/questions/${questionId}`, editQuestionForm);
      setEditingQuestion(null);
      fetchData();
    } catch (error) {
      console.error('Error updating question:', error);
    }
  };

  const handleCancelQuestionEdit = () => {
    setEditingQuestion(null);
  };

  const tabs = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'companies', label: 'Companies', icon: Building },
    { id: 'questions', label: 'Questions', icon: MessageSquare }
  ];

  const renderUsersTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
        <span className="text-sm text-gray-500">{users.length} total users</span>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'admin' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role === 'admin' ? (
                        <>
                          <Crown className="w-3 h-3 mr-1" />
                          Admin
                        </>
                      ) : (
                        'User'
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => promoteUser(user._id)}
                        className="text-blue-600 hover:text-blue-700 inline-flex items-center"
                      >
                        <Shield className="w-4 h-4 mr-1" />
                        Promote to Admin
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCompaniesTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Company Management</h3>
        <span className="text-sm text-gray-500">{companies.length} total companies</span>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto max-w-full">
          <table className="min-w-full divide-y divide-gray-200 table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  Industry
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  Created By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {companies.map((company) => (
                <tr key={company._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      {editingCompany === company._id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editCompanyForm.name}
                            onChange={(e) => setEditCompanyForm(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Company name"
                          />
                          <textarea
                            value={editCompanyForm.description}
                            onChange={(e) => setEditCompanyForm(prev => ({ ...prev, description: e.target.value }))}
                            rows={2}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder="Description"
                          />
                          <div className="flex items-center space-x-2">
                            <label htmlFor="logo-upload" className="text-sm text-gray-700 cursor-pointer">
                              <Upload className="w-5 h-5 text-blue-600" />
                            </label>
                            <input
                              type="file"
                              id="logo-upload"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="hidden"
                            />
                            {previewUrl && (
                              <div className="flex items-center space-x-2">
                                <img src={previewUrl} alt="Preview" className="w-10 h-10 rounded-full" />
                                <button
                                  onClick={removeFile}
                                  className="text-red-600 hover:text-red-700 text-sm"
                                >
                                  Remove
                                </button>
                              </div>
                            )}
                          </div>
                          <input
                            type="url"
                            value={editCompanyForm.website}
                            onChange={(e) => setEditCompanyForm(prev => ({ ...prev, website: e.target.value }))}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Website URL"
                          />
                        </div>
                      ) : (
                        <div>
                          <div className="text-sm font-medium text-gray-900">{company.name}</div>
                          {company.description && (
                            <div className="text-sm text-gray-500 mt-1">
                              {company.description}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {editingCompany === company._id ? (
                      <div className="w-32">
                        <select
                          value={editCompanyForm.industry}
                          onChange={(e) => setEditCompanyForm(prev => ({ ...prev, industry: e.target.value }))}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select Industry</option>
                          <option value="Technology">Technology</option>
                          <option value="Finance">Finance</option>
                          <option value="Healthcare">Healthcare</option>
                          <option value="Education">Education</option>
                          <option value="Retail">Retail</option>
                          <option value="Manufacturing">Manufacturing</option>
                          <option value="Consulting">Consulting</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    ) : (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        {company.industry}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {company.createdBy.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(company.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {editingCompany === company._id ? (
                        <>
                          <button 
                            onClick={() => handleSaveCompanyEdit(company._id)}
                            className="text-green-600 hover:text-green-700 p-1"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={handleCancelCompanyEdit}
                            className="text-gray-600 hover:text-gray-700 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => handleEditCompany(company)}
                          className="text-blue-600 hover:text-blue-700 p-1"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => deleteCompany(company._id)}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderQuestionsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Question Management</h3>
        <span className="text-sm text-gray-500">{questions.length} total questions</span>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto max-w-full">
          <table className="min-w-full divide-y divide-gray-200 table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                  Question
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                  Difficulty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {questions.map((question) => {
                const canEdit = users.find(user => user._id === question.author._id) || users.find(user => user.role === 'admin');
                return (
                  <tr key={question._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="min-w-0">
                        {editingQuestion === question._id ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editQuestionForm.title}
                              onChange={(e) => setEditQuestionForm(prev => ({ ...prev, title: e.target.value }))}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Question title"
                            />
                            <textarea
                              value={editQuestionForm.content}
                              onChange={(e) => setEditQuestionForm(prev => ({ ...prev, content: e.target.value }))}
                              rows={2}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                              placeholder="Question content"
                            />
                          </div>
                        ) : (
                          <>
                            <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                              {question.title}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {question.content}
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {question.company.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingQuestion === question._id ? (
                        <div className="min-w-0 w-20">
                          <select
                            value={editQuestionForm.category}
                            onChange={(e) => setEditQuestionForm(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="Aptitude">Aptitude</option>
                            <option value="Coding">Coding</option>
                            <option value="Technical MCQs">Technical MCQs</option>
                            <option value="Technical HR">Technical HR</option>
                            <option value="General HR">General HR</option>
                            <option value="Behavioral">Behavioral</option>
                          </select>
                        </div>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {question.category}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {question.author.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingQuestion === question._id ? (
                        <div className="min-w-0 w-20">
                          <select
                            value={editQuestionForm.difficulty}
                            onChange={(e) => setEditQuestionForm(prev => ({ ...prev, difficulty: e.target.value }))}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                          </select>
                        </div>
                      ) : (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          question.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                          question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {question.difficulty}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(question.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {editingQuestion === question._id ? (
                          <>
                            <button 
                              onClick={() => handleSaveQuestionEdit(question._id)}
                              className="text-green-600 hover:text-green-700 p-1"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={handleCancelQuestionEdit}
                              className="text-gray-600 hover:text-gray-700 p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            {canEdit && (
                              <button 
                                onClick={() => handleEditQuestion(question)}
                                className="text-blue-600 hover:text-blue-700 p-1"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            )}
                            <button 
                              onClick={() => deleteQuestion(question._id)}
                              className="text-red-600 hover:text-red-700 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Manage users, companies, and questions</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm inline-flex items-center ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div>
            {activeTab === 'users' && renderUsersTab()}
            {activeTab === 'companies' && renderCompaniesTab()}
            {activeTab === 'questions' && renderQuestionsTab()}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;