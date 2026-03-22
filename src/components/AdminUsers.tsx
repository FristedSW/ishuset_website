import React, { useEffect, useState } from 'react';
import { AdminUser, userAPI, UserCreateRequest } from '../services/api';

const emptyForm: UserCreateRequest = {
  email: '',
  password: '',
  role: 'staff',
};

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [form, setForm] = useState<UserCreateRequest>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const data = await userAPI.getAll();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const created = await userAPI.create(form);
      setUsers((current) => [created, ...current]);
      setForm(emptyForm);
      setSuccess('User created');
      window.setTimeout(() => setSuccess(null), 2500);
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl font-bold text-stone-900">Users</h2>
        <p className="mt-2 text-sm text-stone-500">Admins can create new admin and staff accounts from here.</p>
      </div>

      {error && <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>}
      {success && <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

      <form onSubmit={handleSubmit} className="rounded-[2rem] bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
            placeholder="Email"
            className="rounded-2xl border border-stone-200 px-4 py-3"
            required
          />
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))}
            placeholder="Password"
            className="rounded-2xl border border-stone-200 px-4 py-3"
            required
          />
          <select
            value={form.role}
            onChange={(e) => setForm((current) => ({ ...current, role: e.target.value as UserCreateRequest['role'] }))}
            className="rounded-2xl border border-stone-200 px-4 py-3"
          >
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="mt-6">
          <button type="submit" className="rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white">
            Create user
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm">
        <div className="grid grid-cols-[1.5fr_auto_auto] gap-4 border-b border-stone-200 px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
          <div>Email</div>
          <div>Role</div>
          <div>Created</div>
        </div>
        {users.map((user) => (
          <div key={user.id} className="grid grid-cols-[1.5fr_auto_auto] items-center gap-4 border-b border-stone-100 px-6 py-4 last:border-b-0">
            <div className="font-medium text-stone-900">{user.email}</div>
            <div className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-stone-600">
              {user.role}
            </div>
            <div className="text-sm text-stone-500">
              {user.created_at ? new Date(user.created_at).toLocaleDateString('da-DK') : '-'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
