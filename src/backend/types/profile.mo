import CommonTypes "common";

module {
  public type Proficiency = { #beginner; #intermediate; #expert };

  public type SkillEntry = {
    skillId : CommonTypes.SkillId;
    name : Text;
    proficiency : Proficiency;
  };

  public type UserProfile = {
    id : CommonTypes.UserId;
    var name : Text;
    var bio : Text;
    var avatar : ?Text;
    var skillsOffered : [SkillEntry];
    var skillsWanted : [SkillEntry];
    var trustScore : Float;
    var completedSessions : Nat;
    createdAt : CommonTypes.Timestamp;
  };

  // Shared (API boundary) version — no var fields, no mutable types
  public type UserProfilePublic = {
    id : CommonTypes.UserId;
    name : Text;
    bio : Text;
    avatar : ?Text;
    skillsOffered : [SkillEntry];
    skillsWanted : [SkillEntry];
    trustScore : Float;
    completedSessions : Nat;
    createdAt : CommonTypes.Timestamp;
  };

  public type SaveProfileInput = {
    name : Text;
    bio : Text;
    avatar : ?Text;
    skillsOffered : [SkillEntry];
    skillsWanted : [SkillEntry];
  };
};
