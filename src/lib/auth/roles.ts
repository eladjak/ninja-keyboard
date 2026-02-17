import { Result, TaggedError } from 'better-result'
import type { UserRole } from '@/types/auth'

export type Permission =
  | 'view_own_progress'
  | 'view_class_progress'
  | 'manage_class'
  | 'manage_children'
  | 'admin_panel'

const PERMISSION_MATRIX: Record<UserRole, Permission[]> = {
  student: ['view_own_progress'],
  teacher: ['view_own_progress', 'view_class_progress', 'manage_class'],
  parent: ['view_own_progress', 'manage_children'],
  admin: [
    'view_own_progress',
    'view_class_progress',
    'manage_class',
    'manage_children',
    'admin_panel',
  ],
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return PERMISSION_MATRIX[role].includes(permission)
}

class InsufficientRoleError extends TaggedError('InsufficientRoleError')<{
  message: string
  currentRole: UserRole
  requiredRole: UserRole
}>() {}

const ROLE_HIERARCHY: Record<UserRole, number> = {
  student: 0,
  parent: 1,
  teacher: 2,
  admin: 3,
}

export function requireRole(
  currentRole: UserRole,
  requiredRole: UserRole
): Result<true, InsufficientRoleError> {
  if (ROLE_HIERARCHY[currentRole] >= ROLE_HIERARCHY[requiredRole]) {
    return Result.ok(true)
  }
  return Result.err(
    new InsufficientRoleError({
      message: `Role '${currentRole}' does not meet required role '${requiredRole}'`,
      currentRole,
      requiredRole,
    })
  )
}

export { InsufficientRoleError }
