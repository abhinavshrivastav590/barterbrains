import Map "mo:core/Map";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import ProfileTypes "../types/profile";
import CommonTypes "../types/common";

module {
  public func toPublic(self : ProfileTypes.UserProfile) : ProfileTypes.UserProfilePublic {
    {
      id = self.id;
      name = self.name;
      bio = self.bio;
      avatar = self.avatar;
      skillsOffered = self.skillsOffered;
      skillsWanted = self.skillsWanted;
      trustScore = self.trustScore;
      completedSessions = self.completedSessions;
      createdAt = self.createdAt;
    };
  };

  public func getProfile(
    profiles : Map.Map<CommonTypes.UserId, ProfileTypes.UserProfile>,
    userId : CommonTypes.UserId,
  ) : ?ProfileTypes.UserProfilePublic {
    switch (profiles.get(userId)) {
      case (?p) ?toPublic(p);
      case null null;
    };
  };

  public func saveProfile(
    profiles : Map.Map<CommonTypes.UserId, ProfileTypes.UserProfile>,
    caller : CommonTypes.UserId,
    input : ProfileTypes.SaveProfileInput,
  ) : ProfileTypes.UserProfilePublic {
    switch (profiles.get(caller)) {
      case (?existing) {
        existing.name := input.name;
        existing.bio := input.bio;
        existing.avatar := input.avatar;
        existing.skillsOffered := input.skillsOffered;
        existing.skillsWanted := input.skillsWanted;
        toPublic(existing);
      };
      case null {
        let newProfile : ProfileTypes.UserProfile = {
          id = caller;
          var name = input.name;
          var bio = input.bio;
          var avatar = input.avatar;
          var skillsOffered = input.skillsOffered;
          var skillsWanted = input.skillsWanted;
          var trustScore = 0.0;
          var completedSessions = 0;
          createdAt = Time.now();
        };
        profiles.add(caller, newProfile);
        toPublic(newProfile);
      };
    };
  };

  // Recalculate trust score given a new rating being added.
  // Uses running weighted average: (currentScore * completed + newRating) / (completed + 1)
  public func updateTrustScore(
    profiles : Map.Map<CommonTypes.UserId, ProfileTypes.UserProfile>,
    userId : CommonTypes.UserId,
    newRating : Nat,
  ) {
    switch (profiles.get(userId)) {
      case (?p) {
        let completed = p.completedSessions;
        let completedF : Float = completed.toFloat();
        let ratingF : Float = newRating.toFloat();
        let newScore = (p.trustScore * completedF + ratingF) / (completedF + 1.0);
        p.trustScore := newScore;
        p.completedSessions := completed + 1;
      };
      case null {};
    };
  };
};
