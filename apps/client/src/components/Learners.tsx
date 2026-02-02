import { useState } from 'react';
import { User } from '@halaqa/shared';
import { students } from '../lib/mockData';
import { UserPlus } from 'lucide-react';
import { withRole } from '../hoc/withRole';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './ui/dialog';
import { Button } from './ui/button';
import { SearchInput } from './ui/search-input';
import { LearnerItem } from './ui/learner-item';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface LearnersProps {
  user: User;
}

function Learners({ user: _user }: LearnersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<
    (typeof students)[0] | null
  >(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    telegram: '',
    notes: ''
  });

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.profile?.phone?.includes(searchQuery)
  );

  const handleAdd = () => {
    // In a real app, this would save to the backend
    console.log('Adding student:', formData);
    setFormData({ name: '', phone: '', whatsapp: '', telegram: '', notes: '' });
    setShowAddDialog(false);
  };

  const handleEdit = () => {
    // In a real app, this would update to the backend
    console.log('Updating student:', selectedStudent?.id, formData);
    setShowEditDialog(false);
    setSelectedStudent(null);
  };

  const handleDelete = (studentId: string) => {
    if (
      confirm('هل أنت متأكد من حذف هذا المتعلم؟ سيتم إزالته من جميع الحلقات.')
    ) {
      // In a real app, this would delete from the backend
      console.log('Deleting student:', studentId);
    }
  };

  const openEditDialog = (student: (typeof students)[0]) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name,
      phone: student.profile?.phone || '',
      whatsapp: student.profile?.whatsapp || '',
      telegram: student.profile?.telegram || '',
      notes: student.profile?.notes || ''
    });
    setShowEditDialog(true);
  };

  return (
    <div>
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6'>
        <div>
          <h1 className='text-2xl text-gray-800 dark:text-gray-100 mb-1'>
            المتعلمون
          </h1>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            إدارة قائمة المتعلمين
          </p>
        </div>

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className='gap-2'>
              <UserPlus className='w-4 h-4' />
              إضافة متعلم جديد
            </Button>
          </DialogTrigger>
          <DialogContent className='max-w-md'>
            <DialogHeader>
              <DialogTitle>إضافة متعلم جديد</DialogTitle>
            </DialogHeader>
            <div className='space-y-4 py-4'>
              <div>
                <Label htmlFor='add-name'>الاسم *</Label>
                <Input
                  id='add-name'
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder='أدخل اسم المتعلم'
                />
              </div>
              <div>
                <Label htmlFor='add-phone'>رقم الهاتف</Label>
                <Input
                  id='add-phone'
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder='+966...'
                />
              </div>
              <div>
                <Label htmlFor='add-whatsapp'>واتساب</Label>
                <Input
                  id='add-whatsapp'
                  value={formData.whatsapp}
                  onChange={(e) =>
                    setFormData({ ...formData, whatsapp: e.target.value })
                  }
                  placeholder='+966...'
                />
              </div>
              <div>
                <Label htmlFor='add-telegram'>تيليجرام</Label>
                <Input
                  id='add-telegram'
                  value={formData.telegram}
                  onChange={(e) =>
                    setFormData({ ...formData, telegram: e.target.value })
                  }
                  placeholder='@username'
                />
              </div>
              <div>
                <Label htmlFor='add-notes'>ملاحظات</Label>
                <Input
                  id='add-notes'
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder='ملاحظات إضافية'
                />
              </div>
              <Button
                onClick={handleAdd}
                disabled={!formData.name.trim()}
                className='w-full'
              >
                إضافة
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6'>
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder='ابحث عن متعلم بالاسم أو رقم الهاتف...'
        />
      </div>

      {/* Students List */}
      {filteredStudents.length === 0 ? (
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center'>
          <div className='flex flex-col items-center gap-3'>
            <div className='w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center'>
              <UserPlus className='w-8 h-8 text-gray-400' />
            </div>
            <p className='text-gray-500 dark:text-gray-400 text-lg'>
              {searchQuery ? 'لا توجد نتائج للبحث' : 'لا يوجد متعلمون'}
            </p>
          </div>
        </div>
      ) : (
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700'>
          {filteredStudents.map((student) => (
            <LearnerItem
              key={student.id}
              student={student}
              showActions={true}
              showContactLinks={true}
              onEdit={openEditDialog}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>تعديل بيانات المتعلم</DialogTitle>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div>
              <Label htmlFor='edit-name'>الاسم *</Label>
              <Input
                id='edit-name'
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder='أدخل اسم المتعلم'
              />
            </div>
            <div>
              <Label htmlFor='edit-phone'>رقم الهاتف</Label>
              <Input
                id='edit-phone'
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder='+966...'
              />
            </div>
            <div>
              <Label htmlFor='edit-whatsapp'>واتساب</Label>
              <Input
                id='edit-whatsapp'
                value={formData.whatsapp}
                onChange={(e) =>
                  setFormData({ ...formData, whatsapp: e.target.value })
                }
                placeholder='+966...'
              />
            </div>
            <div>
              <Label htmlFor='edit-telegram'>تيليجرام</Label>
              <Input
                id='edit-telegram'
                value={formData.telegram}
                onChange={(e) =>
                  setFormData({ ...formData, telegram: e.target.value })
                }
                placeholder='@username'
              />
            </div>
            <div>
              <Label htmlFor='edit-notes'>ملاحظات</Label>
              <Input
                id='edit-notes'
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder='ملاحظات إضافية'
              />
            </div>
            <Button
              onClick={handleEdit}
              disabled={!formData.name.trim()}
              className='w-full'
            >
              حفظ التغييرات
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default withRole(Learners, ['ADMIN', 'MODERATOR', 'TUTOR']);
