export declare class SystemSettingDto {
    key: string;
    value: any;
    description?: string;
    category?: string;
}
export declare class UpdateSystemSettingDto {
    value: any;
    description?: string;
}
export declare class SystemSettingsDto {
    commissionRate?: number;
    maxOrderDistance?: number;
    orderTimeout?: number;
    courierAcceptanceTime?: number;
    autoAssignment?: boolean;
    smsNotifications?: boolean;
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    maintenanceMode?: boolean;
    maintenanceMessage?: string;
}
