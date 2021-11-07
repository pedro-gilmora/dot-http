export interface Post {
    id?: number;
    title: string;
}

export interface User {
  id: number;
  userName: string;
}

export interface UserPost extends Post{
  user: User
}
