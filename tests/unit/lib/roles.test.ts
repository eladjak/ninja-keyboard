import { describe, it, expect } from 'vitest'
import { hasPermission, requireRole } from '@/lib/auth/roles'

describe('hasPermission', () => {
  it('student can view own progress', () => {
    expect(hasPermission('student', 'view_own_progress')).toBe(true)
  })

  it('student cannot view class progress', () => {
    expect(hasPermission('student', 'view_class_progress')).toBe(false)
  })

  it('student cannot manage class', () => {
    expect(hasPermission('student', 'manage_class')).toBe(false)
  })

  it('teacher can view class progress', () => {
    expect(hasPermission('teacher', 'view_class_progress')).toBe(true)
  })

  it('teacher can manage class', () => {
    expect(hasPermission('teacher', 'manage_class')).toBe(true)
  })

  it('teacher cannot access admin panel', () => {
    expect(hasPermission('teacher', 'admin_panel')).toBe(false)
  })

  it('parent can manage children', () => {
    expect(hasPermission('parent', 'manage_children')).toBe(true)
  })

  it('parent cannot manage class', () => {
    expect(hasPermission('parent', 'manage_class')).toBe(false)
  })

  it('admin has all permissions', () => {
    expect(hasPermission('admin', 'view_own_progress')).toBe(true)
    expect(hasPermission('admin', 'view_class_progress')).toBe(true)
    expect(hasPermission('admin', 'manage_class')).toBe(true)
    expect(hasPermission('admin', 'manage_children')).toBe(true)
    expect(hasPermission('admin', 'admin_panel')).toBe(true)
  })
})

describe('requireRole', () => {
  it('returns Ok when role matches', () => {
    const result = requireRole('admin', 'admin')
    expect(result.isOk()).toBe(true)
  })

  it('returns Ok when admin accesses teacher-required resource', () => {
    const result = requireRole('admin', 'teacher')
    expect(result.isOk()).toBe(true)
  })

  it('returns Err when student tries to access teacher resource', () => {
    const result = requireRole('student', 'teacher')
    expect(result.isErr()).toBe(true)
  })

  it('returns Err when student tries to access admin resource', () => {
    const result = requireRole('student', 'admin')
    expect(result.isErr()).toBe(true)
  })
})
