export declare class DataCollectionController {
    healthCheck(): {
        status: string;
    };
    getTasks(): never[];
    createTask(task: any): any;
    getTask(taskId: string): {
        id: string;
    };
}
