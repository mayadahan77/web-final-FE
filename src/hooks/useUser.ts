import { useState, useEffect } from "react";
import { IUser } from "../Interfaces";
import { useUser as useUserContext } from "../context/UserContext";
import { userService } from "../api";
import axios, { AxiosError } from "axios";

export interface UserContextType {
  user: IUser | null;
  setUser: React.Dispatch<React.SetStateAction<IUser | null>>;
}

const useUser = (data?: IUser) => {
  const { user, setUser } = useUserContext();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, [setUser]);

  useEffect(() => {
    if (data?._id) {
      setIsLoading(true);
      const request = userService.getUser(data._id);
      const abort = () => {};
      request
        .then((res) => {
          setUser(res.data);
          setIsLoading(false);
        })
        .catch((error) => {
          if (!axios.isCancel(error)) {
            if (axios.isAxiosError(error)) {
              if (error instanceof Error) {
                setError(error.message);
              } else {
                setError(String(error));
              }
            } else {
              setError(String(error));
            }
            setIsLoading(false);
          }
        });
      return abort;
    }
  }, [data?._id]);

  const updateUser = async (userData: IUser) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await userService.updateUser(userData);
      setUser(response.data);
      localStorage.setItem("user", JSON.stringify(response.data));
      setIsLoading(false);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.data.codeName == "DuplicateKey") {
          setError("User Name already in use");
        } else {
          setError(error.message);
        }
      } else {
        setError(String(error));
      }
      setIsLoading(false);
      return null;
    }
  };

  return { user, setUser, error, setError, isLoading, setIsLoading, updateUser };
};

export default useUser;
