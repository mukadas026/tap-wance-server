import { hash } from "bcrypt";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema<IUser>({
  _id: String,
  // username: String,
  email: {
    type: String,
  },
  name: String,
  picture: String,
  registeredWith: String,

  password: {
    type: String,
    default: "",
  },
});

userSchema.pre("save", async function (next) {
  if (this.registeredWith === "form") {
    const password = this.password;
    const hashedPassword = await hash(password, 10);

    this.password = hashedPassword;

    next();
  }
});

const userModel = mongoose.model("user", userSchema);

export const addUser = async (user: IUser) => {
  const u = await userModel.create(user);
  return u;
};

export const findUser = async (email: string) => {
  const u = await userModel.findOne({ email }).exec();
  return u;
};
