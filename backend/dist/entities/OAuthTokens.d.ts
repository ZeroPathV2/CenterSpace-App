import { User } from "./User";
import { OAuthProvider } from "./OAuthProvider";
export declare class OAuthToken {
    id: number;
    accessToken: string;
    refreshToken?: string;
    provider: OAuthProvider;
    user: User;
}
//# sourceMappingURL=OAuthTokens.d.ts.map