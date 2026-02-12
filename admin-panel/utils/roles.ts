// Role definitions & permission system

export type Role = 'admin' | 'editor' | 'viewer';

export type Action =
    | 'blog:read'
    | 'blog:write'
    | 'blog:delete'
    | 'pages:read'
    | 'pages:write'
    | 'users:read'
    | 'users:write'
    | 'users:delete'
    | 'dashboard:view';

const PERMISSIONS: Record<Role, Action[]> = {
    admin: [
        'blog:read', 'blog:write', 'blog:delete',
        'pages:read', 'pages:write',
        'users:read', 'users:write', 'users:delete',
        'dashboard:view',
    ],
    editor: [
        'blog:read', 'blog:write', 'blog:delete',
        'pages:read', 'pages:write',
        'dashboard:view',
    ],
    viewer: [
        'blog:read',
        'pages:read',
        'dashboard:view',
    ],
};

export function hasPermission(role: Role, action: Action): boolean {
    const allowed = PERMISSIONS[role];
    if (!allowed) return false;
    return allowed.includes(action);
}

export function getRoleLabel(role: Role): string {
    const labels: Record<Role, string> = {
        admin: 'Administrator',
        editor: 'Editor',
        viewer: 'Viewer',
    };
    return labels[role] || role;
}

export function getRoleBadgeColor(role: Role): string {
    const colors: Record<Role, string> = {
        admin: 'bg-red-100 text-red-700',
        editor: 'bg-blue-100 text-blue-700',
        viewer: 'bg-gray-100 text-gray-700',
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
}

export const ALL_ROLES: Role[] = ['admin', 'editor', 'viewer'];
