import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { API_BASE_URL } from '../utils/constants';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { toast } from 'react-hot-toast';

interface Role {
  id: number;
  name: string;
}

interface Department {
  id: number;
  name: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  roles?: string[]; // <-- roles are strings
  department?: Department | null;
  isActive: boolean;
  created_by: string;
  department_id?: string | null;
  
}

const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    roleId: 0,
    departmentId: 0,
  });

  const API_BASE = `${API_BASE_URL}/api`;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, rolesRes, departmentsRes] = await Promise.all([
        axios.get(`${API_BASE}/users`),
        axios.get(`${API_BASE}/role`),
        axios.get(`${API_BASE}/departments`),
      ]);
      setUsers(usersRes.data.data);
      setRoles(rolesRes.data.data);
      setDepartments(departmentsRes.data.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch data from server');
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.department?.name?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      roleId: 0,
      departmentId: 0,
    });
    setSelectedUser(null);
  };

  const previewUserData = () => {
  const payload = {
    name: formData.name,
    email: formData.email,
    role: roles.find(r => r.id === formData.roleId)?.name || 'troubleshooter',
    department_id: formData.departmentId || null,
    password: 'password123!', // if backend requires password on creation
  };

  console.log('Preview user data to be sent:', payload);
  return payload;
};

// Then modify your handleCreateUser to use it
const handleCreateUser = async () => {
  try {
    const payload = previewUserData(); // preview first
    await axios.post(`${API_BASE}/users`, payload);

    toast.success('User created successfully');
    setShowCreateModal(false);
    resetForm();
    fetchData();
  } catch (error: any) {
    console.error('Error creating user:', error);
    toast.error(error.response?.data?.message || 'Failed to create user');
  }
};

  const handleEditUser = async () => {
    if (!selectedUser) return;
    try {
      const roleName = roles.find(r => r.id === formData.roleId)?.name;

      await axios.put(`${API_BASE}/users/${selectedUser.id}`, {
        name: formData.name,
        email: formData.email,
        role: roleName,
        department_id: formData.departmentId || null,
      });

      toast.success('User updated successfully');
      setShowEditModal(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`${API_BASE}/users/${userId}`);
      toast.success('User deleted successfully');
      fetchData();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await axios.put(`${API_BASE}/users/${user.id}`, { isActive: !user.isActive });
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}`);
      fetchData();
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to update status');
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      roleId: roles.find(r => r.name === user.roles?.[0])?.id || 0,
      departmentId: user.department?.id || 0,
    });
    setShowEditModal(true);
  };

  const getRoleBadgeVariant = (roleName: string) => {
    switch (roleName) {
      case 'admin':
        return 'danger';
      case 'department_leader':
        return 'warning';
      case 'troubleshooter':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage system users and their permissions</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} icon={<Plus size={18} />}>
          Add User
        </Button>
      </div>

      {/* Search & Table */}
      <div className="bg-gradient-to-r from-gray-100 to-blue-50 dark:from-gray-900 dark:to-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search users by name, email, or department..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <th className="text-left py-3 px-6 font-medium text-gray-900 dark:text-white">User</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900 dark:text-white">Role</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900 dark:text-white">Department</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900 dark:text-white">Status</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900 dark:text-white">Created By</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900 dark:text-white">Updated By</th>
                <th className="text-right py-3 px-6 font-medium text-gray-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">{user.name.split(' ').map(n => n[0]).join('')}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <Badge variant={getRoleBadgeVariant(user.roles?.[0] || 'troubleshooter')}>
                      {user.roles?.[0]?.replace('_', ' ') || 'troubleshooter'}
                    </Badge>
                  </td>
                  <td className="py-4 px-6 text-gray-600 dark:text-gray-400">
                    {user.department_id ? user.department_id : 'N/A'}
                  </td>
                  <td className="py-4 px-6">
                    <Badge variant={user.isActive ? 'success' : 'default'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="py-4 px-6 text-gray-600 dark:text-gray-400">
                      {user.created_by ? user.created_by : 'N/A'}
                    </td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-400">
                      {user.updated_by ? user.updated_by : 'not updated'}
                    </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(user)} icon={user.isActive ? <UserX size={16} /> : <UserCheck size={16} />} />
                      <Button variant="ghost" size="sm" onClick={() => openEditModal(user)} icon={<Edit size={16} />} />
                      {user.id !== currentUser?.id && (
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user.id)} icon={<Trash2 size={16} />} />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      <Modal isOpen={showCreateModal} onClose={() => { setShowCreateModal(false); resetForm(); }} title="Add New User">
        <div className="space-y-4">
          <Input
            label="Full Name"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter full name"
            required
          />
          <Input
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            placeholder="Enter email"
            required
          />
          <div>
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Role</label>
            <select
              value={formData.roleId}
              onChange={e => setFormData({ ...formData, roleId: Number(e.target.value) })}
              className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:text-white"
            >
              <option value={0}>Select Role</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.name.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Department</label>
            <select
              value={formData.departmentId}
              onChange={e => setFormData({ ...formData, departmentId: Number(e.target.value) })}
              className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:text-white"
            >
              <option value={0}>Select Department</option>
              {departments.map(dep => (
                <option key={dep.id} value={dep.id}>{dep.name}</option>
              ))}
            </select>
          </div>
          <Button onClick={handleCreateUser} className="w-full">Create User</Button>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); resetForm(); }} title="Edit User">
        <div className="space-y-4">
          <Input
            label="Full Name"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
          />
          <div>
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Role</label>
            <select
              value={formData.roleId}
              onChange={e => setFormData({ ...formData, roleId: Number(e.target.value) })}
              className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:text-white"
            >
              <option value={0}>Select Role</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.name.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Department</label>
            <select
              value={formData.departmentId}
              onChange={e => setFormData({ ...formData, departmentId: Number(e.target.value) })}
              className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:text-white"
            >
              <option value={0}>Select Department</option>
              {departments.map(dep => (
                <option key={dep.id} value={dep.id}>{dep.name}</option>
              ))}
            </select>
          </div>
          <Button onClick={handleEditUser} className="w-full">Update User</Button>
        </div>
      </Modal>
    </div>
  );
};

export default UsersPage;
