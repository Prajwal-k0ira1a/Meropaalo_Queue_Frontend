import { useCallback, useEffect, useState } from "react";
import { adminApi } from "../../api/adminApi";
import toast from "react-hot-toast";

const ROLE_OPTIONS = ["admin", "staff", "customer"];

export default function UsersPage() {
  const [roleFilter, setRoleFilter] = useState("");
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingRoles, setPendingRoles] = useState({});
  const [pendingDepartments, setPendingDepartments] = useState({});
  const [savingAll, setSavingAll] = useState(false);
  const [error, setError] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [list, deptList] = await Promise.all([
        adminApi.getUsers(roleFilter || undefined),
        adminApi.getDepartments(),
      ]);
      setUsers(
        Array.isArray(list)
          ? list
          : Array.isArray(list?.users)
            ? list.users
            : [],
      );
      setDepartments(
        Array.isArray(deptList)
          ? deptList
          : Array.isArray(deptList?.departments)
            ? deptList.departments
            : [],
      );
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

    if (nextRole !== "staff") {
      setPendingDepartments((prevDepartments) => ({
        ...prevDepartments,
        [userId]: "",
      }));
    }
  };

  const onDepartmentChange = (
    userId,
    currentDepartmentId,
    nextDepartmentId,
  ) => {
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

  const pendingCount = new Set([
    ...Object.keys(pendingRoles),
    ...Object.keys(pendingDepartments),
  ]).size;

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
      const roleUpdates = Array.isArray(Object.entries(pendingRoles))
        ? Object.entries(pendingRoles).map(([userId, role]) =>
            adminApi.assignUserRole(userId, role),
          )
        : [];
      await Promise.all(roleUpdates);

      const departmentUpdates = Array.isArray(
        Object.entries(pendingDepartments),
      )
        ? Object.entries(pendingDepartments).map(([userId, departmentId]) =>
            adminApi.assignUserDepartment(userId, departmentId || null),
          )
        : [];
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

  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage all users and update access roles from one place.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none focus:border-teal-500"
          >
            <option value="">All roles</option>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
            <option value="customer">Customer</option>
          </select>

          <button
            onClick={loadUsers}
            disabled={loading || savingAll}
            className="h-10 rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 md:col-span-1"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-gray-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Actions
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onDiscardChanges}
              disabled={pendingCount === 0 || savingAll}
              className="h-9 rounded-lg border border-gray-300 px-3 text-xs font-semibold text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Discard Changes
            </button>
            <button
              onClick={onSaveChanges}
              disabled={pendingCount === 0 || savingAll}
              className="h-9 rounded-lg bg-teal-600 px-3 text-xs font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingAll
                ? "Saving..."
                : pendingCount > 0
                  ? `Save Changes (${pendingCount})`
                  : "Save Changes"}
            </button>
          </div>
        </div>

        <table className="w-full min-w-170">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-gray-400">
              <th className="pb-3">Name</th>
              <th className="pb-3">Email</th>
              <th className="pb-3">Phone</th>
              <th className="pb-3">Department</th>
              <th className="pb-3">Role</th>
            </tr>
          </thead>
          <tbody>
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-sm text-gray-500">
                  No users found for this filter.
                </td>
              </tr>
            )}
            {(Array.isArray(users) ? users : []).map((user) => (
              <tr key={user._id} className="border-t border-gray-100 text-sm">
                {(() => {
                  const effectiveRole =
                    pendingRoles[user._id] || user.role || "customer";
                  const currentDepartmentId =
                    user.department?._id || user.department || "";
                  const selectedDepartmentId =
                    pendingDepartments[user._id] !== undefined
                      ? pendingDepartments[user._id]
                      : currentDepartmentId;

                  return (
                    <>
                      <td className="py-3 font-medium text-gray-800">
                        {user.name || "-"}
                      </td>
                      <td className="py-3 text-gray-600">
                        {user.email || "-"}
                      </td>
                      <td className="py-3 text-gray-600">
                        {user.phone || "-"}
                      </td>
                      <td className="py-3">
                        <select
                          value={selectedDepartmentId}
                          onChange={(e) =>
                            onDepartmentChange(
                              user._id,
                              currentDepartmentId,
                              e.target.value,
                            )
                          }
                          disabled={savingAll || effectiveRole !== "staff"}
                          className="h-9 w-40 rounded-lg border border-gray-300 bg-white px-2 text-sm text-gray-700 outline-none focus:border-teal-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <option value="">Unassigned</option>
                          {(Array.isArray(departments) ? departments : []).map(
                            (department) => (
                              <option
                                key={department._id}
                                value={department._id}
                              >
                                {department.name}
                              </option>
                            ),
                          )}
                        </select>
                      </td>
                      <td className="py-3">
                        <select
                          value={effectiveRole}
                          onChange={(e) =>
                            onRoleChange(
                              user._id,
                              user.role || "customer",
                              e.target.value,
                            )
                          }
                          disabled={savingAll}
                          className="h-9 w-36 rounded-lg border border-gray-300 bg-white px-2 text-sm text-gray-700 outline-none focus:border-teal-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {(Array.isArray(ROLE_OPTIONS)
                            ? ROLE_OPTIONS
                            : []
                          ).map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </td>
                    </>
                  );
                })()}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
