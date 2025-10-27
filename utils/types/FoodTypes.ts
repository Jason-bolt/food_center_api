export interface FoodType {
    id: string;
    name: string;
    country: string;
    region: string;
    culturalStory: string;
    description: string;
    imageUrl: string;
    ingredients: string[];
    createdAt: NativeDate;
    updatedAt: NativeDate;
}