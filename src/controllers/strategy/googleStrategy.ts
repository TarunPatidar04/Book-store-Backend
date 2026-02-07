import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import dotenv from "dotenv";
import { Request } from "express";
import UserModel, { IUser } from "../../models/User.model";
dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "",
      passReqToCallback: true,
    },
    async (
      req: Request,
      accessToken,
      refreshToken,
      profile,
      done: (error: any, user?: IUser | false) => void,
    ) => {
      try {
        const { emails, displayName, photos } = profile;
        let user = await UserModel.findOne({ email: emails?.[0]?.value });
        if (user) {
          if (!user.profilePicture && photos?.[0]?.value) {
            user.profilePicture = photos?.[0]?.value;
            await user.save();
          }
          return done(null, user);
        }
        user = await UserModel.create({
          googleId: profile.id,
          email: emails?.[0]?.value,
          name: displayName,
          profilePicture: photos?.[0]?.value,
          isVerified: emails?.[0]?.verified,
          agreeTerms: true,
        });
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    },
  ),
);

export default passport;
