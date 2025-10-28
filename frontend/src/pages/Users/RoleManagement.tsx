import React, { useState, useEffect } from 'react';
import {
  ShieldCheckIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UsersIcon,
  Cog6ToothIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Modal, Alert, MultiSelect } from '../../components/UI/EnhancedComponents';
// Remove unused import

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isSystem: boolean;
  color: string;
  createdAt: string;
}

const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [activeTab, setActiveTab] = useState('roles');

  useEffect(() => {
    // Mock data - replace with API calls
    const mockPermissions: Permission[] = [
      { id: 'user_management', name: 'User Management', description: 'Create, edit, and delete users', category: 'Users' },
      { id: 'role_management', name: 'Role Management', description: 'Manage roles and permissions', category: 'Users' },
      { id: 'system_settings', name: 'System Settings', description: 'Configure system-wide settings', category: 'System' },
      { id: 'analytics', name: 'Analytics', description: 'View analytics and reports', category: 'Reports' },
      { id: 'candidate_management', name: 'Candidate Management', description: 'Manage candidate profiles and applications', category: 'Hiring' },
      { id: 'interview_scheduling', name: 'Interview Scheduling', description: 'Schedule and manage interviews', category: 'Hiring' },
      { id: 'job_posting', name: 'Job Posting', description: 'Create and manage job postings', category: 'Hiring' },
      { id: 'reports', name: 'Reports', description: 'Generate and view reports', category: 'Reports' },
      { id: 'interview_conduct', name: 'Interview Conduct', description: 'Conduct interviews and evaluations', category: 'Hiring' },
      { id: 'candidate_evaluation', name: 'Candidate Evaluation', description: 'Evaluate and score candidates', category: 'Hiring' },
      { id: 'profile_management', name: 'Profile Management', description: 'Manage own profile and settings', category: 'Personal' },
      { id: 'application_tracking', name: 'Application Tracking', description: 'Track job applications', category: 'Personal' },
    ];

    const mockRoles: Role[] = [
      {
        id: '1',
        name: 'Super Administrator',
        description: 'Full system access with all permissions',
        permissions: mockPermissions.map(p => p.id),
        userCount: 2,
        isSystem: true,
        color: 'purple',
        createdAt: '2023-01-01T00:00:00Z',
      },
      {
        id: '2',
        name: 'HR Manager',
        description: 'Manage hiring process and candidates',
        permissions: ['candidate_management', 'interview_scheduling', 'job_posting', 'reports', 'analytics'],
        userCount: 5,
        isSystem: true,
        color: 'blue',
        createdAt: '2023-01-01T00:00:00Z',
      },
      {
        id: '3',
        name: 'Interviewer',
        description: 'Conduct interviews and evaluate candidates',
        permissions: ['interview_conduct', 'candidate_evaluation', 'profile_management'],
        userCount: 12,
        isSystem: true,
        color: 'indigo',
        createdAt: '2023-01-01T00:00:00Z',
      },
      {
        id: '4',
        name: 'Candidate',
        description: 'Apply for jobs and track applications',
        permissions: ['profile_management', 'application_tracking'],
        userCount: 150,
        isSystem: true,
        color: 'orange',
        createdAt: '2023-01-01T00:00:00Z',
      },
      {
        id: '5',
        name: 'Recruiter',
        description: 'Custom role for external recruiters',
        permissions: ['candidate_management', 'interview_scheduling', 'reports'],
        userCount: 3,
        isSystem: false,
        color: 'green',
        createdAt: '2023-06-15T10:30:00Z',
      },
    ];

    setTimeout(() => {
      setPermissions(mockPermissions);
      setRoles(mockRoles);
      setLoading(false);
    }, 1000);
  }, [setRoles]);

  const getRoleColor = (color: string) => {
    const colors = {
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      red: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[color as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const handleCreateRole = () => {
    setSelectedRole(null);
    setShowCreateModal(true);
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setShowEditModal(true);
  };

  const handleDeleteRole = (role: Role) => {
    setSelectedRole(role);
    setShowDeleteModal(true);
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Role & Permission Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage user roles and their associated permissions
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={handleCreateRole}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Role
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'roles', name: 'Roles', icon: ShieldCheckIcon },
              { id: 'permissions', name: 'Permissions', icon: Cog6ToothIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'roles' && (
            <div className="space-y-6">
              {/* Role Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                  <div className="flex items-center">
                    <ShieldCheckIcon className="h-8 w-8" />
                    <div className="ml-4">
                      <p className="text-purple-100">Total Roles</p>
                      <p className="text-2xl font-bold">{roles.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                  <div className="flex items-center">
                    <UsersIcon className="h-8 w-8" />
                    <div className="ml-4">
                      <p className="text-blue-100">Total Users</p>
                      <p className="text-2xl font-bold">{roles.reduce((sum: number, role: Role) => sum + role.userCount, 0)}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                  <div className="flex items-center">
                    <Cog6ToothIcon className="h-8 w-8" />
                    <div className="ml-4">
                      <p className="text-green-100">Custom Roles</p>
                      <p className="text-2xl font-bold">{roles.filter((r: Role) => !r.isSystem).length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Roles Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map((role) => (
                  <div key={role.id} className={`border-2 rounded-lg p-6 ${getRoleColor(role.color)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold">{role.name}</h3>
                          {role.isSystem && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              System
                            </span>
                          )}
                        </div>
                        <p className="text-sm mt-1 opacity-80">{role.description}</p>
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Users:</span>
                            <span className="font-medium">{role.userCount}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Permissions:</span>
                            <span className="font-medium">{role.permissions.length}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() => console.log('View role:', role.id)}
                          className="p-1 rounded hover:bg-black hover:bg-opacity-10"
                          title="View role"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditRole(role)}
                          className="p-1 rounded hover:bg-black hover:bg-opacity-10"
                          title="Edit role"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        {!role.isSystem && (
                          <button
                            onClick={() => handleDeleteRole(role)}
                            className="p-1 rounded hover:bg-red-500 hover:bg-opacity-20"
                            title="Delete role"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'permissions' && (
            <div className="space-y-6">
              {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                <div key={category}>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{category}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categoryPermissions.map((permission) => (
                      <div key={permission.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900">{permission.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{permission.description}</p>
                          </div>
                          <div className="ml-4">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {roles.filter((r: Role) => r.permissions.includes(permission.id)).length} roles
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Role Modal */}
      <RoleFormModal
        isOpen={showCreateModal || showEditModal}
        onClose={() => {
          setShowCreateModal(false);
          setShowEditModal(false);
          setSelectedRole(null);
        }}
        role={selectedRole}
        isEdit={showEditModal}
        permissions={permissions}
        onSave={(roleData) => {
          if (showEditModal && selectedRole) {
            // Update role
            setRoles((prev: Role[]) => prev.map((r: Role) => r.id === selectedRole.id ? { ...r, ...roleData } : r));
          } else {
            // Create role
            const newRole: Role = {
              id: Date.now().toString(),
              name: roleData.name || '',
              description: roleData.description || '',
              permissions: roleData.permissions || [],
              color: roleData.color || 'blue',
              userCount: 0,
              isSystem: false,
              createdAt: new Date().toISOString(),
            };
            setRoles((prev: Role[]) => [...prev, newRole]);
          }
          setShowCreateModal(false);
          setShowEditModal(false);
          setSelectedRole(null);
        }}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedRole(null);
        }}
        title="Delete Role"
        size="sm"
      >
        <div className="space-y-4">
          <Alert
            type="warning"
            title="Warning"
            message={`Deleting this role will affect ${selectedRole?.userCount} users. They will lose all permissions associated with this role.`}
          />
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedRole(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (selectedRole) {
                  setRoles((prev: Role[]) => prev.filter((r: Role) => r.id !== selectedRole.id));
                }
                setShowDeleteModal(false);
                setSelectedRole(null);
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
            >
              Delete Role
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Role Form Modal Component
interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  isEdit: boolean;
  permissions: Permission[];
  onSave: (roleData: Partial<Role>) => void;
}

const RoleFormModal: React.FC<RoleFormModalProps> = ({ isOpen, onClose, role, isEdit, permissions, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
    color: 'blue',
  });

  useEffect(() => {
    if (role && isEdit) {
      setFormData({
        name: role.name,
        description: role.description,
        permissions: role.permissions,
        color: role.color,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        permissions: [],
        color: 'blue',
      });
    }
  }, [role, isEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const permissionOptions = permissions.map(p => ({
    value: p.id,
    label: p.name,
    description: p.description,
  }));

  const colorOptions = [
    { value: 'blue', label: 'Blue' },
    { value: 'purple', label: 'Purple' },
    { value: 'indigo', label: 'Indigo' },
    { value: 'green', label: 'Green' },
    { value: 'orange', label: 'Orange' },
    { value: 'red', label: 'Red' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Role' : 'Create New Role'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Role Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter role name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Color</label>
            <select
              value={formData.color}
              onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              {colorOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Describe the role and its responsibilities"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
          <MultiSelect
            options={permissionOptions}
            selected={formData.permissions}
            onChange={(permissions) => setFormData((prev: any) => ({ ...prev, permissions }))}
            placeholder="Select permissions for this role..."
          />
          <p className="mt-2 text-sm text-gray-500">
            Selected {formData.permissions.length} of {permissions.length} permissions
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
          >
            {isEdit ? 'Update Role' : 'Create Role'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RoleManagement;