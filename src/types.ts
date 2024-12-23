export type User = {
    id: number;
    username: string;
    email: string;
    avatarUrl?: string;
    role: string;
}


export type Product = {
    id: number;
    name: string;
    description: string;
    price: number;
    quantityAvailable: number;
    image: string;
}