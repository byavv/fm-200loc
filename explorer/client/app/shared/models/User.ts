export class User {
    accessToken?: any;
    username?: string;
    
    constructor(data?: User) {
        Object.assign(this, data);
    }
    isAuthenticated() {
        return !!this.accessToken;
    }
} 
