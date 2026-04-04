"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
const typeorm_1 = require("typeorm");
const common_1 = require("@nestjs/common");
class BaseRepository extends typeorm_1.Repository {
    logger = new common_1.Logger(this.constructor.name);
    async saveMany(entities, options) {
        try {
            this.logger.debug(`Saving ${entities.length} entities`);
            const result = await super.save(entities, options);
            this.logger.debug(`Successfully saved ${result.length} entities`);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to save ${entities.length} entities: ${error.message}`, error.stack);
            throw this.wrapDatabaseError(error, 'SAVE_MANY');
        }
    }
    async find(options) {
        try {
            this.logger.debug(`Finding entities with options: ${JSON.stringify(options)}`);
            const result = await super.find(options);
            this.logger.debug(`Found ${result ? result.length : 0} entities`);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to find entities: ${error.message}`, error.stack);
            throw this.wrapDatabaseError(error, 'FIND');
        }
    }
    async findById(id) {
        try {
            this.logger.debug(`Finding entity by id: ${id}`);
            const result = await super.findOne({ where: { id } });
            if (result) {
                this.logger.debug(`Entity found with id: ${id}`);
            }
            else {
                this.logger.debug(`Entity not found with id: ${id}`);
            }
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to find entity by id ${id}: ${error.message}`, error.stack);
            throw this.wrapDatabaseError(error, 'FIND_BY_ID');
        }
    }
    async findOne(options) {
        try {
            this.logger.debug(`Finding one entity with options: ${JSON.stringify(options)}`);
            const result = await super.findOne(options);
            if (result) {
                this.logger.debug(`Entity found`);
            }
            else {
                this.logger.debug(`Entity not found`);
            }
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to find one entity: ${error.message}`, error.stack);
            throw this.wrapDatabaseError(error, 'FIND_ONE');
        }
    }
    async deleteById(id) {
        try {
            this.logger.debug(`Deleting entity by id: ${id}`);
            const result = await super.delete(id);
            this.logger.debug(`Delete operation affected ${result.affected} rows`);
        }
        catch (error) {
            this.logger.error(`Failed to delete entity by id ${id}: ${error.message}`, error.stack);
            throw this.wrapDatabaseError(error, 'DELETE_BY_ID');
        }
    }
    async updateById(id, partialEntity) {
        try {
            this.logger.debug(`Updating entity with id: ${id}, data: ${JSON.stringify(partialEntity)}`);
            const result = await super.update(id, partialEntity);
            this.logger.debug(`Update operation affected ${result.affected} rows`);
        }
        catch (error) {
            this.logger.error(`Failed to update entity with id ${id}: ${error.message}`, error.stack);
            throw this.wrapDatabaseError(error, 'UPDATE_BY_ID');
        }
    }
    async count(options) {
        try {
            this.logger.debug(`Counting entities with options: ${JSON.stringify(options)}`);
            const result = await super.count(options);
            this.logger.debug(`Count result: ${result}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to count entities: ${error.message}`, error.stack);
            throw this.wrapDatabaseError(error, 'COUNT');
        }
    }
    async exists(options) {
        try {
            this.logger.debug(`Checking existence with options: ${JSON.stringify(options)}`);
            const count = await this.count(options);
            const exists = count > 0;
            this.logger.debug(`Exists: ${exists}`);
            return exists;
        }
        catch (error) {
            this.logger.error(`Failed to check existence: ${error.message}`, error.stack);
            throw this.wrapDatabaseError(error, 'EXISTS');
        }
    }
    createQueryBuilder(alias) {
        try {
            this.logger.debug(`Creating query builder with alias: ${alias}`);
            return super.createQueryBuilder(alias);
        }
        catch (error) {
            this.logger.error(`Failed to create query builder: ${error.message}`, error.stack);
            throw this.wrapDatabaseError(error, 'CREATE_QUERY_BUILDER');
        }
    }
    wrapDatabaseError(error, operation) {
        this.logger.error(`Database error in ${operation}: ${error.message}`);
        if (error.code === 'ER_DUP_ENTRY') {
            return new Error(`Duplicate entry: ${error.message}`);
        }
        else if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return new Error(`Foreign key constraint fails: ${error.message}`);
        }
        else if (error.code === 'ER_DATA_TOO_LONG') {
            return new Error(`Data too long for column: ${error.message}`);
        }
        else if (error.code === 'ER_LOCK_WAIT_TIMEOUT') {
            return new Error(`Database lock timeout: ${error.message}`);
        }
        else if (error.code === 'ER_DEADLOCK') {
            return new Error(`Database deadlock: ${error.message}`);
        }
        return error instanceof Error
            ? error
            : new Error(`Database error: ${error.message}`);
    }
    async transaction(operation) {
        const queryRunner = this.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const transactionalRepository = queryRunner.manager.getRepository(this.metadata.target);
            const result = await operation(transactionalRepository);
            await queryRunner.commitTransaction();
            return result;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Transaction failed: ${error.message}`, error.stack);
            throw this.wrapDatabaseError(error, 'TRANSACTION');
        }
        finally {
            await queryRunner.release();
        }
    }
}
exports.BaseRepository = BaseRepository;
//# sourceMappingURL=base.repository.js.map