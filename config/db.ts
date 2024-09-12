import { ConnectionPool, config, IResult, Request } from 'mssql';
import SYSConfig from './config';

/* SQL CONFIG */
const sqlConfig: config = {
    user: SYSConfig.db.user,
    password: SYSConfig.db.password,
    server: SYSConfig.db.server,
    database: SYSConfig.db.database,
    options: {
        encrypt: true, // Use true if you're connecting to an Azure SQL Database
        enableArithAbort: true
    }
};

const sql = require('mssql');

sql.on('error', (err: Error) => {
    console.log('SQL ERROR:');
    console.log(err);
});

let conx: ConnectionPool;
sql.connect(sqlConfig).then((pool: any) => {
    conx = pool;
}).catch((err: Error) => {
    console.error('SQL Connection Error:', err);
});

export default async function executeQuery(query: string, params?: { [key: string]: any }): Promise<any[] | null> {
    params = params || {}; // default to empty object if undefined

    if (!conx) {
        console.error('No SQL connection pool available.');
        return null;
    }

    try {
        const req: Request = conx.request();

        // loop through params and add them as input
        Object.keys(params).forEach(key => {
            req.input(key, params[key]);
        });

        const result: IResult<any> = await req.query(query);

        return result.recordset === undefined ? result.rowsAffected : result.recordset;
    } catch (err) {
        console.error('SQL Query Error:', err);
        return null;
    }
}
