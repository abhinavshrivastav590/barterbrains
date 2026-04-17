import Map "mo:core/Map";
import ProfileLib "../lib/profile";
import ProfileTypes "../types/profile";
import CommonTypes "../types/common";

mixin (
  profiles : Map.Map<CommonTypes.UserId, ProfileTypes.UserProfile>,
) {
  public query ({ caller }) func getCallerUserProfile() : async ?ProfileTypes.UserProfilePublic {
    ProfileLib.getProfile(profiles, caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(input : ProfileTypes.SaveProfileInput) : async () {
    ignore ProfileLib.saveProfile(profiles, caller, input);
  };

  public query ({ caller = _ }) func getUserProfile(userId : CommonTypes.UserId) : async ?ProfileTypes.UserProfilePublic {
    ProfileLib.getProfile(profiles, userId);
  };
};
