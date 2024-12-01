import { Request, Response } from "express";

export const authController = async (req: Request, res: Response) => {
  const session = req.session;
  // @ts-ignore
  if (!session.user) {
    res.status(400).json({ message: "Please sign in" });
  } else {
    res.status(200).json({ user: session.user });
  }
};
