export interface VpnStatus {
    isEnabled: boolean;
    currentServer: string;
    blockedDomains: string[];
    lastUpdated: string;
}
export declare class VpnService {
    private readonly apiKey;
    private readonly apiUrl;
    private currentStatus;
    private isDevelopment;
    constructor();
    connect(): Promise<VpnStatus>;
    disconnect(): Promise<VpnStatus>;
    getStatus(): Promise<VpnStatus>;
    blockDomain(domain: string): Promise<VpnStatus>;
    unblockDomain(domain: string): Promise<VpnStatus>;
    getBlockedDomains(): Promise<string[]>;
}
