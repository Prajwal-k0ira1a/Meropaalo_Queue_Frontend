import QueueLifecycleActions from "../../../components/QueueLifecycleActions";

export default function DashboardHeader({
  departments,
  selectedDepartmentId,
  onDepartmentChange,
  onActivateQueue,
  onCloseQueue,
  onResetQueue,
  onRefresh,
  queueStatus,
  loading,
}) {
  const safeDepartments = Array.isArray(departments) ? departments : [];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-sm text-gray-500 mt-1">
          Live monitoring of queue performance and staff availability.
        </p>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <select
          value={selectedDepartmentId}
          onChange={(e) => onDepartmentChange(e.target.value)}
          className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none focus:border-teal-500"
        >
          {safeDepartments.map((dept) => (
            <option key={dept._id} value={dept._id}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>

      <QueueLifecycleActions
        queueStatus={queueStatus}
        loading={loading}
        onRefresh={onRefresh}
        onActivateQueue={onActivateQueue}
        onCloseQueue={onCloseQueue}
        onResetQueue={onResetQueue}
      />
    </div>
  );
}
