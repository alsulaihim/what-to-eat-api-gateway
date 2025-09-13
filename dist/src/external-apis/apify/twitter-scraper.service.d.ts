import { ApifyClientService } from './apify-client.service';
export interface TwitterScrapingInput {
    keywords: string[];
    location: string;
    max_tweets: number;
    include_retweets: boolean;
}
export interface Tweet {
    id: string;
    text: string;
    author: {
        username: string;
        displayName: string;
        verified: boolean;
        followersCount: number;
    };
    createdAt: string;
    retweetCount: number;
    likeCount: number;
    replyCount: number;
    url: string;
    hashtags: string[];
    mentions: string[];
    isRetweet: boolean;
    quotedTweet?: Tweet;
    foodMentions: number;
    locationRelevant: boolean;
    engagementRate: number;
}
export interface TwitterIntelligenceData {
    tweets_analyzed: number;
    trending_topics: string[];
    mention_sentiment: number;
    retweet_velocity: number;
    influence_metrics: {
        verified_mentions: number;
        follower_reach: number;
    };
    viral_content: {
        top_tweets: Array<{
            text: string;
            author: string;
            engagement: number;
            url: string;
        }>;
        trending_restaurants: string[];
        viral_dishes: string[];
    };
    conversation_insights: {
        discussion_topics: string[];
        sentiment_by_topic: {
            [topic: string]: number;
        };
        influencer_opinions: Array<{
            username: string;
            opinion: string;
            influence_score: number;
        }>;
    };
}
export declare class TwitterScraperService {
    private readonly apifyClient;
    private readonly logger;
    private readonly ACTOR_ID;
    constructor(apifyClient: ApifyClientService);
    scrapeTwitterFoodMentions(location: string, categories?: string[]): Promise<TwitterIntelligenceData>;
    private generateFoodKeywords;
    private analyzeTwitterData;
    private isFoodRelatedTopic;
    private analyzeSentiment;
    private calculateRetweetVelocity;
    private extractRestaurantMentions;
    private isRestaurantAccount;
    private extractRestaurantNames;
    private extractViralDishes;
    private extractDiscussionTopics;
    private calculateTopicSentiment;
    private extractInfluencerOpinions;
    private getFallbackData;
}
