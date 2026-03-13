// This file exports TypeScript types and interfaces used throughout the application.

export type User = {
    id: string;
    username: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
    updatedAt: Date;
};

export type Project = {
    id: string;
    name: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
};

export type Module = {
    id: string;
    name: string;
    projectId: string;
    createdAt: Date;
    updatedAt: Date;
};

export type TestCase = {
    id: string;
    name: string;
    moduleId: string;
    createdAt: Date;
    updatedAt: Date;
};

export type Recording = {
    id: string;
    testCaseId: string;
    data: string; // JSON string or any format you choose
    createdAt: Date;
    updatedAt: Date;
};