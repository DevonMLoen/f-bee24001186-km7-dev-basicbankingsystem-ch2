const prisma = require("../db");

class Profile {
  static prisma = prisma;
  constructor(data) {
    this.type = data.type;
    this.number = data.number;
    this.address = data.address;
  }

  async createProfile(userId, tx) {
    try {
      const newProfile = await tx.profile.create({
        data: {
          userId: userId,
          profileType: this.type,
          profileNumber: this.number,
          address: this.address,
        },
      });
      return newProfile;
    } catch (error) {
      throw new Error('Failed to create profile : ' + error.message);
    }
  }

  async getProfile(profileId) {
    try {
      const profile = await Profile.prisma.profile.findUnique({
        where: {
          profileId: profileId,
        },
      });
      return profile;
    } catch (error) {
      throw new Error('Failed to get profile : ' + error.message);
    }
  }
}

module.exports = Profile;
