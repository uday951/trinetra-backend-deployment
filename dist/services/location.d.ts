export interface LocationData {
    latitude: number | null;
    longitude: number | null;
    accuracy: number | null;
    timestamp: string;
}
export declare class LocationTracker {
    private lastLocation;
    getCurrentLocation(): Promise<LocationData>;
    getLastKnownLocation(): Promise<LocationData>;
}
