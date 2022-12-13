
export const EnvConfiguration = () => ({

    db_host: process.env.DB_HOST,
    db_name: process.env.DB_NAME,
    db_username: process.env.DB_USERNAME,
    db_pass: process.env.DB_PASS,
    db_port: process.env.DB_PORT,
    app_port: process.env.APP_PORT,
    host_api: process.env.HOST_API
    
});