import Map "mo:core/Map";
import List "mo:core/List";
import MatchLib "../lib/matching";
import MatchTypes "../types/matching";
import ProfileTypes "../types/profile";
import CommonTypes "../types/common";

mixin (
  profiles : Map.Map<CommonTypes.UserId, ProfileTypes.UserProfile>,
  matches : List.List<MatchTypes.Match>,
) {
  var nextMatchId : Nat = 1;

  public shared ({ caller }) func refreshMatches() : async [MatchTypes.MatchResult] {
    let (results, newNextId) = MatchLib.findMatches(profiles, matches, caller, nextMatchId);
    nextMatchId := newNextId;
    results;
  };

  public query ({ caller }) func getMatches() : async [MatchTypes.MatchResult] {
    MatchLib.getMatches(profiles, matches, caller);
  };
};
