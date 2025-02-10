import morgan from "morgan";
import { winstonLogger } from "./winston.config";


// configuring morgan logger with winston logger

const stream = { write: (message: any) => winstonLogger.info(message.trim()) }
export const morganLogger = morgan("dev", { stream });