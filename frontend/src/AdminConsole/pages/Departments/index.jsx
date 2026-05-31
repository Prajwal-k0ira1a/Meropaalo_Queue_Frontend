import { useCallback, useEffect, useState } from "react";
import { adminApi } from "../../api/adminApi";
import toast from "react-hot-toast";
import LottieLoader from "../../../components/LottieLoader";

const DEFAULT_FORM = {
  name: "",
  description: "",
  avgServiceTime: 10,
  isActive: true,
};

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [editingDepartmentId, setEditingDepartmentId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [, setError] = useState("");

  const loadDepartments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const list = await adminApi.getDepartments();
      const departmentsArr = Array.isArray(list)
        ? list
        : Array.isArray(list?.departments)
          ? list.departments
          : [];
      setDepartments(departmentsArr);
    } catch (err) {
      const errorMsg = err.message || "Failed to load departments";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  const resetForm = () => {
    setForm(DEFAULT_FORM);
    setEditingDepartmentId("");
  };

  const canSave = form.name.trim() && Number(form.avgServiceTime) > 0;

  const onSave = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    setError("");
    const loadingToast = toast.loading("Saving department...");
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        avgServiceTime: Number(form.avgServiceTime),
        isActive: Boolean(form.isActive),
      };
      if (editingDepartmentId) {
        await adminApi.updateDepartment(editingDepartmentId, payload);
        toast.dismiss(loadingToast);
        toast.success("Department updated successfully!");
      } else {
        await adminApi.createDepartment(payload);
        toast.dismiss(loadingToast);
        toast.success("Department created successfully!");
      }
      resetForm();
      await loadDepartments();
    } catch (err) {
      const errorMsg = err.message || "Failed to save department";
      setError(errorMsg);
      toast.dismiss(loadingToast);
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (department) => {
    setEditingDepartmentId(department._id);
    setForm({
      name: department.name || "",
      description: department.description || "",
      avgServiceTime: Number(department.avgServiceTime || 10),
      isActive: Boolean(department.isActive),
    });
  };

  const onDelete = async (departmentId) => {
    if (!window.confirm("Delete this department?")) return;
    setError("");
    const loadingToast = toast.loading("Deleting department...");
    try {
      await adminApi.deleteDepartment(departmentId);
      if (editingDepartmentId === departmentId) {
        resetForm();
      }
      toast.dismiss(loadingToast);
      toast.success("Department deleted successfully!");
      await loadDepartments();
    } catch (err) {
      const errorMsg = err.message || "Failed to delete department";
      setError(errorMsg);
      toast.dismiss(loadingToast);
      toast.error(errorMsg);
    }
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Department Management
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Create, edit, activate, and delete departments.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-5">
          <input
            value={form.name}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Department name"
            className="h-10 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-teal-500 md:col-span-2"
          />
          <input
            value={form.description}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Description (optional)"
            className="h-10 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-teal-500 md:col-span-2"
          />
          <input
            type="number"
            min={1}
            value={form.avgServiceTime}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, avgServiceTime: e.target.value }))
            }
            placeholder="Avg service (min)"
            className="h-10 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-teal-500"
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, isActive: e.target.checked }))
              }
              className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
            />
            Active
          </label>
          <button
            onClick={onSave}
            disabled={!canSave || saving}
            className="h-10 rounded-lg bg-teal-600 px-4 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <span className="inline-flex items-center gap-2">
                <LottieLoader size={14} className="shrink-0" ariaLabel="Saving department" />
                Saving...
              </span>
            ) : editingDepartmentId ? (
              "Update Department"
            ) : (
              "Add Department"
            )}
          </button>
          {editingDepartmentId && (
            <button
              onClick={resetForm}
              disabled={saving}
              className="h-10 rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-gray-200 bg-white p-4">
        <table className="w-full min-w-170">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-gray-400">
              <th className="pb-3">Name</th>
              <th className="pb-3">Description</th>
              <th className="pb-3">Avg Service Time</th>
              <th className="pb-3">Status</th>
              <th className="pb-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading && departments.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-sm text-gray-500">
                  No departments found.
                </td>
              </tr>
            )}
            {departments.map((department) => (
              <tr
                key={department._id}
                className="border-t border-gray-100 text-sm"
              >
                <td className="py-3 font-medium text-gray-800">
                  {department.name}
                </td>
                <td className="py-3 text-gray-600">
                  {department.description || "-"}
                </td>
                <td className="py-3 text-gray-600">
                  {department.avgServiceTime || "-"} min
                </td>
                <td className="py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      department.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {department.isActive ? "active" : "inactive"}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <div className="inline-flex gap-2">
                    <button
                      onClick={() => onEdit(department)}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(department._id)}
                      className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
