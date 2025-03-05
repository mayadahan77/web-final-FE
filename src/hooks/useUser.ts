import { useEffect, useState } from "react";
import userService, { CanceledError } from "../services/user-service";
import { IUser } from "../Interfaces";

const useUser = (data: FormData) => {
  const [user, setUser] = useState<IUser>();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    console.log("Effect");
    setIsLoading(true);
    const { request, abort } = userService.login(data);
    request
      .then((res) => {
        setUser(res.data);
        setIsLoading(false);
      })
      .catch((error) => {
        if (!(error instanceof CanceledError)) {
          setError(error.message);
          setIsLoading(false);
        }
      });
    return abort;
  }, []);
  return { user, setUser, error, setError, isLoading, setIsLoading };
};

export default useUser;
