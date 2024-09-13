interface Config {
    db: {
        server: string;
        user: string;
        password: string;
        database: string;
    };
    jwtSecret: string;
    azure: {
        clientId: string;
        tenantId: string;
        audience: string;
    };
    port: string | number;
}

const config: Config = {
    db: {
        server: process.env.DB_SERVER ?? '',
        user: process.env.DB_USER ?? '',
        password: process.env.DB_PASSWORD ?? '',
        database: process.env.DB_DATABASE ?? ''
    },
    jwtSecret: process.env.JWT_SECRET ?? '',
    azure: {
        clientId: process.env.AZURE_CLIENT_ID ?? '',
        tenantId: process.env.AZURE_TENANT_ID ?? '',
        audience: process.env.AZURE_AUDIENCE ?? ''
    },
    port: process.env.PORT ?? 5000
};


export default config;
