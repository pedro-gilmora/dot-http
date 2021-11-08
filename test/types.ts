export interface Post {
    id?: number;
    title: string;
}

export interface User {
  id: number;
  name: string;
}

export interface UserPost extends Post{
  user: User
}
