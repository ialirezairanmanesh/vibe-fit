import React, { useState } from 'react';
import { UserProfile } from '../types';
import {
  User,
  Users,
  Plus,
  Check,
  Edit2,
  Trash2,
  Shield,
  X,
  Sparkles,
  Dumbbell,
  Scale,
  Ruler,
  Target,
  Award
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserProfile[];
  activeUser: UserProfile;
  onSelectUser: (userId: string) => void;
  onAddUser: (
    user: Omit<UserProfile, 'id' | 'createdAt'>,
    routineOption: 'empty' | 'copy'
  ) => void;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onDeleteUser: (userId: string) => void;
}

const AVATAR_COLORS = [
  '#D1FF00', // Lime
  '#38BDF8', // Sky
  '#F43F5E', // Rose
  '#A855F7', // Purple
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#EC4899', // Pink
  '#6366F1'  // Indigo
];

const FITNESS_GOALS = [
  'عضله‌سازی و هایپرتروفی',
  'کاهش وزن و چربی‌سوزی',
  'افزایش قدرت و توان',
  'تناسب اندام عمومی و سلامتی'
];

const EXPERIENCE_LEVELS: Array<'مبتدی' | 'متوسط' | 'پیشرفته'> = [
  'مبتدی',
  'متوسط',
  'پیشرفته'
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  users,
  activeUser,
  onSelectUser,
  onAddUser,
  onUpdateUser,
  onDeleteUser
}) => {
  const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // Form State for Add / Edit
  const [name, setName] = useState('');
  const [avatarColor, setAvatarColor] = useState('#D1FF00');
  const [goal, setGoal] = useState('عضله‌سازی و هایپرتروفی');
  const [experienceLevel, setExperienceLevel] = useState<'مبتدی' | 'متوسط' | 'پیشرفته'>('متوسط');
  const [weightKg, setWeightKg] = useState<string>('75');
  const [heightCm, setHeightCm] = useState<string>('178');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [routineOption, setRoutineOption] = useState<'empty' | 'copy'>('empty');

  if (!isOpen) return null;

  const handleOpenAdd = () => {
    setName(`کاربر ${users.length + 1}`);
    const nextColor = AVATAR_COLORS[users.length % AVATAR_COLORS.length];
    setAvatarColor(nextColor);
    setGoal('عضله‌سازی و هایپرتروفی');
    setExperienceLevel('متوسط');
    setWeightKg('75');
    setHeightCm('178');
    setGender('male');
    setRoutineOption('empty');
    setMode('add');
  };

  const handleOpenEdit = (user: UserProfile) => {
    setEditingUser(user);
    setName(user.name);
    setAvatarColor(user.avatarColor || '#D1FF00');
    setGoal(user.goal || 'عضله‌سازی و هایپرتروفی');
    setExperienceLevel(user.experienceLevel || 'متوسط');
    setWeightKg(user.weightKg ? String(user.weightKg) : '');
    setHeightCm(user.heightCm ? String(user.heightCm) : '');
    setGender(user.gender || 'male');
    setMode('edit');
  };

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddUser(
      {
        name: name.trim(),
        avatarColor,
        goal,
        experienceLevel,
        weightKg: weightKg ? parseFloat(weightKg) : undefined,
        heightCm: heightCm ? parseFloat(heightCm) : undefined,
        gender
      },
      routineOption
    );

    setMode('list');
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !name.trim()) return;

    onUpdateUser({
      ...editingUser,
      name: name.trim(),
      avatarColor,
      goal,
      experienceLevel,
      weightKg: weightKg ? parseFloat(weightKg) : undefined,
      heightCm: heightCm ? parseFloat(heightCm) : undefined,
      gender
    });

    setMode('list');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#D1FF00]/15 text-[#D1FF00] border border-[#D1FF00]/30 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-neutral-100">
                {mode === 'list' && 'مدیریت کاربران و حافظه دستگاه'}
                {mode === 'add' && 'افزودن کاربر جدید به این دستگاه'}
                {mode === 'edit' && 'ویرایش مشخصات کاربر'}
              </h2>
              <p className="text-[11px] text-neutral-400">
                {mode === 'list' && 'هر کاربر دارای برنامه‌ها، تاریخچه و آمار کاملاً مجزا است.'}
                {mode === 'add' && 'اطلاعات در حافظه محلی همین دستگاه ذخیره می‌شود.'}
                {mode === 'edit' && `در حال ویرایش: ${editingUser?.name}`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-100 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Privacy & Device Storage Note */}
          <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-300">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold block text-emerald-200 mb-0.5">
                ذخیره‌سازی ۱۰۰٪ محلی روی همین دستگاه:
              </span>
              تمامی تمرینات، برنامه‌ها و اطلاعات شما منحصراً در حافظه داخلی همین دستگاه (مرورگر) ذخیره می‌شوند. هیچ داده‌ای به سرور عمومی فرستاده نمی‌شود و با دیگران به اشتراک گذاشته نخواهد شد.
            </div>
          </div>

          {/* LIST MODE */}
          {mode === 'list' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-300">
                  کاربران فعال روی این دستگاه ({users.length}):
                </span>
                <button
                  onClick={handleOpenAdd}
                  className="px-3 py-1.5 rounded-xl bg-[#D1FF00] hover:bg-[#bce600] text-[#0A0A0A] text-xs font-extrabold flex items-center gap-1.5 transition shadow-md shadow-[#D1FF00]/15"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>افزودن کاربر جدید</span>
                </button>
              </div>

              {/* Users Cards List */}
              <div className="space-y-2.5">
                {users.map((u) => {
                  const isActive = u.id === activeUser.id;
                  return (
                    <div
                      key={u.id}
                      className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                        isActive
                          ? 'bg-neutral-800/90 border-[#D1FF00]/60 shadow-lg shadow-[#D1FF00]/5 ring-1 ring-[#D1FF00]/40'
                          : 'bg-neutral-950/60 hover:bg-neutral-800/40 border-neutral-800'
                      }`}
                    >
                      <div
                        onClick={() => onSelectUser(u.id)}
                        className="flex items-center gap-3 cursor-pointer flex-1"
                      >
                        {/* Avatar */}
                        <div
                          className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-slate-950 shadow-md shrink-0"
                          style={{ backgroundColor: u.avatarColor || '#D1FF00' }}
                        >
                          <User className="w-6 h-6 stroke-[2.5]" />
                        </div>

                        {/* Details */}
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-neutral-100">
                              {u.name}
                            </span>
                            {isActive && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#D1FF00] text-slate-950">
                                کاربر فعال
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                            <span>{u.goal || 'عضله‌سازی'}</span>
                            {u.experienceLevel && (
                              <>
                                <span>•</span>
                                <span>سطح: {u.experienceLevel}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {!isActive && (
                          <button
                            onClick={() => onSelectUser(u.id)}
                            className="py-1.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition"
                          >
                            انتخاب
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenEdit(u)}
                          title="ویرایش مشخصات"
                          className="w-8 h-8 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {users.length > 1 && (
                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  `آیا از حذف کاربر «${u.name}» و تمام برنامه‌ها و سوابق تمرینی این کاربر اطمینان دارید؟ این عملیات قابل بازگشت نیست.`
                                )
                              ) {
                                onDeleteUser(u.id);
                              }
                            }}
                            title="حذف کاربر"
                            className="w-8 h-8 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 flex items-center justify-center transition border border-rose-800/40"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ADD / EDIT FORM */}
          {(mode === 'add' || mode === 'edit') && (
            <form
              onSubmit={mode === 'add' ? handleSubmitAdd : handleSubmitEdit}
              className="space-y-4"
            >
              {/* Name Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-neutral-300">
                  نام کاربر یا لقب:
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: علیرضا، سارا، رفیق تمرینی"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-neutral-100 text-sm focus:outline-none focus:border-[#D1FF00]"
                />
              </div>

              {/* Avatar Color */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-neutral-300">
                  رنگ نماد کاربری:
                </label>
                <div className="flex items-center gap-2">
                  {AVATAR_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setAvatarColor(c)}
                      className="w-8 h-8 rounded-xl transition transform active:scale-95 flex items-center justify-center shadow-md"
                      style={{ backgroundColor: c }}
                    >
                      {avatarColor === c && (
                        <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Goal Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-neutral-300 flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-[#D1FF00]" />
                  هدف اصلی تمرین:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {FITNESS_GOALS.map((g) => {
                    const isSelected = goal === g;
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGoal(g)}
                        className={`p-2.5 rounded-2xl text-xs font-bold text-right border transition ${
                          isSelected
                            ? 'bg-[#D1FF00]/15 border-[#D1FF00] text-[#D1FF00]'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                        }`}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Experience Level */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-neutral-300 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  سطح سابقه ورزشی:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {EXPERIENCE_LEVELS.map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setExperienceLevel(lvl)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition border text-center ${
                        experienceLevel === lvl
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weight & Height */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-300 flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5 text-sky-400" />
                    وزن (کیلوگرم):
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    placeholder="مثال: 75"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-neutral-100 text-sm focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-300 flex items-center gap-1">
                    <Ruler className="w-3.5 h-3.5 text-emerald-400" />
                    قد (سانتی‌متر):
                  </label>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    placeholder="مثال: 178"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-neutral-100 text-sm focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {/* Initial Program Choice (Only for Add Mode) */}
              {mode === 'add' && (
                <div className="space-y-2 pt-2 border-t border-neutral-800">
                  <label className="block text-xs font-bold text-neutral-200 flex items-center gap-1">
                    <Dumbbell className="w-3.5 h-3.5 text-[#D1FF00]" />
                    برنامه تمرینی اولیه برای این کاربر:
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 cursor-pointer hover:border-neutral-700">
                      <input
                        type="radio"
                        name="routineOption"
                        checked={routineOption === 'empty'}
                        onChange={() => setRoutineOption('empty')}
                        className="accent-[#D1FF00]"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-neutral-200 block">
                          برنامه خالی (شروع از ابتدا بدون برنامه پیش‌فرض)
                        </span>
                        <span className="text-[11px] text-neutral-400">
                          کاربر برنامه خود را از روی متن پیام مربی یا دستی تعریف می‌کند
                        </span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 cursor-pointer hover:border-neutral-700">
                      <input
                        type="radio"
                        name="routineOption"
                        checked={routineOption === 'copy'}
                        onChange={() => setRoutineOption('copy')}
                        className="accent-[#D1FF00]"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-neutral-200 block">
                          کپی از برنامه کاربر فعلی ({activeUser.name})
                        </span>
                        <span className="text-[11px] text-neutral-400">
                          روزها و حرکات ثبت‌شده کاربر فعلی برای کاربر جدید کپی می‌شود
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setMode('list')}
                  className="py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl bg-[#D1FF00] hover:bg-[#bce600] text-[#0A0A0A] text-xs font-extrabold transition shadow-lg shadow-[#D1FF00]/15"
                >
                  {mode === 'add' ? 'ایجاد و ورود به کاربر' : 'ذخیره تغییرات'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
