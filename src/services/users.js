const prisma = require("../db");
const { HttpError } = require("../middleware/errorhandling");
const Profile = require("./profiles");
const bcrypt = require("bcrypt");

class User {
  static prisma = prisma;
  constructor(data) {
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
  }

  async createUserWithProfile(profileData) {
    try {
      const existingEmail = await User.prisma.user.findUnique({
        where: { userEmail: this.email },
      });

      if (existingEmail) {
        throw new HttpError("Email has already been used", 409);
      }

      const hashedPassword = await bcrypt.hash(this.password, 10);
      const result = await User.prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            userName: this.name,
            userEmail: this.email,
            userPassword: hashedPassword,
          },
        });
        const profile = new Profile(profileData);

        const newProfile = await profile.createProfile(newUser.userId, tx);
        return { newUser, newProfile };
      });

      return result;
    } catch (error) {
      throw new HttpError(
        "Failed to create user with profile : " + error.message,
        error.statusCode
      );
    }
  }

  static async getUserById(userId) {
    try {
      const user = await User.prisma.user.findUnique({
        where: {
          userId: parseInt(userId),
        },
        include: {
          profile: true,
          bankAccount: {
            include: {
              transactionSource: true,
              transactionDestination: true,
            },
          },
        },
      });

      if (!user || user.length === 0) {
        throw new HttpError("No user were found.", 404);
      }

      return user;
    } catch (error) {
      throw new HttpError(
        "Failed to get user : " + error.message,
        error.statusCode
      );
    }
  }

  static async getAllUsers() {
    try {
      const users = await User.prisma.user.findMany({
        include: {
          profile: true,
        },
      });

      if (!users || users.length === 0) {
        throw new HttpError("No users were found.", 404);
      }

      return users;
    } catch (error) {
      throw new HttpError(
        "Failed to get all users : " + error.message,
        error.statusCode
      );
    }
  }
}

module.exports = User;
