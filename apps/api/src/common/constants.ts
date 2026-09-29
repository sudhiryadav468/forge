export const publicUserSelect = {
  id: true, name: true, email: true, avatarUrl: true, createdAt: true,
} as const;

export const writableRoles = ['OWNER', 'ADMIN', 'DEVELOPER'] as const;
export const managerRoles = ['OWNER', 'ADMIN'] as const;
