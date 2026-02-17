import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Color {
    b: number;
    g: number;
    r: number;
}
export interface GeneratedLogoProjectSerialized {
    description: string;
    timestamp: bigint;
    logoSpecification: LogoSpecification;
}
export type Shape = {
    __kind__: "circle";
    circle: bigint;
} | {
    __kind__: "square";
    square: bigint;
} | {
    __kind__: "triangle";
    triangle: bigint;
};
export interface UserProfile {
    name: string;
}
export interface LogoSpecification {
    shapes: Array<Shape>;
    style: string;
    colors: Array<Color>;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addToFavorites(projectId: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cloneProject(projectId: string): Promise<void>;
    deleteProject(projectId: string): Promise<void>;
    editProject(projectId: string, newDescription: string, newLogoSpec: LogoSpecification): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFavorites(): Promise<Array<GeneratedLogoProjectSerialized>>;
    getSortedLogoProjects(): Promise<Array<GeneratedLogoProjectSerialized>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getViewedProjects(): Promise<Array<string>>;
    isCallerAdmin(): Promise<boolean>;
    markAsViewed(projectId: string): Promise<void>;
    removeFromFavorites(projectId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveGeneratedLogoProject(description: string, logoSpec: LogoSpecification): Promise<void>;
    searchProjectsByDescription(searchTerm: string): Promise<Array<GeneratedLogoProjectSerialized>>;
}
