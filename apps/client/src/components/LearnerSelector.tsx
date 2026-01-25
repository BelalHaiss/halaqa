import { useState, useMemo } from 'react';
import { students } from '../lib/mockData';
import { UserPlus, Check, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { SearchInput } from './ui/search-input';
import { LearnerItem } from './ui/learner-item';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface LearnerSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (studentId: string) => void;
  excludeIds?: string[];
  groupId?: string;
}

export default function LearnerSelector({
  open,
  onOpenChange,
  onSelect,
  excludeIds = [],
  groupId
}: LearnerSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newLearner, setNewLearner] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    telegram: '',
    notes: ''
  });

  // Filter available students
  const availableStudents = useMemo(() => {
    return students.filter((s) => !excludeIds.includes(s.id));
  }, [excludeIds]);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return availableStudents;

    const query = searchQuery.toLowerCase();
    return availableStudents.filter(
      (student) =>
        student.name.toLowerCase().includes(query) ||
        student.phone?.includes(query) ||
        student.whatsapp?.includes(query)
    );
  }, [searchQuery, availableStudents]);

  const handleSelectStudent = (studentId: string) => {
    onSelect(studentId);
    setSearchQuery('');
    onOpenChange(false);
  };

  const handleCreateNew = () => {
    // In a real app, this would create the student in the backend
    const newStudentId = `student-${Date.now()}`;
    console.log('Creating new student:', { ...newLearner, groupId });

    // Call the onSelect with the new student ID
    onSelect(newStudentId);

    // Reset form
    setNewLearner({
      name: '',
      phone: '',
      whatsapp: '',
      telegram: '',
      notes: ''
    });
    setShowCreateForm(false);
    setSearchQuery('');
    onOpenChange(false);
  };

  const toggleCreateForm = () => {
    setShowCreateForm(!showCreateForm);
    if (showCreateForm) {
      // If closing the form, pre-fill the name from search query
      setNewLearner({ ...newLearner, name: '' });
    } else {
      // If opening the form, pre-fill the name from search query
      setNewLearner({ ...newLearner, name: searchQuery });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl max-h-[80vh] flex flex-col'>
        <DialogHeader>
          <DialogTitle>إضافة متعلم للحلقة</DialogTitle>
        </DialogHeader>

        {!showCreateForm ? (
          <>
            {/* Search Section */}
            <div className='space-y-4'>
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder='ابحث عن متعلم بالاسم أو رقم الهاتف...'
              />

              {/* Create New Button */}
              <Button
                variant='outline'
                className='w-full gap-2 border-dashed border-2'
                onClick={toggleCreateForm}
              >
                <UserPlus className='w-4 h-4' />
                إنشاء متعلم جديد
              </Button>
            </div>

            {/* Search Results */}
            <div className='flex-1 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg'>
              {searchResults.length === 0 ? (
                <div className='p-8 text-center'>
                  <p className='text-gray-500 dark:text-gray-400 mb-4'>
                    {searchQuery
                      ? 'لا توجد نتائج للبحث'
                      : 'لا يوجد متعلمون متاحون'}
                  </p>
                  {searchQuery && (
                    <Button
                      variant='outline'
                      onClick={toggleCreateForm}
                      className='gap-2'
                    >
                      <UserPlus className='w-4 h-4' />
                      إنشاء "{searchQuery}" كمتعلم جديد
                    </Button>
                  )}
                </div>
              ) : (
                <div className='divide-y divide-gray-200 dark:divide-gray-700'>
                  {searchResults.map((student) => (
                    <div key={student.id} className='relative'>
                      <LearnerItem
                        student={student}
                        showPhone={true}
                        onClick={() => handleSelectStudent(student.id)}
                        className='border-0 rounded-none hover:bg-gray-50 dark:hover:bg-gray-800'
                      />
                      <div className='absolute left-4 top-1/2 transform -translate-y-1/2'>
                        <Check className='w-5 h-5 text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity' />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          /* Create New Form */
          <div className='space-y-4 py-2'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-medium text-gray-900 dark:text-gray-100'>
                إنشاء متعلم جديد
              </h3>
              <Button variant='ghost' size='sm' onClick={toggleCreateForm}>
                <X className='w-4 h-4' />
              </Button>
            </div>

            <div>
              <Label htmlFor='new-name'>الاسم *</Label>
              <Input
                id='new-name'
                value={newLearner.name}
                onChange={(e) =>
                  setNewLearner({ ...newLearner, name: e.target.value })
                }
                placeholder='أدخل اسم المتعلم'
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor='new-phone'>رقم الهاتف</Label>
              <Input
                id='new-phone'
                value={newLearner.phone}
                onChange={(e) =>
                  setNewLearner({ ...newLearner, phone: e.target.value })
                }
                placeholder='+966...'
              />
            </div>
            <div>
              <Label htmlFor='new-whatsapp'>واتساب</Label>
              <Input
                id='new-whatsapp'
                value={newLearner.whatsapp}
                onChange={(e) =>
                  setNewLearner({ ...newLearner, whatsapp: e.target.value })
                }
                placeholder='+966...'
              />
            </div>
            <div>
              <Label htmlFor='new-telegram'>تيليجرام</Label>
              <Input
                id='new-telegram'
                value={newLearner.telegram}
                onChange={(e) =>
                  setNewLearner({ ...newLearner, telegram: e.target.value })
                }
                placeholder='@username'
              />
            </div>
            <div>
              <Label htmlFor='new-notes'>ملاحظات</Label>
              <Input
                id='new-notes'
                value={newLearner.notes}
                onChange={(e) =>
                  setNewLearner({ ...newLearner, notes: e.target.value })
                }
                placeholder='ملاحظات إضافية'
              />
            </div>

            <div className='flex gap-2 pt-4'>
              <Button
                onClick={handleCreateNew}
                disabled={!newLearner.name.trim()}
                className='flex-1'
              >
                <UserPlus className='w-4 h-4 ml-2' />
                إنشاء وإضافة
              </Button>
              <Button variant='outline' onClick={toggleCreateForm}>
                إلغاء
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
