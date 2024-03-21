/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        MYSQL_HOST: process.env.MYSQL_HOST,
        MYSQL_USERNAME: process.env.MYSQL_USERNAME,
        MYSQL_PWD: process.env.MYSQL_PWD,
        MYSQL_DATABASE: process.env.MYSQL_DATABASE,     
    }
};

export default nextConfig;
