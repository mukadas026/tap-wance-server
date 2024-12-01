import { Request, Response } from "express";

export const setCookie = (res: Response, name: string, payload: any) => {
    res.cookie(name, payload, {
        httpOnly: true
    })
}