const { Strategy, ExtractJwt } = require('passport-jwt');
const passport = require('passport');

const GitHubStrategy = require('passport-github2');

const prisma = require("../lib/prisma");

const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies.authToken) {
    token = req.cookies.authToken;
    token = token.replace('Bearer ', '');
  }

  return token;
};

const options = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: process.env.SECRET,
};

passport.use(
  new Strategy(options, async (payload, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: payload.id,
        },
      });

      if (user) return done(null, user);
      else return done(null, false);
    } catch (err) {
      return done(err, null);
    }
  })
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK,
    },
    async function (accessToken, refreshToken, profile, done) {
      const select = {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        bio: true,
        github_id: true,
        profileImageUrl: true,
        followers: {
          select: {
            followerId: true,
          },
        },
        following: {
          select: {
            followingId: true,
          },
        },
      };

      const existingUser = await prisma.user.findFirst({
        where: {
          github_id: profile.id,
        },
        select,
      });

      if (existingUser) return done(null, existingUser);
      try {
        let username = profile.username;

        if (await prisma.user.findUnique({ where: { username } })) {
          let index = 0;
          do {
            index++;
          } while (
            await prisma.user.findUnique({
              where: { username: `${username}${index}` },
            })
          );

          username = `${username}${index}`;
        }

        const user = await prisma.user.create({
          data: {
            username,
            firstName: profile.displayName || profile.username,
            github_id: profile.id,
            profileImageUrl: profile.photos?.[0]?.value,
          },
          select,
        });

        done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

module.exports = { passport };
