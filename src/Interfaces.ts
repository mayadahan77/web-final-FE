export interface IPost {
  title: string;
  content: string;
  senderId: string;
}

export interface IUser {
  _id?: string;
  email: string;
  userName: string;
  password: string;
  fullName: string;
  refreshToken?: string[];
  imgUrl?: string;
}

export const INTINAL_DATA_USER: IUser = {
  _id: "",
  email: "",
  userName: "",
  password: "",
  fullName: "",
  refreshToken: [],
  imgUrl: "",
};

export const INTINAL_DATA_POST: IPost = {
  title: "",
  content: "",
  senderId: "",
};
