declare const _default: () => {
    port: number;
    nodeEnv: string;
    database: {
        url: string | undefined;
    };
    redis: {
        host: string;
        port: number;
        password: string | undefined;
    };
    jwt: {
        secret: string;
        refreshSecret: string;
        expiresIn: string;
        refreshExpiresIn: string;
    };
    cors: {
        origin: string;
        credentials: boolean;
    };
    swagger: {
        enabled: true;
        path: string;
    };
    throttle: {
        ttl: number;
        limit: number;
    };
};
export default _default;
