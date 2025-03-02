import { IUser } from "../Interfaces";
import api, { CanceledError } from "./api-client";

export { CanceledError };

const login = (data: FormData) => {
  const abortController = new AbortController();
  const request = api.get<IUser>("/auth/login", { ...data, signal: abortController.signal });
  return { request, abort: () => abortController.abort() };
};

export default { login };
