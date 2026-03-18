import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import {
    getVariablesByTestCase,
    getVariablesByContext,
    getOperatorsForDataType,
} from "../services/variable.service";
import { sendSuccess, sendError } from "../utils/response";

export const getVariables = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const { testCaseId } = req.params;
        const kind = req.query.kind as string | undefined;
        const context = req.query.context as string | undefined;

        if (context) {
            const variables = await getVariablesByContext(testCaseId, context);
            const filtered = kind
                ? variables.filter((v) => v.kind === kind)
                : variables;
            sendSuccess(res, { variables: filtered }, "Variables fetched");
            return;
        }

        const result = await getVariablesByTestCase(testCaseId);

        if (kind === "input") {
            sendSuccess(res, { variables: result.input }, "Input variables fetched");
            return;
        }
        if (kind === "output") {
            sendSuccess(res, { variables: result.output }, "Output variables fetched");
            return;
        }

        sendSuccess(res, {
            variables: result.all,
            grouped: { input: result.input, output: result.output },
        }, "Variables fetched");
    } catch (err) {
        next(err);
    }
};

export const getOperators = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const { dataType } = req.params;
        const operators = getOperatorsForDataType(dataType);
        sendSuccess(res, { dataType, operators }, "Operators fetched");
    } catch (err) {
        next(err);
    }
};