"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = executeQuery;
const config_1 = __importDefault(require("./config"));
/* SQL CONFIG */
const sqlConfig = {
    user: config_1.default.db.user,
    password: config_1.default.db.password,
    server: config_1.default.db.server,
    database: config_1.default.db.database,
    options: {
        encrypt: true, // Use true if you're connecting to an Azure SQL Database
        enableArithAbort: true
    }
};
const sql = require('mssql');
sql.on('error', (err) => {
    console.log('SQL ERROR:');
    console.log(err);
});
let conx;
sql.connect(sqlConfig).then((pool) => {
    conx = pool;
}).catch((err) => {
    console.error('SQL Connection Error:', err);
});
function executeQuery(query, params) {
    return __awaiter(this, void 0, void 0, function* () {
        params = params || {}; // default to empty object if undefined
        if (!conx) {
            console.error('No SQL connection pool available.');
            return null;
        }
        try {
            const req = conx.request();
            // loop through params and add them as input
            Object.keys(params).forEach(key => {
                req.input(key, params[key]);
            });
            const result = yield req.query(query);
            return result.recordset === undefined ? result.rowsAffected : result.recordset;
        }
        catch (err) {
            console.error('SQL Query Error:', err);
            return null;
        }
    });
}
//# sourceMappingURL=db.js.map