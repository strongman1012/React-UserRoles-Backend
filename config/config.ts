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
    port: number;
}

const config: Config = {
    db: {
        server: 'accesscontroltestserver.database.windows.net',
        user: 'user',
        password: 's5-G"5yb6d3]SUC>79>o',
        database: 'accessControlServer'
    },
    jwtSecret: "jwt_secret",
    azure: {
        clientId: 'fd6feea0-518e-40f4-b69c-13d7788c4085',
        tenantId: 'c20a081b-c063-4eec-a696-ab10d1e15e70',
        audience: 'fd6feea0-518e-40f4-b69c-13d7788c4085'
    },
    port: 5000
};

export default config;
