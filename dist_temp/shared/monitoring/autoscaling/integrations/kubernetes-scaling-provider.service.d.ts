import { ConfigService } from '@nestjs/config';
import { ScalingProvider, ScalingMetric } from '../interfaces/autoscaling.interface';
export declare class KubernetesScalingProvider implements ScalingProvider {
    private readonly configService;
    private readonly logger;
    private readonly simulatedDeployments;
    private readonly deploymentStatus;
    constructor(configService: ConfigService);
    private initializeSimulatedDeployments;
    private getDeploymentKey;
    getName(): string;
    isAvailable(): Promise<boolean>;
    getCurrentReplicas(deployment: {
        name: string;
        namespace: string;
        apiVersion: string;
        kind: string;
    }): Promise<number>;
    scaleDeployment(deployment: {
        name: string;
        namespace: string;
        apiVersion: string;
        kind: string;
    }, replicas: number): Promise<boolean>;
    getMetricValue(metric: ScalingMetric): Promise<number>;
    getDeploymentStatus(deployment: {
        name: string;
        namespace: string;
        apiVersion: string;
        kind: string;
    }): Promise<{
        availableReplicas: number;
        readyReplicas: number;
        updatedReplicas: number;
        conditions: Array<{
            type: string;
            status: string;
            reason?: string;
            message?: string;
        }>;
    }>;
    private getSimulatedCpuUsage;
    private getSimulatedMemoryUsage;
    private getSimulatedHttpRequests;
    private getSimulatedActiveUsers;
    private getSimulatedQueueLength;
    private getSimulatedGenericMetric;
    getAllSimulatedDeployments(): Map<string, {
        replicas: number;
        status: {
            availableReplicas: number;
            readyReplicas: number;
            updatedReplicas: number;
            conditions: Array<{
                type: string;
                status: string;
                reason?: string;
                message?: string;
            }>;
        };
    }>;
    resetSimulatedDeployments(): void;
}
