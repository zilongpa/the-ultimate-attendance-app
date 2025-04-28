'use client';
import * as React from 'react';
import { PageContainer } from '@toolpad/core/PageContainer';
import { Crud, DataSource, DataSourceCache } from '@toolpad/core/Crud';
import { createOne, deleteOne, getMany, getOne, updateOne } from './actions';
import { User } from './types';

export const usersDataSource: DataSource<User> = {
    fields: [
        { field: 'email', headerName: 'Email', flex: 1 },
        { field: 'name', headerName: 'Name', flex: 1 },
        { field: 'role', headerName: 'Role', flex: 1, type: 'singleSelect', valueOptions: ['student', 'assistant', 'professor'] },
    ],

    getMany: async ({ paginationModel, filterModel, sortModel }) => {
        let processedUsers = await getMany();

        if (filterModel?.items?.length) {
            filterModel.items.forEach(({ field, value, operator }) => {
                if (!field || value == null) {
                    return;
                }

                processedUsers = processedUsers.filter((user) => {
                    const userValue = user[field];

                    switch (operator) {
                        case 'contains':
                            return String(userValue)
                                .toLowerCase()
                                .includes(String(value).toLowerCase());
                        case 'equals':
                            return userValue === value;
                        case 'startsWith':
                            return String(userValue)
                                .toLowerCase()
                                .startsWith(String(value).toLowerCase());
                        case 'endsWith':
                            return String(userValue)
                                .toLowerCase()
                                .endsWith(String(value).toLowerCase());
                        case '>':
                            return (userValue as number) > value;
                        case '<':
                            return (userValue as number) < value;
                        default:
                            return true;
                    }
                });
            });
        }

        if (sortModel?.length) {
            processedUsers.sort((a, b) => {
                for (const { field, sort } of sortModel) {
                    if ((a[field] as number) < (b[field] as number)) {
                        return sort === 'asc' ? -1 : 1;
                    }
                    if ((a[field] as number) > (b[field] as number)) {
                        return sort === 'asc' ? 1 : -1;
                    }
                }
                return 0;
            });
        }

        const start = paginationModel.page * paginationModel.pageSize;
        const end = start + paginationModel.pageSize;
        const paginatedUsers = processedUsers.slice(start, end);

        return {
            items: paginatedUsers,
            itemCount: processedUsers.length,
        };
    },

    getOne: async (userId) => {
        const userToShow = await getOne(userId as string);

        if (!userToShow) {
            throw new Error('User not found');
        }
        return userToShow;
    },

    createOne: async (data) => {
        const newUser = await createOne(data as User);
        if (!newUser) {
            throw new Error('Failed to create user');
        }
        return newUser;
    },

    updateOne: async (userId, data) => {
        const updatedUser = await updateOne(userId as string, data as Partial<User>);

        if (!updatedUser) {
            throw new Error('User not found');
        }
        return updatedUser;
    },

    deleteOne: async (userId) => {
       await deleteOne(userId as string);
    },

    validate: (formValues) => {
        let issues: { message: string; path: [keyof User] }[] = [];

        if (!formValues.email) {
            issues = [...issues, { message: 'Email is required', path: ['email'] }];
        }

        if (formValues.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)) {
            issues = [...issues, { message: 'Valid email is required', path: ['email'] }];
        }

        if (!formValues.name) {
            issues = [...issues, { message: 'Name is required', path: ['name'] }];
        }

        if (formValues.name && formValues.name.length < 2) {
            issues = [
                ...issues,
                {
                    message: 'Name must be at least 2 characters long',
                    path: ['name'],
                },
            ];
        }

        return { issues };
    },
};

const usersCache = new DataSourceCache();

export default function Users() {
    return (
        <PageContainer>
            <Crud<User>
                dataSource={usersDataSource}
                dataSourceCache={usersCache}
                rootPath="/users"
                initialPageSize={10}
                defaultValues={{ name: 'New user' }}
            />
        </PageContainer>
    );
}
