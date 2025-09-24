const Task = require("../models/Task");
const GlobalDAO = require("./GlobalDAO");
/**
 * Data Access Object (DAO) for the Task model.
 *
 * Extends the generic {@link GlobalDAO} class to provide
 * database operations (create, read, update, delete, getAll)
 * specifically for User documents.
 */
class TaskDAO extends GlobalDAO{
    constructor(){
        super(Task);
    }
    async deleteByUser(userId) {
        try {
        return await Task.deleteMany({ userId });
        } catch (error) {
        throw new Error("Error al eliminar tareas del usuario: " + error.message);
        }
    }
}

module.exports = new TaskDAO();