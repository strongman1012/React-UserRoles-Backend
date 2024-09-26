"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: '.env.userrole' });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const passport_1 = __importDefault(require("./config/passport"));
const body_parser_1 = __importDefault(require("body-parser"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const areaListRoutes_1 = __importDefault(require("./routes/areaListRoutes"));
const roleRoutes_1 = __importDefault(require("./routes/roleRoutes"));
const applicationRoutes_1 = __importDefault(require("./routes/applicationRoutes"));
const areaRoutes_1 = __importDefault(require("./routes/areaRoutes"));
const businessUnitRoutes_1 = __importDefault(require("./routes/businessUnitRoutes"));
const teamRoutes_1 = __importDefault(require("./routes/teamRoutes"));
const dataAccessRoutes_1 = __importDefault(require("./routes/dataAccessRoutes"));
const loginReportRoutes_1 = __importDefault(require("./routes/loginReportRoutes"));
const settingRoutes_1 = __importDefault(require("./routes/settingRoutes"));
const config_1 = __importDefault(require("./config/config"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(body_parser_1.default.json());
app.use(passport_1.default.initialize());
// app.use(express.static("../client/build"));
const API_VERSION = 'v0';
app.use(`/api/${API_VERSION}`, authRoutes_1.default);
app.use(`/api/${API_VERSION}`, userRoutes_1.default);
app.use(`/api/${API_VERSION}`, areaListRoutes_1.default);
app.use(`/api/${API_VERSION}`, roleRoutes_1.default);
app.use(`/api/${API_VERSION}`, applicationRoutes_1.default);
app.use(`/api/${API_VERSION}`, areaRoutes_1.default);
app.use(`/api/${API_VERSION}`, businessUnitRoutes_1.default);
app.use(`/api/${API_VERSION}`, teamRoutes_1.default);
app.use(`/api/${API_VERSION}`, dataAccessRoutes_1.default);
app.use(`/api/${API_VERSION}`, loginReportRoutes_1.default);
app.use(`/api/${API_VERSION}`, settingRoutes_1.default);
// // Catch-all route to serve the client's index.html file
// app.get("*", (req: Request, res: Response) => {
// 	res.sendFile(path.resolve("../client/build/" + "index.html"));
// });
const PORT = config_1.default.port;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
//# sourceMappingURL=index.js.map