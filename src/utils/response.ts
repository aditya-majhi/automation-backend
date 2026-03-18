import { Response } from "express";

function replacer(_key: string, value: any): any {
    if (typeof value === "bigint") {
        return Number(value);
    }
    return value;
}

export const sendSuccess = (
    res: any,
    data: any,
    message = "Success",
    statusCode = 200,
) => {
    const body = JSON.parse(JSON.stringify({ success: true, message, data }, replacer));
    return res.status(statusCode).json(body);
};

export const sendError = (
    res: any,
    message = "Error",
    statusCode = 500,
    errors?: any,
) => {
    return res.status(statusCode).json({
        success: false,
        message,
        ...(errors && { errors }),
    });
};