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
        server: 'sql5071.site4now.net',
        user: 'DB_9D05E9_doublehelixinc_admin',
        password: '49douBle09',
        database: 'DB_9D05E9_doublehelixinc'
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
