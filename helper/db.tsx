import { Database} from "sqlite3";
import { open } from 'sqlite';

export async function openDB() {
    return await open({
        filename: './db/database.sqlite',
        driver: Database
    })
}