import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  StarIcon,
  MapPinIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  TagIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { TalentPool, CandidateProfile, AdvancedSearchFilters } from '../../types';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const TalentPoolPage: React.FC = () => {
  const { hasRole } = useAuth();
  const [talentPools, setTalentPools] = useState<TalentPool[]>([]);
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPool, setSelectedPool] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<AdvancedSearchFilters>({});
  const [showCreatePool, setShowCreatePool] = useState(false);

  useEffect(() => {
    fetchTalentPools();
    fetchCandidates();
  }, []);

  const fetchTalentPools = async () => {
    try {
      // Mock data - replace with actual API call
      const mockPools: TalentPool[] = [
        {
          _id: '1',
          name: 'Frontend Developers',
          description: 'Skilled React, Vue, and Angular developers',
          candidates: [],
          tags: ['React', 'Vue', 'Angular', 'JavaScript', 'TypeScript'],
          createdBy: { _id: '1' } as any,
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          _id: '2',
          name: 'Senior Backend Engineers',
          description: 'Experienced backend developers with 5+ years',
          candidates: [],
          tags: ['Node.js', 'Python', 'Java', 'AWS', 'Docker'],
          createdBy: { _id: '1' } as any,
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          _id: '3',
          name: 'Product Managers',
          description: 'Product management professionals',
          candidates: [],
          tags: ['Product Management', 'Strategy', 'Analytics', 'Agile'],
          createdBy: { _id: '1' } as any,
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];
      setTalentPools(mockPools);
    } catch (error) {
      console.error('Error fetching talent pools:', error);
    }
  };

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockCandidates: CandidateProfile[] = [
        {
          _id: '1',
          user: {
            _id: '1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            role: 'candidate',
            skills: ['React', 'Node.js', 'TypeScript'],
            experience: 5,
            location: 'San Francisco, CA',
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            fullName: 'John Doe',
          },
          portfolio: 'https://johndoe.dev',
          linkedIn: 'https://linkedin.com/in/johndoe',
          github: 'https://github.com/johndoe',
          education: [
            {
              institution: 'Stanford University',
              degree: 'Bachelor of Science',
              field: 'Computer Science',
              startDate: '2015-09-01',
              endDate: '2019-06-01',
              gpa: 3.8,
            },
          ],
          workExperience: [
            {
              company: 'Tech Corp',
              position: 'Senior Frontend Developer',
              startDate: '2020-01-01',
              endDate: '2024-01-01',
              description: 'Led frontend development for multiple React applications',
              skills: ['React', 'TypeScript', 'Redux'],
            },
          ],
          certifications: [
            {
              name: 'AWS Certified Developer',
              issuer: 'Amazon Web Services',
              issueDate: '2023-01-01',
              credentialId: 'AWS-123456',
            },
          ],
          languages: [
            { language: 'English', proficiency: 'native' },
            { language: 'Spanish', proficiency: 'intermediate' },
          ],
          preferences: {
            jobTypes: ['full-time', 'remote'],
            locations: ['San Francisco', 'Remote'],
            salaryRange: { min: 120000, max: 180000, currency: 'USD' },
            remoteWork: true,
            availabilityDate: '2024-02-01',
            noticePeriod: '2 weeks',
          },
          notes: [],
          tags: ['React Expert', 'Team Lead', 'Startup Experience'],
          rating: 4.5,
          isBlacklisted: false,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          _id: '2',
          user: {
            _id: '2',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            role: 'candidate',
            skills: ['Python', 'Django', 'PostgreSQL'],
            experience: 7,
            location: 'New York, NY',
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            fullName: 'Jane Smith',
          },
          linkedIn: 'https://linkedin.com/in/janesmith',
          github: 'https://github.com/janesmith',
          education: [
            {
              institution: 'MIT',
              degree: 'Master of Science',
              field: 'Computer Science',
              startDate: '2014-09-01',
              endDate: '2016-06-01',
              gpa: 3.9,
            },
          ],
          workExperience: [
            {
              company: 'Data Solutions Inc',
              position: 'Senior Backend Engineer',
              startDate: '2018-03-01',
              description: 'Built scalable backend systems handling millions of requests',
              skills: ['Python', 'Django', 'PostgreSQL', 'Redis'],
            },
          ],
          certifications: [],
          languages: [
            { language: 'English', proficiency: 'native' },
            { language: 'French', proficiency: 'advanced' },
          ],
          preferences: {
            jobTypes: ['full-time'],
            locations: ['New York', 'Boston'],
            salaryRange: { min: 140000, max: 200000, currency: 'USD' },
            remoteWork: false,
            availabilityDate: '2024-03-01',
            noticePeriod: '1 month',
          },
          notes: [],
          tags: ['Backend Expert', 'Scalability', 'Team Lead'],
          rating: 4.8,
          isBlacklisted: false,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];
      setCandidates(mockCandidates);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCandidates = candidates.filter(candidate => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = candidate.user.fullName.toLowerCase().includes(query);
      const matchesSkills = candidate.user.skills?.some(skill => 
        skill.toLowerCase().includes(query)
      );
      const matchesTags = candidate.tags.some(tag => 
        tag.toLowerCase().includes(query)
      );
      
      if (!matchesName && !matchesSkills && !matchesTags) {
        return false;
      }
    }
    
    if (filters.skills && filters.skills.length > 0) {
      const hasRequiredSkills = filters.skills.some(skill =>
        candidate.user.skills?.some(candidateSkill =>
          candidateSkill.toLowerCase().includes(skill.toLowerCase())
        )
      );
      if (!hasRequiredSkills) return false;
    }
    
    if (filters.experience) {
      const exp = candidate.user.experience || 0;
      if (exp < filters.experience.min || exp > filters.experience.max) {
        return false;
      }
    }
    
    return true;
  });

  const CreatePoolModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [poolData, setPoolData] = useState({
      name: '',
      description: '',
      tags: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      // Handle pool creation
      console.log('Creating pool:', poolData);
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Talent Pool</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pool Name
              </label>
              <input
                type="text"
                value={poolData.name}
                onChange={(e) => setPoolData({ ...poolData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={poolData.description}
                onChange={(e) => setPoolData({ ...poolData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={poolData.tags}
                onChange={(e) => setPoolData({ ...poolData, tags: e.target.value })}
                placeholder="React, JavaScript, Frontend"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Create Pool
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (!hasRole(['admin', 'hr'])) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">You don't have permission to view talent pools.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Talent Pool</h1>
          <p className="text-gray-600 mt-2">Manage and organize your candidate database</p>
        </div>
        <button
          onClick={() => setShowCreatePool(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Create Pool</span>
        </button>
      </div>

      {/* Talent Pools */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {talentPools.map(pool => (
          <div
            key={pool._id}
            onClick={() => setSelectedPool(selectedPool === pool._id ? null : pool._id)}
            className={`bg-white rounded-lg shadow-sm p-6 border cursor-pointer transition-all ${
              selectedPool === pool._id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">{pool.name}</h3>
              <span className="text-sm text-gray-500">{pool.candidates.length} candidates</span>
            </div>
            <p className="text-gray-600 text-sm mb-4">{pool.description}</p>
            <div className="flex flex-wrap gap-1">
              {pool.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {tag}
                </span>
              ))}
              {pool.tags.length > 3 && (
                <span className="text-xs text-gray-500">+{pool.tags.length - 3} more</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search candidates by name, skills, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <FunnelIcon className="h-4 w-4" />
            <span>Filters</span>
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
              <input
                type="text"
                placeholder="React, Python, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Experience</label>
              <input
                type="number"
                placeholder="Years"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                placeholder="City, State"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}
      </div>

      {/* Candidates List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Candidates ({filteredCandidates.length})
          </h3>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredCandidates.map(candidate => (
              <div key={candidate._id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {candidate.user.firstName[0]}{candidate.user.lastName[0]}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {candidate.user.fullName}
                        </h4>
                        {candidate.rating && (
                          <div className="flex items-center space-x-1">
                            <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600">{candidate.rating}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <BriefcaseIcon className="h-4 w-4" />
                          <span>{candidate.user.experience} years experience</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPinIcon className="h-4 w-4" />
                          <span>{candidate.user.location}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mt-2">
                        {candidate.user.skills?.slice(0, 5).map(skill => (
                          <span
                            key={skill}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mt-2">
                        {candidate.tags.map(tag => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            <TagIcon className="h-3 w-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                      <PencilIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Pool Modal */}
      {showCreatePool && (
        <CreatePoolModal onClose={() => setShowCreatePool(false)} />
      )}
    </div>
  );
};

export default TalentPoolPage;