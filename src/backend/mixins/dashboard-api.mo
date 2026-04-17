import List "mo:core/List";
import Principal "mo:core/Principal";
import ReviewLib "../lib/reviews";
import SessionTypes "../types/sessions";
import ReviewTypes "../types/reviews";
import CommonTypes "../types/common";

mixin (
  sessions : List.List<SessionTypes.Session>,
  reviews : List.List<ReviewTypes.Review>,
) {
  public query ({ caller }) func getDashboardStats() : async {
    activeSessionsCount : Nat;
    completedSessionsCount : Nat;
    averageTrustScore : Float;
  } {
    var activeCount : Nat = 0;
    var completedCount : Nat = 0;

    for (s in sessions.values()) {
      let isParticipant = Principal.equal(s.requesterId, caller) or Principal.equal(s.receiverId, caller);
      if (isParticipant) {
        switch (s.status) {
          case (#pending) { activeCount += 1 };
          case (#confirmed) { activeCount += 1 };
          case (#completed) { completedCount += 1 };
          case (#rejected) {};
        };
      };
    };

    let avgScore = ReviewLib.computeTrustScore(reviews, caller);

    {
      activeSessionsCount = activeCount;
      completedSessionsCount = completedCount;
      averageTrustScore = avgScore;
    };
  };
};
