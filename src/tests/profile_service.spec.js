const ProfileService = require("../services/profiles");
require("../utils/create-app");
jest.mock("../db", () => ({
  profile: {
    findUnique: jest.fn(),
  },
}));
describe("profileService", () => {
  const mockPrisma = require("../db");
  const mockProfile = {
    address: "123 Main St, Anytown, USA",
    profileId: 2,
    profileNumber: "1234567890",
    profileType: "individual",
    userId: 1,
  };
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createProfile", () => {
    it("should successfully create new profile", async () => {
      const userId = 1;
      const profileData = {
        address: "123 Main St, Anytown, USA",
        profileNumber: "1234567890",
        profileType: "individual",
      };
      const mockTransaction = {
        profile: {
          create: jest.fn(),
        },
      };
      mockTransaction.profile.create.mockResolvedValue(mockProfile);
      const profile = new ProfileService(profileData);
      const profileSpy = jest.spyOn(mockTransaction.profile, "create");
      const result = await profile.createProfile(userId, mockTransaction);

      expect(result).toStrictEqual(mockProfile);
      expect(mockTransaction.profile.create).toHaveBeenCalledWith({
        data: { userId: userId, ...profileData },
      });
      expect(profileSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("getProfile", () => {
    it("should return a profile", async () => {
      mockPrisma.profile.findUnique.mockResolvedValue(mockProfile);
      const profileData = {
        address: "123 Main St, Anytown, USA",
        profileNumber: "1234567890",
        profileType: "individual",
      };
      const profile = new ProfileService(profileData);
      const result = await profile.getProfile(1);

      expect(result).toStrictEqual(mockProfile);
    });
  });
});
