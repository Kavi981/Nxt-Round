import React, { useState, useEffect } from 'react';
import { Building, ChevronDown } from 'lucide-react';
import api from '../../utils/api';

interface Company {
  _id: string;
  name: string;
  industry: string;
}

interface CompanySelectorProps {
  selectedCompany: string;
  onCompanyChange: (companyId: string) => void;
}

const CompanySelector: React.FC<CompanySelectorProps> = ({ selectedCompany, onCompanyChange }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/companies');
      setCompanies(response.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCompanyData = companies.find(c => c._id === selectedCompany);

  return (
    <div className="relative mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Filter by Company
      </label>
      
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full md:w-80 bg-white border border-gray-300 rounded-lg px-4 py-2 text-left focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between"
        >
          <div className="flex items-center space-x-2">
            <Building className="w-4 h-4 text-gray-400" />
            <span className={selectedCompanyData ? 'text-gray-900' : 'text-gray-500'}>
              {selectedCompanyData ? selectedCompanyData.name : 'All Companies'}
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <div className="p-2">
              <input
                type="text"
                placeholder="Search companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            
            <div className="max-h-48 overflow-y-auto">
              <button
                onClick={() => {
                  onCompanyChange('');
                  setIsOpen(false);
                  setSearchQuery('');
                }}
                className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 ${
                  !selectedCompany ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                }`}
              >
                <Building className="w-4 h-4" />
                <span>All Companies</span>
              </button>
              
              {filteredCompanies.map((company) => (
                <button
                  key={company._id}
                  onClick={() => {
                    onCompanyChange(company._id);
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between ${
                    selectedCompany === company._id ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4" />
                    <span>{company.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">{company.industry}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanySelector;