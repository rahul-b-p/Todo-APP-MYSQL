import { z } from "zod";
import { dueDateSchema, dueTimeSchema } from "./date.schema";
import { errorMessage } from "../constants";
import { pageLimitSchema, pageNoSchema } from "./page.schema";
import { TodoSortKeys } from "../enums";
import { CompletedStatus } from "../enums";
import { uuidRegex } from "../config";


const titleSchema = z.string({ message: errorMessage.TITLE_REQUIRED }).min(5, errorMessage.TITLE_MIN_LENGTH);
const descriptionSchema = z.string({ message: errorMessage.DESC_REQUIRED }).min(5, errorMessage.DESC_MIN_LENGTH).max(200, errorMessage.DESC_MAX_LENGTH);


export const createTodoSchema = z.object({
    title: titleSchema,
    description: descriptionSchema,
    dueDate: dueDateSchema,
    dueTime: dueTimeSchema
}).strict();


export const todoFilterSchema = z.object({
    pageNo: pageNoSchema,
    pageLimit: pageLimitSchema,
    status: z.nativeEnum(CompletedStatus, { message: errorMessage.INVALID_COMPLETE_STATUS }).optional(),
    title: z.string().optional(),
    userId: z.string().regex(uuidRegex, { message: errorMessage.INVALID_ID }).optional(),
    dueAt: dueDateSchema.optional(),
    sortKey: z.nativeEnum(TodoSortKeys, { message: errorMessage.INVALID_SORT_KEY }).optional()
}).strict();


export const updateTodoSchema = z
    .object({
        title: titleSchema.optional(),
        description: descriptionSchema.optional(),
        dueDate: dueDateSchema.optional(),
        dueTime: dueTimeSchema.optional(),
        completed: z.boolean().optional().refine(value => value !== null, {
            message: errorMessage.INVALID_COMPLETE_FIELD
        }),
    }).strict()
    .superRefine((data, ctx) => {
        if (data.completed == null && !data.description && !data.dueDate && !data.dueTime && !data.title) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: errorMessage.AT_LEAST_ONE_FIELD_REQUIRED_FOR_UPDATE,
            });
        }
    });
