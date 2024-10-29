const prisma = require("../db");
const Profile = require("./profiles");
const bcrypt = require('bcrypt');

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
      throw new Error('Email has already been used');
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
      throw new Error('Failed to create user with profile : ' + error.message);
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

      return user;
    } catch (error) {
      throw new Error('Failed to get user : ' + error.message);
    }
  }

  static async getAllUsers() {
    try {
      const users = await User.prisma.user.findMany({
        include: {
          profile: true,
        },
      });

      return users;
    } catch (error) {
      throw new Error('Failed to get all users : ' + error.message);
    }
  }

}

module.exports = User;
