import HttpException from './HttpException';

class PostNotFoundException extends HttpException {
    constructor(email: string) {
        super(400, `User with email ${email} already exists`);
    }
}

export default PostNotFoundException