"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var KubernetesScalingProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KubernetesScalingProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const autoscaling_interface_1 = require("../interfaces/autoscaling.interface");
let KubernetesScalingProvider = KubernetesScalingProvider_1 = class KubernetesScalingProvider {
    configService;
    logger = new common_1.Logger(KubernetesScalingProvider_1.name);
    simulatedDeployments = new Map();
    deploymentStatus = new Map();
    constructor(configService) {
        this.configService = configService;
        this.initializeSimulatedDeployments();
    }
    initializeSimulatedDeployments() {
        for (const rule of autoscaling_interface_1.PREDEFINED_SCALING_RULES) {
            const key = this.getDeploymentKey(rule.targetDeployment);
            const initialReplicas = Math.floor((rule.minReplicas + rule.maxReplicas) / 2);
            this.simulatedDeployments.set(key, initialReplicas);
            this.deploymentStatus.set(key, {
                availableReplicas: initialReplicas,
                readyReplicas: initialReplicas,
                updatedReplicas: initialReplicas,
                conditions: [
                    {
                        type: 'Available',
                        status: 'True',
                        reason: 'MinimumReplicasAvailable',
                        message: 'Deployment has minimum availability.',
                    },
                    {
                        type: 'Progressing',
                        status: 'True',
                        reason: 'NewReplicaSetAvailable',
                        message: 'ReplicaSet is progressing.',
                    },
                ],
            });
        }
        this.logger.log('Kubernetes模拟提供商初始化完成');
    }
    getDeploymentKey(deployment) {
        return `${deployment.namespace}/${deployment.name}`;
    }
    getName() {
        return 'kubernetes-simulated';
    }
    async isAvailable() {
        const kubernetesEnabled = this.configService.get('KUBERNETES_ENABLED', false);
        if (!kubernetesEnabled) {
            this.logger.debug('Kubernetes未启用，使用模拟模式');
        }
        return true;
    }
    async getCurrentReplicas(deployment) {
        const key = this.getDeploymentKey(deployment);
        const replicas = this.simulatedDeployments.get(key);
        if (replicas === undefined) {
            const newReplicas = 2;
            this.simulatedDeployments.set(key, newReplicas);
            this.logger.debug(`创建模拟部署: ${key}，副本数: ${newReplicas}`);
            return newReplicas;
        }
        return replicas;
    }
    async scaleDeployment(deployment, replicas) {
        const key = this.getDeploymentKey(deployment);
        const currentReplicas = this.simulatedDeployments.get(key) || 0;
        this.logger.log(`扩缩容: ${key}，当前副本: ${currentReplicas} -> 目标副本: ${replicas}`);
        this.simulatedDeployments.set(key, replicas);
        const status = this.deploymentStatus.get(key) || {
            availableReplicas: 0,
            readyReplicas: 0,
            updatedReplicas: 0,
            conditions: [],
        };
        status.availableReplicas = replicas;
        status.readyReplicas = replicas;
        status.updatedReplicas = replicas;
        status.conditions = [
            {
                type: 'Available',
                status: replicas > 0 ? 'True' : 'False',
                reason: replicas > 0 ? 'MinimumReplicasAvailable' : 'NoReplicasAvailable',
                message: replicas > 0
                    ? 'Deployment has minimum availability.'
                    : 'Deployment does not have minimum availability.',
            },
            {
                type: 'Progressing',
                status: 'True',
                reason: 'NewReplicaSetAvailable',
                message: 'ReplicaSet is progressing.',
            },
        ];
        this.deploymentStatus.set(key, status);
        await new Promise((resolve) => setTimeout(resolve, 100));
        this.logger.debug(`扩缩容完成: ${key}，新副本数: ${replicas}`);
        return true;
    }
    async getMetricValue(metric) {
        this.logger.debug(`获取模拟指标: ${metric.name}`);
        switch (metric.name) {
            case 'cpu_utilization':
                return this.getSimulatedCpuUsage();
            case 'memory_utilization':
                return this.getSimulatedMemoryUsage();
            case 'http_requests_per_second':
                return this.getSimulatedHttpRequests();
            case 'active_users':
                return this.getSimulatedActiveUsers();
            case 'queue_length':
                return this.getSimulatedQueueLength();
            default:
                return this.getSimulatedGenericMetric(metric.name);
        }
    }
    async getDeploymentStatus(deployment) {
        const key = this.getDeploymentKey(deployment);
        const status = this.deploymentStatus.get(key);
        if (!status) {
            const replicas = (await this.getCurrentReplicas(deployment)) || 0;
            return {
                availableReplicas: replicas,
                readyReplicas: replicas,
                updatedReplicas: replicas,
                conditions: [
                    {
                        type: 'Available',
                        status: replicas > 0 ? 'True' : 'False',
                        reason: replicas > 0 ? 'MinimumReplicasAvailable' : 'NoReplicasAvailable',
                        message: replicas > 0
                            ? 'Deployment has minimum availability.'
                            : 'Deployment does not have minimum availability.',
                    },
                    {
                        type: 'Progressing',
                        status: 'True',
                        reason: 'NewReplicaSetAvailable',
                        message: 'ReplicaSet is progressing.',
                    },
                ],
            };
        }
        return status;
    }
    getSimulatedCpuUsage() {
        const baseUsage = 50;
        const timeFactor = Math.sin(Date.now() / 60000);
        const randomFactor = Math.random() * 20 - 10;
        return Math.max(10, Math.min(95, baseUsage + timeFactor * 10 + randomFactor));
    }
    getSimulatedMemoryUsage() {
        const baseUsage = 60;
        const timeFactor = Math.cos(Date.now() / 90000);
        const randomFactor = Math.random() * 15 - 7.5;
        return Math.max(20, Math.min(90, baseUsage + timeFactor * 8 + randomFactor));
    }
    getSimulatedHttpRequests() {
        const hour = new Date().getHours();
        let baseRequests = 80;
        if ((hour >= 10 && hour < 12) ||
            (hour >= 14 && hour < 16) ||
            (hour >= 20 && hour < 22)) {
            baseRequests = 200;
        }
        else if (hour >= 0 && hour < 6) {
            baseRequests = 20;
        }
        const randomFactor = Math.random() * 50 - 25;
        return Math.max(0, baseRequests + randomFactor);
    }
    getSimulatedActiveUsers() {
        const hour = new Date().getHours();
        let baseUsers = 500;
        if ((hour >= 10 && hour < 12) ||
            (hour >= 14 && hour < 16) ||
            (hour >= 20 && hour < 22)) {
            baseUsers = 1200;
        }
        else if (hour >= 0 && hour < 6) {
            baseUsers = 100;
        }
        const randomFactor = Math.random() * 200 - 100;
        return Math.max(0, baseUsers + randomFactor);
    }
    getSimulatedQueueLength() {
        const hour = new Date().getHours();
        let baseLength = 50;
        if ((hour >= 9 && hour < 12) || (hour >= 14 && hour < 18)) {
            baseLength = 150;
        }
        const randomFactor = Math.random() * 50 - 25;
        return Math.max(0, baseLength + randomFactor);
    }
    getSimulatedGenericMetric(metricName) {
        const metricPatterns = {
            response_time: 150 + Math.random() * 100,
            error_rate: 0.5 + Math.random() * 2,
            throughput: 1000 + Math.random() * 500,
            latency: 80 + Math.random() * 40,
        };
        for (const [pattern, value] of Object.entries(metricPatterns)) {
            if (metricName.toLowerCase().includes(pattern)) {
                return value;
            }
        }
        return 100 + Math.random() * 100;
    }
    getAllSimulatedDeployments() {
        const result = new Map();
        for (const [key, replicas] of this.simulatedDeployments) {
            const status = this.deploymentStatus.get(key) || {
                availableReplicas: replicas,
                readyReplicas: replicas,
                updatedReplicas: replicas,
                conditions: [],
            };
            result.set(key, { replicas, status });
        }
        return result;
    }
    resetSimulatedDeployments() {
        this.simulatedDeployments.clear();
        this.deploymentStatus.clear();
        this.initializeSimulatedDeployments();
        this.logger.log('模拟部署已重置');
    }
};
exports.KubernetesScalingProvider = KubernetesScalingProvider;
exports.KubernetesScalingProvider = KubernetesScalingProvider = KubernetesScalingProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], KubernetesScalingProvider);
//# sourceMappingURL=kubernetes-scaling-provider.service.js.map