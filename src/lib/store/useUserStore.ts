import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
    id: string;
    name: string;
    email: string;
    company?: string;
    plan: string;
    avatar: string;
    createdAt: string;
    activeProject?: ProjectState;
}

export interface SettingsState {
    theme: 'system' | 'light' | 'dark';
    compactMode: boolean;
    emailAlerts: boolean;
    pushNotifications: boolean;
    aiCopilot: boolean;
    mobileDefaultSet: boolean;
}

export interface ProjectState {
    status: 'empty' | 'draft' | 'completed';
    currentStep: number;
    vision: string;
    aesthetic: string;
    features: string[];
    audience: string;
    voice: number;
    timeline: string;
    additionalInfo: string;
    lastUpdated: string;
}

interface UserState {
    user: User | null;
    isAuthenticated: boolean;
    activeProject: ProjectState;
    login: (userData: User) => void;
    signup: (userData: Omit<User, 'id' | 'plan' | 'avatar' | 'createdAt'>) => void;
    logout: () => void;
    updateProjectDraft: (data: Partial<ProjectState>) => void;
    completeProject: () => void;
    resetProject: () => void;
    updateUser: (data: Partial<User>) => void;
    settings: SettingsState;
    updateSettings: (data: Partial<SettingsState>) => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,

            login: (userData) => {
                set({
                    user: userData,
                    isAuthenticated: true,
                });
            },

            signup: (userData) => {
                const newUser: User = {
                    ...userData,
                    id: Math.random().toString(36).substring(2, 9),
                    plan: 'Free Tier', // Default plan
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`,
                    createdAt: new Date().toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    }),
                };

                set({
                    user: newUser,
                    isAuthenticated: true,
                });
            },

            logout: () => {
                set({
                    user: null,
                    isAuthenticated: false,
                });
            },

            updateUser: (data) => {
                set((state) => ({
                    user: state.user
                        ? { ...state.user, ...data }
                        : {
                            id: 'mock-1',
                            name: 'Jane Doe',
                            email: 'jane@example.com',
                            plan: 'Pro Membership',
                            avatar: 'https://i.pravatar.cc/150?u=jane',
                            createdAt: new Date().toISOString(),
                            ...data
                        } as User
                }));
            },

            activeProject: {
                status: 'empty',
                currentStep: 0,
                vision: '',
                aesthetic: '',
                features: [],
                audience: '',
                voice: 50,
                timeline: '',
                additionalInfo: '',
                lastUpdated: '',
            },

            updateProjectDraft: (data) => {
                set((state) => ({
                    activeProject: {
                        ...state.activeProject,
                        ...data,
                        status: state.activeProject.status === 'empty' ? 'draft' : state.activeProject.status,
                        lastUpdated: new Date().toISOString(),
                    }
                }));
            },

            completeProject: () => {
                set((state) => ({
                    activeProject: {
                        ...state.activeProject,
                        status: 'completed',
                        lastUpdated: new Date().toISOString(),
                    }
                }));
            },

            resetProject: () => {
                set({
                    activeProject: {
                        status: 'empty',
                        currentStep: 0,
                        vision: '',
                        aesthetic: '',
                        features: [],
                        audience: '',
                        voice: 50,
                        timeline: '',
                        additionalInfo: '',
                        lastUpdated: '',
                    }
                });
            },

            settings: {
                theme: 'system',
                compactMode: false,
                emailAlerts: true,
                pushNotifications: false,
                aiCopilot: true,
                mobileDefaultSet: false,
            },

            updateSettings: (data) => {
                set((state) => ({
                    settings: {
                        ...state.settings,
                        ...data,
                    }
                }));
            },
        }),
        {
            name: 'number1-user-storage', // unique name for localStorage key
        }
    )
);
