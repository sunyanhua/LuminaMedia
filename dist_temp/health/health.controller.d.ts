export declare class HealthController {
    check(): Promise<{
        status: string;
        timestamp: string;
        uptime: number;
    }>;
}
