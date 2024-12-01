import { Request, Response } from "express";

export const accountsController = async (req: Request, res: Response) => {
  const accounts = req.session.connectedAccounts;

  console.log("accounts", accounts);
  // make into an array
  const accountArray: any[] = [];
  Object.entries(accounts || {}).forEach(([key, value]) => {
    const { tokens, ...safeValues } = value;
    accountArray.push({
      account: key,
      details: safeValues,
    });
  });

  res.status(200).json({ accounts: accountArray || [] });
};
