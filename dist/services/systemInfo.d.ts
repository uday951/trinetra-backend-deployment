export interface SystemInfo {
    cpuUsage: number;
    memoryUsage: number;
    storageUsage: number;
    batteryHealth: number;
    temperature: number;
    recommendations: string[];
}
export declare class SystemInfoService {
    getSystemInfo(): Promise<SystemInfo>;
    optimizeSystem(): Promise<SystemInfo>;
}
