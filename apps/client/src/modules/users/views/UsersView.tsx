import { User, UserRole } from "@halaqa/shared";
import { users as mockUsers } from "@/lib/mockData";
import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import {
  UserPlus,
  Edit2,
  Trash2,
  Shield,
  UserCog,
  GraduationCap,
} from "lucide-react";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { withRole } from "@/hoc/withRole";
import { userSchema } from "../schema/user.schema";
import {
  DEFAULT_TIMEZONE,
  getTimezoneLabel,
  TIMEZONES,
} from "../../../../../../packages/shared/src/utils/timestamps";

interface UserFormData {
  name: string;
  username: string;
  role: UserRole;
  password?: string;
  timezone: string;
}

function UsersView() {
  const { user } = useApp();
  const [users, setUsers] = useState(mockUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editingUser, setEditingUser] = useState<(typeof mockUsers)[0] | null>(
    null,
  );
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    username: "",
    role: "TUTOR",
    password: "",
    timezone: DEFAULT_TIMEZONE,
  });

  if (!user) return null;

  const roleLabels: Record<string, string> = {
    ADMIN: "مدير",
    MODERATOR: "مشرف",
    TUTOR: "معلم",
    STUDENT: "طالب",
  };

  const roleIcons: Record<string, typeof Shield> = {
    ADMIN: Shield,
    MODERATOR: UserCog,
    TUTOR: GraduationCap,
    STUDENT: GraduationCap,
  };

  const roleColors: Record<string, string> = {
    ADMIN:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    MODERATOR:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    TUTOR:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    STUDENT: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  };

  const handleOpenDialog = (userToEdit?: User) => {
    if (userToEdit) {
      setEditingUser(userToEdit);
      setFormData({
        name: userToEdit.name,
        username: userToEdit.username || "",
        role: userToEdit.role,
        password: "",
        timezone: (userToEdit as any).timezone || DEFAULT_TIMEZONE,
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: "",
        username: "",
        role: "TUTOR",
        password: "",
        timezone: DEFAULT_TIMEZONE,
      });
    }
    setIsDialogOpen(true);
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = userSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors(
        Object.fromEntries(
          Object.entries(fieldErrors).map(([k, v]) => [k, v?.[0]]),
        ),
      );
      return;
    }

    setErrors({});

    const data = result.data;

    if (editingUser) {
      setUsers(
        users.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                name: data.name,
                username: data.username,
                role: data.role,
                timezone: data.timezone,
                updatedAt: new Date().toISOString(),
                ...(data.password ? { password: data.password } : {}),
              }
            : u,
        ),
      );
    } else {
      const newUser: User & { timezone: string } = {
        id: `u${users.length + 1}`,
        name: data.name,
        username: data.username,
        role: data.role,
        timezone: data.timezone,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setUsers([...users, newUser]);
    }

    setIsDialogOpen(false);
  };

  const handleDelete = (userId: string) => {
    if (confirm("هل أنت متأكد من حذف هذا المستخدم؟")) {
      setUsers(users.filter((u) => u.id !== userId));
    }
  };

  // Filter users based on search
  const filteredUsers = users.filter((userItem) =>
    userItem.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl text-gray-800 dark:text-gray-100 mb-1">
            إدارة المستخدمين
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            إضافة وتعديل المستخدمين والصلاحيات
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => handleOpenDialog()}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              size="sm"
            >
              <UserPlus className="w-4 h-4" />
              <span>إضافة مستخدم</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? "تعديل مستخدم" : "إضافة مستخدم جديد"}
              </DialogTitle>
              <DialogDescription>
                {editingUser
                  ? "قم بتعديل بيانات المستخدم"
                  : "أدخل بيانات المستخدم الجديد"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name">الاسم</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="text-right"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs">{errors.name}</p>
                  )}
                </div>

                {/* Username Field */}
                <div className="space-y-2">
                  <Label htmlFor="username">اسم الحساب</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="text-right"
                  />
                  {errors.username && (
                    <p className="text-red-500 text-xs">{errors.username}</p>
                  )}
                </div>

                {/* Password Field */}
                {user.role === "ADMIN" && (
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      كلمة المرور{" "}
                      {editingUser && "(اتركها فارغة للإبقاء على القديمة)"}
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder={editingUser ? "••••••••" : ""}
                    />
                    {errors.password && (
                      <p className="text-red-500 text-xs">{errors.password}</p>
                    )}
                  </div>
                )}

                {/* Role Field */}
                <div className="space-y-2">
                  <Label htmlFor="role">الدور</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: UserRole) =>
                      setFormData({ ...formData, role: value })
                    }
                  >
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">مدير</SelectItem>
                      <SelectItem value="MODERATOR">مشرف</SelectItem>
                      <SelectItem value="TUTOR">معلم</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="text-red-500 text-xs">{errors.role}</p>
                  )}
                </div>

                {/* Timezone Field */}
                <div className="space-y-2">
                  <Label htmlFor="timezone" className="flex items-center gap-2">
                    المنطقة الزمنية
                  </Label>
                  <Select
                    value={formData.timezone}
                    onValueChange={(value) =>
                      setFormData({ ...formData, timezone: value })
                    }
                  >
                    <SelectTrigger id="timezone">
                      <SelectValue placeholder="اختر المنطقة الزمنية" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          <div className="flex items-center justify-between w-full">
                            <span>{tz.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.timezone && (
                    <p className="text-red-500 text-xs">{errors.timezone}</p>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {editingUser ? "حفظ التعديلات" : "إضافة"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="mb-4">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="البحث في المستخدمين..."
          className="max-w-md"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-4 py-3 text-right text-xs text-gray-700 dark:text-gray-300">
                  الاسم
                </th>
                <th className="px-4 py-3 text-right text-xs text-gray-700 dark:text-gray-300">
                  اسم الحساب
                </th>
                <th className="px-4 py-3 text-right text-xs text-gray-700 dark:text-gray-300">
                  الدور
                </th>
                <th className="px-4 py-3 text-right text-xs text-gray-700 dark:text-gray-300">
                  المنطقة الزمنية
                </th>
                <th className="px-4 py-3 text-left text-xs text-gray-700 dark:text-gray-300">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((userItem) => {
                const RoleIcon = roleIcons[userItem.role];
                const userTimezone =
                  (userItem as any).timezone || DEFAULT_TIMEZONE;

                return (
                  <tr
                    key={userItem.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {userItem.name}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col text-xs text-gray-600 dark:text-gray-400">
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {userItem.username}{" "}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs ${roleColors[userItem.role]}`}
                      >
                        <RoleIcon className="w-3 h-3" />
                        {roleLabels[userItem.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                        {getTimezoneLabel(userTimezone)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(userItem)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(userItem.id)}
                          disabled={
                            userItem.id === user.id || userItem.role === "ADMIN"
                          }
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
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
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          {searchQuery ? "لا توجد نتائج للبحث" : "لا يوجد مستخدمون"}
        </div>
      )}
    </div>
  );
}

export default withRole(UsersView, ["ADMIN", "MODERATOR"]);
