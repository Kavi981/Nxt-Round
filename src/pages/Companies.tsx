import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building, Plus, Search, Filter, ExternalLink } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import CreateCompanyModal from '../components/companies/CreateCompanyModal';
import { BACKEND_BASE_URL } from '../config';

interface Company {
  _id: string;
  name: string;
  industry: string;
  description: string;
  logo: string;
  website: string;
  createdBy: {
    name: string;
  };
  createdAt: string;
}

const Companies: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { isAuthenticated } = useAuth();

  const industries = ['All', 'IT', 'Finance', 'FMCG', 'Healthcare', 'Manufacturing', 'Consulting', 'E-commerce', 'Other'];

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    filterCompanies();
  }, [companies, searchQuery, selectedIndustry]);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    if (!isLoading) {
      window.scrollTo(0, 0);
    }
  }, [isLoading]);

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/companies');
      setCompanies(response.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCompanies = () => {
    let filtered = companies;

    if (searchQuery) {
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedIndustry !== 'All') {
      filtered = filtered.filter(company => company.industry === selectedIndustry);
    }

    setFilteredCompanies(filtered);
  };

  const handleCompanyCreated = (newCompany: Company) => {
    setCompanies(prev => [newCompany, ...prev]);
    setIsCreateModalOpen(false);
  };

  const getIndustryColor = (industry: string) => {
    const colors: { [key: string]: string } = {
      'IT': 'bg-blue-100 text-blue-800',
      'Finance': 'bg-green-100 text-green-800',
      'FMCG': 'bg-purple-100 text-purple-800',
      'Healthcare': 'bg-red-100 text-red-800',
      'Manufacturing': 'bg-yellow-100 text-yellow-800',
      'Consulting': 'bg-indigo-100 text-indigo-800',
      'E-commerce': 'bg-pink-100 text-pink-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return colors[industry] || colors['Other'];
  };

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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Companies</h1>
            <p className="text-gray-600">
              Explore interview experiences from {companies.length} companies across various industries
            </p>
          </div>
          {isAuthenticated && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 md:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Company
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              {industries.map(industry => (
                <option key={industry} value={industry}>
                  {industry === 'All' ? 'All Industries' : industry}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Companies Grid */}
        {filteredCompanies.length === 0 ? (
          <div className="text-center py-12">
            <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
            <p className="text-gray-600">
              {searchQuery || selectedIndustry !== 'All' 
                ? 'Try adjusting your filters or search terms'
                : 'Be the first to add a company!'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <div
                key={company._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-6 relative"
              >
                {/* Company Link in Top Right Corner */}
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-4 right-4 text-blue-600 hover:text-blue-700 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                
                <Link
                  to={`/questions?company=${company._id}`}
                  className="block"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      {company.logo ? (
                        <img
                          src={company.logo.startsWith('http') ? company.logo : `${BACKEND_BASE_URL}${company.logo}`}
                          alt={company.name}
                          className="w-8 h-8 rounded object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : (
                        <Building className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {company.name}
                      </h3>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getIndustryColor(company.industry)} mb-2`}>
                        {company.industry}
                      </span>
                      {company.description && (
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                          {company.description}
                        </p>
                      )}
                      <div className="text-xs text-gray-500">
                        Added by {company.createdBy.name}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Create Company Modal */}
        {isCreateModalOpen && (
          <CreateCompanyModal
            onClose={() => setIsCreateModalOpen(false)}
            onCompanyCreated={handleCompanyCreated}
          />
        )}
      </div>
    </div>
  );
};

export default Companies;