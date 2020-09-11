import { UsernamePasswordInput } from "src/resolvers/user";

export const validateRegister = (options: UsernamePasswordInput) => {
  const { username, password, email } = options;

  if (username.length <= 2) {
    return [
      {
        field: "username",
        message: "Username must be greater than two characters",
      },
    ];
  }
  if (username.includes("@")) {
    return [
      {
        field: "username",
        message: "Username must not contain @",
      },
    ];
  }
  if (!email.includes("@")) {
    return [
      {
        field: "email",
        message: "Invalid email",
      },
    ];
  }
  if (password.length <= 2) {
    return [
      {
        field: "password",
        message: "Password must be greater than two characters",
      },
    ];
  }
  return null;
};
