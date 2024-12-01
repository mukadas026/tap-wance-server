import { randomUUID } from "crypto";
import { Request, Response } from "express";
import { addUser, findUser } from "../../../models/user.model";
import { compare } from "bcrypt";

export const loginController = async (req: Request<any, any, { email: string; password: string }>, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Please fill all the fields" });
  }

  const user = await findUser(email);

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const passwordMatch = compare(password, user.password);

  if (!passwordMatch) {
    return res.status(400).json({ message: "Wrong password" });
  }

  req.session.user = {
    _id: user._id,
    email: user.email,
    name: user.name,
    registeredWith: user.registeredWith,
    picture: user.picture,

    password: user.password,
  };
  if (!req.session.connectedAccounts) {
    // @ts-ignore
    req.session.connectedAccounts = {};
  }
  console.log("req session", req.session);
  // console.log(req.cookies);
  res.status(200).json({ user, sessionID: req.session.id });
};
