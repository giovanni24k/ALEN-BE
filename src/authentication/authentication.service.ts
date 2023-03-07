import bcrypt from "bcrypt";
import { Response } from "express";
import jwt from "jsonwebtoken";
import QRCode from "qrcode";
import * as speakeasy from "speakeasy";

import UserWithThatEmailAlreadyExistsException from "../exceptions/UserWithThatEmailAlreadyExistsException";
import DataStoredInToken from "../interfaces/dataStoredInToken";
import TokenData from "../interfaces/tokenData.interface";
import CreateUserDto from "../user/user.dto";
import User from "../user/user.interface";
import userModel from "../user/user.model";

class AuthenticationService {
    public user = userModel;

    public async register(userData: CreateUserDto) {
        const userAlreadyExists = await this.user.findOne({ email: userData.email })
        if (userAlreadyExists) {
            throw new UserWithThatEmailAlreadyExistsException(userData.email);
        };

        const hashedPassword = await bcrypt.hash(userData.password, 10);

        const user = await this.user.create({ ...userData, password: hashedPassword });
        // user.password = undefined

        const tokenData = this.createToken(user);
        const cookie = this.createCookie(tokenData);

        return { cookie, user }
    };

    public createToken(user: User, isSecondFactorAuthenticated = false): TokenData {
        const expiresIn = 60 * 60; //an hour
        const secret = process.env.JWT_SECRET as string;
        const dataStoredInToken: DataStoredInToken = { isSecondFactorAuthenticated, _id: user._id };

        return { expiresIn, token: jwt.sign(dataStoredInToken, secret, { expiresIn }) };
    };

    public createCookie(tokenData: TokenData) {
        return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn}`;
    };

    public async getTwoFactorAuthenticationCode() {
        console.log('process.env.TWO_FACTOR_AUTHENTICATION_APP_NAME,', process.env.TWO_FACTOR_AUTHENTICATION_APP_NAME);

        const secretCode = await speakeasy.generateSecret({ name: process.env.TWO_FACTOR_AUTHENTICATION_APP_NAME });
        return { otpauthURL: secretCode.otpauth_url, base32: secretCode.base32 };
    };

    public verifyTwoFactorAuthenticationCode(twoFactorAuthenticationCode: string, user: User) {
        return speakeasy.totp.verify({ secret: user.twoFactorAuthenticationCode, encoding: "base32", token: twoFactorAuthenticationCode });
    };

    public respondWithQRCode(data: string, response: Response) {
        QRCode.toFileStream(response, data);
    }
};

export default AuthenticationService;

