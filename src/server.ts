import app from "./app.js";
import { env } from "./config/env.js";
import prisma from "./config/database";

const startServer = async () => {
    try {
        await prisma.$connect();
        console.log("Database connected successfully");

        app.listen(env.PORT, () => {
            console.log(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        await prisma.$disconnect();
        process.exit(1);
    }
};

process.on("SIGTERM", async () => {
    console.log("SIGTERM received, shutting down gracefully");
    await prisma.$disconnect();
    process.exit(0);
});

startServer();