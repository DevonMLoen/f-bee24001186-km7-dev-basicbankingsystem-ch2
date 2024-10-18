const prisma = require("../db");
const Profile = require("./profiles")

class User {
  static prisma = prisma;
  constructor(data) {
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;

  }

  async createUser() {
    try {
      const newUser = await this.prisma.user.create({
        data: {
          userName: this.name,
          userEmail: this.email,
          userPassword: this.password,
        },
      });
      return newUser;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to create user');
    }
  }

  async createUserWithProfile(profileData) {
    try {
      const result = await User.prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            userName: this.name,
            userEmail: this.email,
            userPassword: this.password,
          },
        });
        const profile = new Profile(profileData);

        const newProfile = await profile.createProfile(newUser.userId, tx);

        return { newUser, newProfile };
      });

      return result;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to create user with profile');
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
      console.error(error);
      throw new Error('Failed to get user');
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
      console.error(error);
      throw new Error('Failed to get all users');
    }
  }

}

module.exports = User;
