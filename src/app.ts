import express from 'express';
import './config/env.config';
import { createDefultAdmin, logger } from './utils';
import { morganLogger } from './config';
import { connectMySql, deleteExpiredOtps, deleteExpiredTokens, synchronizeDB } from './database';
import { accessTokenAuth, ErrorHandler } from './middlewares';
import { authRouter, profileRouter, todoRouter, userRouter } from './routers';



const app = express();
const port = process.env.PORT || 3000;

/**
 * Initializing the express application, and listening at the given port
 */
const InitializeApp = async () => {
    try {

        // Connecting and Synchronizing with MySQL Database
        await connectMySql();
        await synchronizeDB();

        // creating default admin
        await createDefultAdmin();

        //using morgan logger on application
        app.use(morganLogger);

        // Using JSON body parsing middleware
        app.use(express.json());

        // Using routers
        app.use('/auth', authRouter);
        app.use('/me', accessTokenAuth, profileRouter);
        app.use('/user', accessTokenAuth, userRouter);
        app.use('/todo', accessTokenAuth, todoRouter);

        // Using custom error handlers on application
        app.use(ErrorHandler);

        // listening the application on port
        app.listen(port, () => {
            logger.info(`Server running successfully at http://localhost:${port}`);
        });

    } catch (error: any) {
        logger.error('Failed to initialize application:', error);
        process.exit(1);
    }
}

InitializeApp();




// Handle uncaught errors

process.on('unhandledRejection', (error) => {
    logger.error('Unhandled Rejection:', error);
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

// Run token cleanup every hour
setInterval(deleteExpiredTokens, 60 * 60 * 1000);
// Run otp cleanup every minute
setInterval(deleteExpiredOtps, 60 * 1000);
