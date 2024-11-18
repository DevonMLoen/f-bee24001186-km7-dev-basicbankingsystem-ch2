const prisma = require("../db");
const { HttpError } = require("../middleware/errorhandling");

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
      throw new HttpError('Failed to create profile : ' + error.message,error.statusCode);
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
      throw new HttpError('Failed to get profile : ' + error.message,error.statusCode);
    }
  }
}

module.exports = Profile;
