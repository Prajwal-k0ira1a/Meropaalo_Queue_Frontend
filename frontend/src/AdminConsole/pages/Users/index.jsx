import { useCallback, useEffect, useMemo, useState } from "react";
import { Edit3, Eye, EyeOff, KeyRound, Search, Save, Users } from "lucide-react";
import toast from "react-hot-toast";
import { adminApi } from "../../api/adminApi";
import LottieLoader from "../../../components/LottieLoader";

const ROLE_OPTIONS = ["admin", "staff", "customer"];

const emptyEditorState = {
  name: "",
  email: "",
  phone: "",
  role: "customer",
  department: "",
  password: "",
  confirmPassword: "",
};

const normalizeUsers = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.users)) return payload.users;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const normalizeDepartments = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.departments)) return payload.departments;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export default function UsersPage() {
  const [roleFilter, setRoleFilter] = useState("");
  const [search, setSearch] = useState("");
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingRoles, setPendingRoles] = useState({});
  const [pendingDepartments, setPendingDepartments] = useState({});
  const [savingAll, setSavingAll] = useState(false);
  const [error, setError] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState(emptyEditorState);
  const [savingUser, setSavingUser] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [list, deptList] = await Promise.all([
        adminApi.getUsers(roleFilter || undefined),
        adminApi.getDepartments(),
      ]);

      setUsers(normalizeUsers(list));
      setDepartments(normalizeDepartments(deptList));
      setPendingRoles({});
      setPendingDepartments({});
    } catch (err) {
      const errorMsg = err.message || "Failed to load users";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [roleFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const visibleUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((user) =>
      [user.name, user.email, user.phone, user.role, user.department?.name]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q)),
    );
  }, [search, users]);

  const pendingCount = useMemo(
    () =>
      new Set([
        ...Object.keys(pendingRoles),
        ...Object.keys(pendingDepartments),
      ]).size,
    [pendingDepartments, pendingRoles],
  );

  const stats = useMemo(() => {
    const total = users.length;
    const staff = users.filter((user) => user.role === "staff").length;
    const admins = users.filter((user) => user.role === "admin").length;
    return { total, staff, admins };
  }, [users]);

  const openEditor = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "customer",
      department: user.department?._id || user.department || "",
      password: "",
      confirmPassword: "",
    });
    setShowPassword(false);
  };

  const closeEditor = () => {
    if (savingUser) return;
    setEditingUser(null);
    setEditForm(emptyEditorState);
    setShowPassword(false);
  };

  const onRoleChange = (userId, currentRole, nextRole) => {
    if (!nextRole) return;

    setPendingRoles((prevRoles) => {
      const updated = { ...prevRoles };
      if (nextRole === currentRole) {
        delete updated[userId];
      } else {
        updated[userId] = nextRole;
      }
      return updated;
    });

    if (nextRole !== "staff" && nextRole !== "admin") {
      setPendingDepartments((prevDepartments) => ({
        ...prevDepartments,
        [userId]: "",
      }));
    }
  };

  const onDepartmentChange = (userId, currentDepartmentId, nextDepartmentId) => {
    setPendingDepartments((prev) => {
      const updated = { ...prev };
      if ((nextDepartmentId || "") === (currentDepartmentId || "")) {
        delete updated[userId];
      } else {
        updated[userId] = nextDepartmentId || "";
      }
      return updated;
    });
  };

  const onDiscardChanges = () => {
    setPendingRoles({});
    setPendingDepartments({});
  };

  const onSaveChanges = async () => {
    if (pendingCount === 0 || savingAll) return;
    setSavingAll(true);
    setError("");
    const loadingToast = toast.loading("Saving changes...");

    try {
      const roleUpdates = Object.entries(pendingRoles).map(([userId, role]) =>
        adminApi.assignUserRole(userId, role),
      );
      await Promise.all(roleUpdates);

      const departmentUpdates = Object.entries(pendingDepartments).map(
        ([userId, departmentId]) =>
          adminApi.assignUserDepartment(userId, departmentId || null),
      );
      await Promise.all(departmentUpdates);

      toast.dismiss(loadingToast);
      toast.success("Changes saved successfully!");
      await loadUsers();
    } catch (err) {
      const errorMsg = err.message || "Failed to update users";
      setError(errorMsg);
      toast.dismiss(loadingToast);
      toast.error(errorMsg);
    } finally {
      setSavingAll(false);
    }
  };

  const onSaveUser = async (event) => {
    event.preventDefault();
    if (!editingUser || savingUser) return;

    const trimmedName = editForm.name.trim();
    if (!trimmedName) {
      toast.error("Name is required");
      return;
    }

    const password = editForm.password.trim();
    const confirmPassword = editForm.confirmPassword.trim();
    if (password || confirmPassword) {
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }
      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
    }

    setSavingUser(true);
    const loadingToast = toast.loading("Updating user...");

    try {
      const payload = {
        name: trimmedName,
        email: editForm.email.trim(),
        phone: editForm.phone.trim(),
        role: editForm.role,
        department:
          editForm.role === "staff" ? editForm.department || null : null,
      };

      if (password) {
        payload.password = password;
      }

      await adminApi.updateUser(editingUser._id, payload);

      toast.dismiss(loadingToast);
      toast.success("User updated successfully!");
      closeEditor();
      await loadUsers();
    } catch (err) {
      const errorMsg = err.message || "Failed to update user";
      toast.dismiss(loadingToast);
      toast.error(errorMsg);
    } finally {
      setSavingUser(false);
    }
  };

  return (
    <div className="flex h-full flex-col gap-5">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              <Users size={12} />
              User Management
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Manage profiles, roles, and staff assignments.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
              Review user details, update access, and keep department
              assignments aligned from one clean workspace.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: "Total", value: stats.total },
              { label: "Staff", value: stats.staff },
              { label: "Admins", value: stats.admins },
            ].map((item) => (
              <div
                key={item.label}
                className="min-w-24 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                  {item.label}
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-3 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1.4fr_1fr_auto]">
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
          <Search size={15} className="text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            placeholder="Search name, email, phone, role, or department..."
          />
        </label>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400"
        >
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
          <option value="customer">Customer</option>
        </select>

        <button
          onClick={loadUsers}
          disabled={loading || savingAll || savingUser}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <LottieLoader size={14} className="shrink-0" ariaLabel="Refreshing users" />
              Refreshing
            </>
          ) : (
            "Refresh"
          )}
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Directory
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
              {visibleUsers.length} visible
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {pendingCount} pending change{pendingCount === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-5">
          {error ? (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Inline Actions
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={onDiscardChanges}
                disabled={pendingCount === 0 || savingAll}
                className="h-9 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Discard
              </button>
              <button
                onClick={onSaveChanges}
                disabled={pendingCount === 0 || savingAll}
                className="inline-flex h-9 items-center gap-2 rounded-xl bg-slate-900 px-3 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingAll ? (
                  <>
                    <LottieLoader size={14} className="shrink-0" ariaLabel="Saving changes" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={13} />
                    Save Changes {pendingCount > 0 ? `(${pendingCount})` : ""}
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Phone</th>
                  <th className="pb-3">Department</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {!loading && visibleUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-sm text-slate-500">
                      No users found for this filter.
                    </td>
                  </tr>
                )}

                {(Array.isArray(visibleUsers) ? visibleUsers : []).map((user) => {
                  const effectiveRole =
                    pendingRoles[user._id] || user.role || "customer";
                  const currentDepartmentId =
                    user.department?._id || user.department || "";
                  const selectedDepartmentId =
                    pendingDepartments[user._id] !== undefined
                      ? pendingDepartments[user._id]
                      : currentDepartmentId;

                  return (
                    <tr
                      key={user._id}
                      className="border-b border-slate-50 text-sm transition-colors hover:bg-slate-50/60"
                    >
                      <td className="py-4 pr-4 font-semibold text-slate-900">
                        <div>
                          <p>{user.name || "-"}</p>
                          <p className="mt-1 text-xs font-normal text-slate-400">
                            {String(user._id).slice(-6)}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 pr-4 text-slate-600">
                        {user.email || "-"}
                      </td>
                      <td className="py-4 pr-4 text-slate-600">
                        {user.phone || "-"}
                      </td>
                      <td className="py-4 pr-4">
                        <select
                          value={selectedDepartmentId}
                          onChange={(e) =>
                            onDepartmentChange(
                              user._id,
                              currentDepartmentId,
                              e.target.value,
                            )
                          }
                          disabled={savingAll || savingUser || (effectiveRole !== "staff" && effectiveRole !== "admin")}
                          className="h-10 w-44 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <option value="">Unassigned</option>
                          {(Array.isArray(departments) ? departments : []).map(
                            (department) => (
                              <option key={department._id} value={department._id}>
                                {department.name}
                              </option>
                            ),
                          )}
                        </select>
                      </td>
                      <td className="py-4 pr-4">
                        <select
                          value={effectiveRole}
                          onChange={(e) =>
                            onRoleChange(
                              user._id,
                              user.role || "customer",
                              e.target.value,
                            )
                          }
                          disabled={savingAll || savingUser}
                          className="h-10 w-36 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {ROLE_OPTIONS.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-4 pr-2">
                        <button
                          onClick={() => openEditor(user)}
                        disabled={savingAll || savingUser}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                          <Edit3 size={13} />
                          Edit details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-6 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-[28px] border border-slate-200 bg-white shadow-2xl">
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Edit Profile
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-slate-900">
                    {editingUser.name || "User profile"}
                  </h2>
                </div>
                <button
                  onClick={closeEditor}
                  disabled={savingUser}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Close
                </button>
              </div>
            </div>

            <form onSubmit={onSaveUser} className="space-y-6 px-6 py-6">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/40 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Users size={16} className="text-slate-500" />
                  <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
                    Profile Details
                  </h3>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">Name</span>
                    <input
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, name: e.target.value }))
                      }
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
                      placeholder="Full name"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">Phone</span>
                    <input
                      value={editForm.phone}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
                      placeholder="Phone number"
                    />
                  </label>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">Email</span>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, email: e.target.value }))
                      }
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-teal-500"
                      placeholder="Email address"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">Role</span>
                    <select
                      value={editForm.role}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          role: e.target.value,
                          department:
                            e.target.value === "staff" || e.target.value === "admin" ? prev.department : "",
                        }))
                      }
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
                    >
                      {ROLE_OPTIONS.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="mt-4 space-y-2 block">
                  <span className="text-sm font-semibold text-slate-700">
                    Department
                  </span>
                  <select
                    value={editForm.department}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        department: e.target.value,
                      }))
                    }
                    disabled={editForm.role !== "staff" && editForm.role !== "admin"}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100"
                  >
                    <option value="">Unassigned</option>
                    {(Array.isArray(departments) ? departments : []).map(
                      (department) => (
                        <option key={department._id} value={department._id}>
                          {department.name}
                        </option>
                      ),
                    )}
                  </select>
                  <p className="text-xs text-slate-400">
                    Department assignment is only available for staff accounts.
                  </p>
                </label>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/40 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <KeyRound size={16} className="text-slate-500" />
                  <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
                    Security
                  </h3>
                </div>

                <div className="grid gap-4">
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">
                      New Password
                    </span>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={editForm.password}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            password: e.target.value,
                          }))
                        }
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 pr-11 text-sm outline-none focus:border-slate-400"
                        placeholder="Leave blank to keep current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">
                      Confirm Password
                    </span>
                    <input
                      type="password"
                      value={editForm.confirmPassword}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
                      placeholder="Repeat new password"
                    />
                  </label>
                </div>

                <p className="mt-3 text-xs text-slate-400">
                  Only fill the password fields if you want to reset this user&apos;s
                  password.
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeEditor}
                  disabled={savingUser}
                  className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingUser}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingUser ? (
                    <>
                      <LottieLoader
                        size={14}
                        className="shrink-0"
                        ariaLabel="Saving user"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      Save User
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
