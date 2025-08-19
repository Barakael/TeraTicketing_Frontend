import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Folder } from 'lucide-react';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';

interface Department {
  id: number;
  name: string;
  categories?: Category[];
  showCategories?: boolean;
}

interface Category {
  id: number;
  name: string;
  department_id: number;
  department: { id: number; name: string };
}

const DepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [departmentName, setDepartmentName] = useState('');
  const [categoryName, setCategoryName] = useState('');

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/departments');
      const deptData: Department[] = res.data.data || [];
      setDepartments(deptData.map(dept => ({ ...dept, categories: [], showCategories: false })));
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  // Fetch all categories and assign to their department
  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/categories');
      const allCategories: Category[] = res.data.data || [];

      setDepartments(prev =>
        prev.map(dept => ({
          ...dept,
          categories: allCategories.filter(cat => cat.department.id === dept.id),
        }))
      );
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    fetchDepartments().then(() => fetchCategories());
  }, []);

  // Add new department
  const handleAddDepartment = async () => {
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/departments', {
        name: departmentName,
      });
      setDepartments(prev => [...prev, { ...res.data.data, categories: [], showCategories: false }]);
      setDepartmentName('');
      setShowDepartmentModal(false);
    } catch (err) {
      console.error('Error adding department:', err);
    }
  };

  // Add new category to selected department
  const handleAddCategory = async () => {
    if (!selectedDepartment) return;

    try {
      const res = await axios.post('http://127.0.0.1:8000/api/categories', {
        name: categoryName,
        department_id: selectedDepartment.id,
      });

      setDepartments(prev =>
        prev.map(dept =>
          dept.id === selectedDepartment.id
            ? { ...dept, categories: [...(dept.categories || []), res.data.data] }
            : dept
        )
      );

      setCategoryName('');
      setShowCategoryModal(false);
    } catch (err) {
      console.error('Error adding category:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Departments</h1>
        <Button icon={<Plus size={18} />} onClick={() => setShowDepartmentModal(true)}>
          Add Department
        </Button>
      </div>

      <div className="space-y-4">
        {departments.map(dept => (
          <div key={dept.id} className="space-y-1">
            <div
              className="p-4 border rounded-lg flex items-center justify-between hover:bg-gray-50 cursor-pointer transition"
              onClick={() =>
                setDepartments(prev =>
                  prev.map(d =>
                    d.id === dept.id
                      ? { ...d, showCategories: !d.showCategories }
                      : { ...d, showCategories: false }
                  )
                )
              }
            >
              <div className="flex items-center space-x-3">
                <Folder size={24} className="text-blue-600" />
                <span className="font-medium">{dept.name}</span>
              </div>
              <Button
                size="sm"
                onClick={e => {
                  e.stopPropagation();
                  setSelectedDepartment(dept);
                  setShowCategoryModal(true);
                }}
              >
                Add Category
              </Button>
            </div>

            {/* Categories for this department */}
            {dept.showCategories && dept.categories?.length > 0 && (
              <ul className="pl-10 mt-2 space-y-1 transition-all">
                {dept.categories.map(cat => (
                  <li key={cat.id} className="px-3 py-2 border rounded-lg bg-gray-50">
                    {cat.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* Department Modal */}
      <Modal isOpen={showDepartmentModal} onClose={() => setShowDepartmentModal(false)} title="Add Department">
        <Input
          label="Department Name"
          value={departmentName}
          onChange={e => setDepartmentName(e.target.value)}
          placeholder="Enter department name"
        />
        <div className="flex space-x-3 pt-4">
          <Button onClick={handleAddDepartment} className="flex-1">
            Add
          </Button>
          <Button variant="outline" onClick={() => setShowDepartmentModal(false)} className="flex-1">
            Cancel
          </Button>
        </div>
      </Modal>

      {/* Category Modal */}
      <Modal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title={`Add Category for ${selectedDepartment?.name || ''}`}
      >
        <Input
          label="Category Name"
          value={categoryName}
          onChange={e => setCategoryName(e.target.value)}
          placeholder="Enter category name"
        />
        <div className="flex space-x-3 pt-4">
          <Button onClick={handleAddCategory} className="flex-1">
            Add
          </Button>
          <Button variant="outline" onClick={() => setShowCategoryModal(false)} className="flex-1">
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default DepartmentsPage;
