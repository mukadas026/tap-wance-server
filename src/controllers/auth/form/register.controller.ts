import { randomUUID } from "crypto";
import { Request, Response } from "express";
import { addUser } from "../../../models/user.model";

export const registerController = async (
  req: Request<any, any, { email: string; name: string; password: string }>,
  res: Response
) => {
  console.log("req body", req.body);
  const { email, name, password } = req.body;

  if (!email || !name || !password) {
    return res.status(400).json({ message: "Please fill all the fields" });
  }

  const _id = randomUUID();

  const user = await addUser({
    _id,
    email,
    name,
    password,
    registeredWith: "form",
    picture: "",
  });

  res.status(200).json({ user });
};
