export default function EmptyState({
    icon: Icon,
    title = 'No data found',
    description = 'Get started by creating a new item',
    action,
    actionLabel = 'Create New',
    className = ''
}) {
    return (
        <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
            {Icon && (
                <div className="mb-4 p-4 bg-gray-100 rounded-full">
                    <Icon className="w-12 h-12 text-gray-400" />
                </div>
            )}

            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {title}
            </h3>

            {description && (
                <p className="text-gray-600 mb-6 max-w-md">
                    {description}
                </p>
            )}

            {action && (
                <button
                    onClick={action}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all hover:shadow-lg hover:-translate-y-0.5"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}

// Preset empty states for common scenarios
export function EmptyPatients({ onAddPatient }) {
    return (
        <EmptyState
            title="No patients yet"
            description="Start building your patient database by adding your first patient"
            action={onAddPatient}
            actionLabel="Add Patient"
        />
    );
}

export function EmptyAppointments({ onAddAppointment }) {
    return (
        <EmptyState
            title="No appointments scheduled"
            description="Schedule your first appointment to get started"
            action={onAddAppointment}
            actionLabel="Schedule Appointment"
        />
    );
}

export function EmptyUsers({ onInviteUser }) {
    return (
        <EmptyState
            title="No team members"
            description="Invite staff members to collaborate on patient care"
            action={onInviteUser}
            actionLabel="Invite User"
        />
    );
}
