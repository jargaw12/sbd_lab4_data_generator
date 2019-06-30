export interface MovieDocument {
    title: string;
    runtime: number;
    country: string;
    releaseDate: number;
    reviews: Review[];
    cast: Cast[];
}

interface Review {
    rating: number;
    description: string;
}

interface Cast {
    fullName: string;
    roleName: string;
}
