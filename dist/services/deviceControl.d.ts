export declare class DeviceControl {
    lockDevice(pin: string): Promise<void>;
    wipeDevice(confirmationCode: string): Promise<void>;
    playSound(): Promise<void>;
}
