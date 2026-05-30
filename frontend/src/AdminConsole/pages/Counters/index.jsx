import { useCallback, useEffect, useState } from "react";
import { adminApi } from "../../api/adminApi";
import toast from "react-hot-toast";

export default function CountersPage() {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [counters, setCounters] = useState([]);
  const [staffUsers, setStaffUsers] = useState([]);
  const [counterName, setCounterName] = useState("");
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState("");

  const loadData = useCallback(async (deptId = "") => {
    const [deptList, counterList, staffList, adminList] = await Promise.all([
      adminApi.getDepartments(),
      adminApi.getCounters(deptId),
      adminApi.getUsers("staff"),
      adminApi.getUsers("admin"),
    ]);

    const departmentsArr = Array.isArray(deptList)
      ? deptList
      : Array.isArray(deptList?.departments)
        ? deptList.departments
        : [];
    const countersArr = Array.isArray(counterList)
      ? counterList
      : Array.isArray(counterList?.counters)
        ? counterList.counters
        : [];
    const staffArr = Array.isArray(staffList)
      ? staffList
      : Array.isArray(staffList?.users)
        ? staffList.users
        : [];
    const adminArr = Array.isArray(adminList)
      ? adminList
      : Array.isArray(adminList?.users)
        ? adminList.users
        : [];

    setDepartments(departmentsArr);
    setCounters(countersArr);
    const merged = [...staffArr, ...adminArr];
    setStaffUsers(
      merged.filter(
        (u, idx, arr) => idx === arr.findIndex((x) => x._id === u._id),
      ),
    );
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError("");
      try {
        await loadData();
      } catch (err) {
        const errorMsg = err.message || "Failed to load counters";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [loadData]);

  useEffect(() => {
    const refresh = async () => {
      setLoading(true);
      setError("");
      try {
        await loadData(selectedDepartmentId);
      } catch (err) {
        const errorMsg = err.message || "Failed to refresh counters";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    refresh();
  }, [selectedDepartmentId, loadData]);

  const canCreate = counterName.trim() && selectedDepartmentId;

  const onCreate = async () => {
    if (!canCreate || creating) return;
    setCreating(true);
    setError("");
    const loadingToast = toast.loading("Creating counter...");
    try {
      await adminApi.createCounter(null, {
        counterName: counterName.trim(),
        department: selectedDepartmentId,
        status: "open",
      });
      setCounterName("");
      toast.dismiss(loadingToast);
      toast.success("Counter created successfully!");
      await loadData(selectedDepartmentId);
    } catch (err) {
      const errorMsg = err.message || "Failed to create counter";
      setError(errorMsg);
      toast.dismiss(loadingToast);
      toast.error(errorMsg);
    } finally {
      setCreating(false);
    }
  };

  const onToggleStatus = async (counter) => {
    setError("");
    const loadingToast = toast.loading("Updating counter status...");
    try {
      await adminApi.updateCounter(counter._id, null, {
        status: counter.status === "open" ? "closed" : "open",
      });
      toast.dismiss(loadingToast);
      toast.success("Counter status updated!");
      await loadData(selectedDepartmentId);
    } catch (err) {
      const errorMsg = err.message || "Failed to update counter";
      setError(errorMsg);
      toast.dismiss(loadingToast);
      toast.error(errorMsg);
    }
  };

  const onAssignStaff = async (counterId, staffId) => {
    setError("");
    const loadingToast = toast.loading("Assigning staff...");
    try {
      await adminApi.assignCounterStaff(counterId, null, staffId || null);
      toast.dismiss(loadingToast);
      toast.success("Staff assigned successfully!");
      await loadData(selectedDepartmentId);
    } catch (err) {
      const errorMsg = err.message || "Failed to assign staff";
      setError(errorMsg);
      toast.dismiss(loadingToast);
      toast.error(errorMsg);
    }
  };

  const getAssignableUsers = (counter) => {
    const counterDeptId = String(
      counter.department?._id || counter.department || "",
    );
    return staffUsers.filter((user) => {
      if (user.role === "admin") return true;
      if (user.role !== "staff") return false;
      return (
        String(user.department?._id || user.department || "") === counterDeptId
      );
    });
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Counter Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Create counters, manage status, and assign staff based on backend
          data.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <select
            value={selectedDepartmentId}
            onChange={(e) => setSelectedDepartmentId(e.target.value)}
            className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none focus:border-teal-500"
          >
            <option value="">Select department</option>
            {(Array.isArray(departments) ? departments : []).map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>

          <input
            value={counterName}
            onChange={(e) => setCounterName(e.target.value)}
            placeholder="Counter name (e.g., Counter 1)"
            className="h-10 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-teal-500 md:col-span-2"
          />

          <button
            onClick={onCreate}
            disabled={!canCreate || creating}
            className="h-10 rounded-lg bg-teal-600 px-4 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creating ? "Creating..." : "Add Counter"}
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-gray-200 bg-white p-4">
        <table className="w-full min-w-170">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-gray-400">
              <th className="pb-3">Counter</th>
              <th className="pb-3">Department</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Assigned Staff</th>
              <th className="pb-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading && counters.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-sm text-gray-500">
                  No counters found for this selection.
                </td>
              </tr>
            )}
            {(Array.isArray(counters) ? counters : []).map((counter) => (
              <tr
                key={counter._id}
                className="border-t border-gray-100 text-sm"
              >
                {(() => {
                  const assignableUsers = getAssignableUsers(counter);
                  return (
                    <>
                      <td className="py-3 font-medium text-gray-800">
                        {counter.counterName}
                      </td>
                      <td className="py-3 text-gray-600">
                        {counter.department?.name || "Unassigned"}
                      </td>
                      <td className="py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            counter.status === "open"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {counter.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <select
                          value={counter.staff?._id || counter.staff || ""}
                          onChange={(e) =>
                            onAssignStaff(counter._id, e.target.value)
                          }
                          className="h-9 w-40 rounded-lg border border-gray-300 bg-white px-2 text-sm text-gray-700 outline-none focus:border-teal-500"
                        >
                          <option value="">Unassigned</option>
                          {(Array.isArray(assignableUsers)
                            ? assignableUsers
                            : []
                          ).map((staff) => (
                            <option key={staff._id} value={staff._id}>
                              {staff.name} ({staff.role})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => onToggleStatus(counter)}
                          className="rounded-lg border border-teal-600 px-3 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-50"
                        >
                          Mark {counter.status === "open" ? "Closed" : "Open"}
                        </button>
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
