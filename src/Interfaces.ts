export interface IPost {
  _id?: string;
  title: string;
  content: string;
  senderId: string;
  imgUrl?: string;
  senderName?: string;
  senderProfile?: string;
  commentsCount?: number;
}

export interface IComments {
  _id: string;
  postId: string;
  content: string;
  senderId: string;
  imgUrl: string;
  usersIdLikes?: string[];
  senderName?: string;
  senderProfile?: string;
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

export const INTINAL_DATA_COMMENT: IComments = {
  _id: "",
  postId: "",
  content: "",
  senderId: "",
  imgUrl: "",
};
