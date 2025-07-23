import React, { useState, useEffect } from 'react';
import { User, Edit3, Save, X, BarChart3, MessageSquare, Building, ThumbsUp, Calendar, ChevronDown, ChevronUp, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { BACKEND_BASE_URL } from '../config';
import axios from 'axios';

interface DashboardData {
  stats: {
    questions: number;
    answers: number;
    comments: number;
    companies: number;
    totalVotes: number;
  };
  recentActivity: {
    questions: any[];
    answers: any[];
    comments: any[];
  };
  topContent: {
    questions: any[];
    answers: any[];
  };
}

type AvatarUploadProps = {
  userId: string;
  currentAvatar: string;
  onAvatarChange?: (url: string) => void;
};

const AvatarUpload: React.FC<AvatarUploadProps> = ({ userId, currentAvatar, onAvatarChange }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(currentAvatar);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      formData.append('userId', userId);
      const res = await axios.post('/api/users/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPreview(res.data.url);
      if (onAvatarChange) onAvatarChange(res.data.url);
    } catch (err) {
      setError('Upload failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <img
        src={preview || 'https://res.cloudinary.com/dikqzl7sk/image/upload/v1710000000/default_avatar.png'}
        alt="Profile Avatar"
        style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', marginBottom: 8 }}
      />
      <input type="file" accept="image/*" onChange={handleChange} />
      <button onClick={handleUpload} disabled={loading || !file} style={{ marginLeft: 8 }}>
        {loading ? 'Uploading...' : 'Upload Avatar'}
      </button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
};

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    avatar: user?.avatar || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isDashboardOpen && !dashboardData) {
      fetchDashboardData();
    }
  }, [isDashboardOpen]);

  const fetchDashboardData = async () => {
    setIsLoadingDashboard(true);
    try {
      console.log('Fetching dashboard data...');
      const response = await api.get('/users/dashboard');
      console.log('Dashboard response:', response.data);
      setDashboardData(response.data);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      console.error('Error response:', error.response?.data);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      setError('');
      
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      let avatarUrl = formData.avatar;

      // If a file is selected, upload it first
      if (selectedFile) {
        const formDataFile = new FormData();
        formDataFile.append('avatar', selectedFile);
        
        const uploadResponse = await api.post('/users/upload/avatar', formDataFile, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        avatarUrl = uploadResponse.data.url;
      }

      await updateProfile({
        ...formData,
        avatar: avatarUrl
      });
      setIsEditing(false);
      setSelectedFile(null);
      setPreviewUrl('');
      setSuccess('Profile updated successfully!');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      avatar: user?.avatar || ''
    });
    setIsEditing(false);
    setSelectedFile(null);
    setPreviewUrl('');
    setError('');
    setSuccess('');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
            <div className="flex items-center space-x-4">
              {user.avatar ? (
                <img
                  src={user.avatar.startsWith('http') ? user.avatar : `${BACKEND_BASE_URL}${user.avatar}`}
                  alt={user.name}
                  className="w-20 h-20 rounded-full border-4 border-white object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-blue-600" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                <p className="text-blue-100">{user.email}</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${
                  user.role === 'admin' 
                    ? 'bg-yellow-400 text-yellow-900' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {user.role === 'admin' ? 'Administrator' : 'User'}
                </span>
              </div>
            </div>
          </div>

          {/* Dashboard Dropdown */}
          <div className="border-b border-gray-200">
            <button
              onClick={() => setIsDashboardOpen(!isDashboardOpen)}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900">Community Dashboard</span>
              </div>
              {isDashboardOpen ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>

            {isDashboardOpen && (
              <div className="px-6 pb-6">
                {isLoadingDashboard ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : dashboardData ? (
                  <div className="space-y-6">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <MessageSquare className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-blue-900">{dashboardData.stats.questions}</div>
                        <div className="text-sm text-blue-600">Questions</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg text-center">
                        <MessageSquare className="w-6 h-6 text-green-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-green-900">{dashboardData.stats.answers}</div>
                        <div className="text-sm text-green-600">Answers</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg text-center">
                        <MessageSquare className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-purple-900">{dashboardData.stats.comments}</div>
                        <div className="text-sm text-purple-600">Comments</div>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg text-center">
                        <Building className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-orange-900">{dashboardData.stats.companies}</div>
                        <div className="text-sm text-orange-600">Companies</div>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg text-center">
                        <ThumbsUp className="w-6 h-6 text-red-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-red-900">{dashboardData.stats.totalVotes}</div>
                        <div className="text-sm text-red-600">Total Votes</div>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-3">Recent Questions</h3>
                        {dashboardData.recentActivity.questions.length > 0 ? (
                          <div className="space-y-2">
                            {dashboardData.recentActivity.questions.map((question: any) => (
                              <div key={question._id} className="text-sm">
                                <div className="font-medium text-gray-900">{question.title}</div>
                                <div className="text-gray-500">{question.company?.name}</div>
                                <div className="text-xs text-gray-400">
                                  <Calendar className="w-3 h-3 inline mr-1" />
                                  {new Date(question.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">No questions yet</p>
                        )}
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-3">Recent Answers</h3>
                        {dashboardData.recentActivity.answers.length > 0 ? (
                          <div className="space-y-2">
                            {dashboardData.recentActivity.answers.map((answer: any) => (
                              <div key={answer._id} className="text-sm">
                                <div className="font-medium text-gray-900">{answer.question?.title}</div>
                                <div className="text-gray-500 line-clamp-2">{answer.content}</div>
                                <div className="text-xs text-gray-400">
                                  <Calendar className="w-3 h-3 inline mr-1" />
                                  {new Date(answer.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">No answers yet</p>
                        )}
                      </div>
                    </div>

                    {/* Top Content */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-3">Top Voted Questions</h3>
                        {dashboardData.topContent.questions.length > 0 ? (
                          <div className="space-y-2">
                            {dashboardData.topContent.questions.map((question: any) => (
                              <div key={question._id} className="text-sm">
                                <div className="font-medium text-gray-900">{question.title}</div>
                                <div className="text-gray-500">{question.company?.name}</div>
                                <div className="text-xs text-gray-400">
                                  <ThumbsUp className="w-3 h-3 inline mr-1" />
                                  {question.votes.upvotes.length} upvotes
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">No top questions yet</p>
                        )}
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-3">Top Voted Answers</h3>
                        {dashboardData.topContent.answers.length > 0 ? (
                          <div className="space-y-2">
                            {dashboardData.topContent.answers.map((answer: any) => (
                              <div key={answer._id} className="text-sm">
                                <div className="font-medium text-gray-900">{answer.question?.title}</div>
                                <div className="text-gray-500 line-clamp-2">{answer.content}</div>
                                <div className="text-xs text-gray-400">
                                  <ThumbsUp className="w-3 h-3 inline mr-1" />
                                  {answer.votes.upvotes.length} upvotes
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">No top answers yet</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-500 mb-4">
                      <MessageSquare className="w-12 h-12 mx-auto text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to your Dashboard!</h3>
                    <p className="text-gray-600 mb-4">
                      Start contributing to the community by asking questions, providing answers, and sharing your interview experiences.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-blue-900">0</div>
                        <div className="text-sm text-blue-600">Questions</div>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-green-900">0</div>
                        <div className="text-sm text-green-600">Answers</div>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-purple-900">0</div>
                        <div className="text-sm text-purple-600">Comments</div>
                      </div>
                      <div className="bg-orange-50 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-orange-900">0</div>
                        <div className="text-sm text-orange-600">Companies</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Profile Form */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </button>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !isEditing ? 'bg-gray-50 text-gray-500' : ''
                  }`}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={user.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Picture
                </label>
                {!isEditing ? (
                  <div className="flex items-center space-x-4">
                    {user.avatar ? (
                      <img
                        src={user.avatar.startsWith('http') ? user.avatar : `${BACKEND_BASE_URL}${user.avatar}`}
                        alt={user.name}
                        className="w-16 h-16 rounded-full object-cover border border-gray-300"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <span className="text-sm text-gray-500">Click Edit Profile to change</span>
                  </div>
                ) : (
                  <div>
                    {!selectedFile ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                        <input
                          type="file"
                          id="avatar"
                          name="avatar"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <label htmlFor="avatar" className="cursor-pointer">
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            PNG, JPG, GIF up to 5MB
                          </p>
                        </label>
                      </div>
                    ) : (
                      <div className="relative">
                        <img
                          src={previewUrl}
                          alt="Avatar preview"
                          className="w-20 h-20 object-cover rounded-full border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={removeFile}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <input
                  type="text"
                  value={user.role === 'admin' ? 'Administrator' : 'User'}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Role is managed by administrators</p>
              </div>

              {isEditing && (
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center justify-center"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;