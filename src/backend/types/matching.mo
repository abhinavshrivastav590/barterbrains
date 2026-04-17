import CommonTypes "common";
import ProfileTypes "profile";

module {
  public type Match = {
    id : CommonTypes.MatchId;
    user1 : CommonTypes.UserId;
    user2 : CommonTypes.UserId;
    createdAt : CommonTypes.Timestamp;
  };

  public type MatchResult = {
    matchId : CommonTypes.MatchId;
    user : ProfileTypes.UserProfilePublic;
    theyOfferYouWant : [ProfileTypes.SkillEntry];
    youOfferTheyWant : [ProfileTypes.SkillEntry];
    createdAt : CommonTypes.Timestamp;
  };
};
