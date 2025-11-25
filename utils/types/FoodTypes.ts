export interface FoodType {
    id: string;
    name: string;
    countries: string[];
    region: string;
    culturalStory: string;
    description: string;
    imageUrl: string;
    ingredients: string[];
    createdAt: NativeDate;
    updatedAt: NativeDate;
}