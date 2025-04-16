// src/services/schemaManager.ts
import fs from "fs";
import { supabase } from "../config/supabaseClient.js";
import path from "path";
import { fileURLToPath } from "url";
// Get the current directory of the module using import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export async function createUserSchema(userId) {
    const schemaName = `user_${userId}`;
    const sqlFilePath = path.resolve(__dirname, "../../src/db/schemas/schemas/create_user.sql"); // Adjust as necessary
    console.log("Resolved SQL file path:", sqlFilePath); // Add this line
    try {
        // Load and prepare the SQL file
        let sql = fs.readFileSync(sqlFilePath, "utf-8");
        sql = sql.replace(/{{schema_name}}/g, schemaName);
        // Execute the SQL on Supabase
        const { data, error } = await supabase.rpc("execute_sql", { sql });
        if (error) {
            console.error("Error executing SQL:", error);
            throw new Error("Failed to execute SQL on Supabase");
        }
        return data;
    }
    catch (err) {
        console.error("Error in createUserSchema:", err);
        throw err;
    }
}
