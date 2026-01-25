import { User } from '../App';
import { users as mockUsers } from '../lib/mockData';
import { useState } from 'react';
import {
  UserPlus,
  Edit2,
  Trash2,
  Shield,
  UserCog,
  GraduationCap
} from 'lucide-react';
import { SearchInput } from './ui/search-input';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './ui/select';
import { withRole } from '../hoc/withRole';

interface UsersProps {
  user: User;
}

interface UserFormData {
  name: string;
  email: string;
  role: 'admin' | 'moderator' | 'tutor';
  password?: string;
}

function Users({ user }: UsersProps) {
  const [users, setUsers] = useState(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    role: 'tutor',
    password: ''
  });

  const roleLabels = {
    admin: 'مدير',
    moderator: 'مشرف',
    tutor: 'معلم'
  };

  const roleIcons = {
    admin: Shield,
    moderator: UserCog,
    tutor: GraduationCap
  };

  const roleColors = {
    admin:
      'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    moderator:
      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    tutor:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
  };

  const handleOpenDialog = (userToEdit?: User) => {
    if (userToEdit) {
      setEditingUser(userToEdit);
      setFormData({
        name: userToEdit.name,
        email: userToEdit.email,
        role: userToEdit.role
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        role: 'tutor',
        password: ''
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingUser) {
      // Update existing user
      setUsers(
        users.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                name: formData.name,
                email: formData.email,
                role: formData.role
              }
            : u
        )
      );
    } else {
      // Add new user
      const newUser: User = {
        id: `${users.length + 1}`,
        name: formData.name,
        email: formData.email,
        role: formData.role
      };
      setUsers([...users, newUser]);
    }

    setIsDialogOpen(false);
  };

  const handleDelete = (userId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      setUsers(users.filter((u) => u.id !== userId));
    }
  };

  // Filter users based on search
  const filteredUsers = users.filter(
    (userItem) =>
      userItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      userItem.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      roleLabels[userItem.role].includes(searchQuery)
  );

  return (
    <div>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-2xl text-gray-800 dark:text-gray-100 mb-1'>
            إدارة المستخدمين
          </h1>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            إضافة وتعديل المستخدمين والصلاحيات
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => handleOpenDialog()}
              className='gap-2 bg-emerald-600 hover:bg-emerald-700 text-white'
              size='sm'
            >
              <UserPlus className='w-4 h-4' />
              <span>إضافة مستخدم</span>
            </Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-md' dir='rtl'>
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}
              </DialogTitle>
              <DialogDescription>
                {editingUser
                  ? 'قم بتعديل بيانات المستخدم'
                  : 'أدخل بيانات المستخدم الجديد'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className='space-y-4 py-4'>
                <div className='space-y-2'>
                  <Label htmlFor='name'>الاسم</Label>
                  <Input
                    id='name'
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className='text-right'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='email'>البريد الإلكتروني</Label>
                  <Input
                    id='email'
                    type='email'
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    className='text-right'
                    dir='ltr'
                  />
                </div>
                {!editingUser && (
                  <div className='space-y-2'>
                    <Label htmlFor='password'>كلمة المرور</Label>
                    <Input
                      id='password'
                      type='password'
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required
                      className='text-right'
                    />
                  </div>
                )}
                <div className='space-y-2'>
                  <Label htmlFor='role'>الدور</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: 'admin' | 'moderator' | 'tutor') =>
                      setFormData({ ...formData, role: value })
                    }
                  >
                    <SelectTrigger id='role'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='admin'>مدير</SelectItem>
                      <SelectItem value='moderator'>مشرف</SelectItem>
                      <SelectItem value='tutor'>معلم</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type='submit'
                  className='bg-emerald-600 hover:bg-emerald-700'
                >
                  {editingUser ? 'حفظ التعديلات' : 'إضافة'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className='mb-4'>
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder='البحث في المستخدمين...'
          className='max-w-md'
        />
      </div>

      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700'>
              <tr>
                <th className='px-4 py-3 text-right text-xs text-gray-700 dark:text-gray-300'>
                  الاسم
                </th>
                <th className='px-4 py-3 text-right text-xs text-gray-700 dark:text-gray-300'>
                  البريد الإلكتروني
                </th>
                <th className='px-4 py-3 text-right text-xs text-gray-700 dark:text-gray-300'>
                  الدور
                </th>
                <th className='px-4 py-3 text-left text-xs text-gray-700 dark:text-gray-300'>
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200 dark:divide-gray-700'>
              {filteredUsers.map((userItem) => {
                const RoleIcon = roleIcons[userItem.role];
                return (
                  <tr
                    key={userItem.id}
                    className='hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  >
                    <td className='px-4 py-3'>
                      <div className='text-sm text-gray-900 dark:text-gray-100'>
                        {userItem.name}
                      </div>
                    </td>
                    <td className='px-4 py-3'>
                      <div
                        className='text-sm text-gray-600 dark:text-gray-400'
                        dir='ltr'
                      >
                        {userItem.email}
                      </div>
                    </td>
                    <td className='px-4 py-3'>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs ${roleColors[userItem.role]}`}
                      >
                        <RoleIcon className='w-3 h-3' />
                        {roleLabels[userItem.role]}
                      </span>
                    </td>
                    <td className='px-4 py-3'>
                      <div className='flex items-center justify-end gap-2'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleOpenDialog(userItem)}
                          className='h-8 w-8 p-0'
                        >
                          <Edit2 className='w-4 h-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleDelete(userItem.id)}
                          disabled={userItem.id === user.id}
                          className='h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20'
                        >
                          <Trash2 className='w-4 h-4' />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredUsers.length === 0 && (
        <div className='text-center py-12 text-gray-500 dark:text-gray-400'>
          {searchQuery ? 'لا توجد نتائج للبحث' : 'لا يوجد مستخدمون'}
        </div>
      )}
    </div>
  );
}

export default withRole(Users, ['admin']);
