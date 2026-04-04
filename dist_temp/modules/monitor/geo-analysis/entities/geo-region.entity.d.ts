export declare enum RegionLevel {
    COUNTRY = "country",
    PROVINCE = "province",
    CITY = "city",
    DISTRICT = "district"
}
export declare enum RegionType {
    URBAN = "urban",
    RURAL = "rural",
    SUBURBAN = "suburban",
    INDUSTRIAL = "industrial",
    COMMERCIAL = "commercial",
    RESIDENTIAL = "residential"
}
export declare class GeoRegion {
    id: string;
    tenantId: string;
    regionCode: string;
    name: string;
    englishName: string;
    regionLevel: RegionLevel;
    regionType: RegionType;
    parentId: string;
    parentName: string;
    latitude: number;
    longitude: number;
    boundingBox: {
        north: number;
        south: number;
        east: number;
        west: number;
    };
    population: number;
    area: number;
    gdp: number;
    gdpPerCapita: number;
    economicIndicators: {
        primaryIndustry: number;
        secondaryIndustry: number;
        tertiaryIndustry: number;
        growthRate: number;
        inflationRate: number;
        unemploymentRate: number;
    };
    demographicData: {
        ageDistribution: Record<string, number>;
        genderRatio: number;
        educationLevel: Record<string, number>;
        householdIncome: Record<string, number>;
        urbanizationRate: number;
    };
    culturalData: {
        dominantLanguage: string;
        dialects: string[];
        religions: string[];
        festivals: string[];
        customs: string[];
        taboos: string[];
    };
    consumerBehavior: {
        averageSpending: number;
        onlineShoppingRate: number;
        mobilePaymentRate: number;
        favoriteCategories: string[];
        peakShoppingHours: string[];
        preferredChannels: string[];
    };
    digitalInfrastructure: {
        internetPenetration: number;
        smartphonePenetration: number;
        socialMediaUsage: Record<string, number>;
        ecommercePlatforms: string[];
        popularApps: string[];
    };
    competitors: {
        companyName: string;
        industry: string;
        marketShare: number;
        strengths: string[];
        weaknesses: string[];
        keyProducts: string[];
    }[];
    opportunities: {
        category: string;
        description: string;
        potentialValue: number;
        implementationDifficulty: 'low' | 'medium' | 'high';
        timeframe: string;
    }[];
    competitionIntensity: number;
    entryBarriers: string[];
    marketConcentration: number;
    isActive: boolean;
    dataUpdatedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
}
