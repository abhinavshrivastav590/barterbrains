import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import MatchTypes "../types/matching";
import ProfileTypes "../types/profile";
import CommonTypes "../types/common";
import ProfileLib "profile";

module {
  /// Bidirectional match: caller wants skill X AND other offers X, AND other wants skill Y AND caller offers Y.
  public func findMatches(
    profiles : Map.Map<CommonTypes.UserId, ProfileTypes.UserProfile>,
    matches : List.List<MatchTypes.Match>,
    caller : CommonTypes.UserId,
    nextMatchId : Nat,
  ) : ([MatchTypes.MatchResult], Nat) {
    let callerProfile = switch (profiles.get(caller)) {
      case (?p) p;
      case null return ([], nextMatchId);
    };

    var results : [MatchTypes.MatchResult] = [];
    var idCounter = nextMatchId;

    for ((uid, other) in profiles.entries()) {
      if (not Principal.equal(uid, caller)) {
        // Skills caller wants that other offers
        var theyOfferYouWant : [ProfileTypes.SkillEntry] = [];
        for (want in callerProfile.skillsWanted.values()) {
          for (offer in other.skillsOffered.values()) {
            if (Nat.equal(want.skillId, offer.skillId)) {
              theyOfferYouWant := theyOfferYouWant.concat([offer]);
            };
          };
        };

        // Skills other wants that caller offers
        var youOfferTheyWant : [ProfileTypes.SkillEntry] = [];
        for (want in other.skillsWanted.values()) {
          for (offer in callerProfile.skillsOffered.values()) {
            if (Nat.equal(want.skillId, offer.skillId)) {
              youOfferTheyWant := youOfferTheyWant.concat([offer]);
            };
          };
        };

        // Only a match if BOTH sides have overlapping skills
        if (theyOfferYouWant.size() > 0 and youOfferTheyWant.size() > 0) {
          // Check if match already exists
          let existing = matches.find(func(m : MatchTypes.Match) : Bool {
            (Principal.equal(m.user1, caller) and Principal.equal(m.user2, uid)) or
            (Principal.equal(m.user1, uid) and Principal.equal(m.user2, caller))
          });

          let matchId = switch (existing) {
            case (?m) m.id;
            case null {
              let newMatch : MatchTypes.Match = {
                id = idCounter;
                user1 = caller;
                user2 = uid;
                createdAt = Time.now();
              };
              matches.add(newMatch);
              let mid = idCounter;
              idCounter += 1;
              mid;
            };
          };

          let result : MatchTypes.MatchResult = {
            matchId = matchId;
            user = other.toPublic();
            theyOfferYouWant = theyOfferYouWant;
            youOfferTheyWant = youOfferTheyWant;
            createdAt = Time.now();
          };
          results := results.concat([result]);
        };
      };
    };

    (results, idCounter);
  };

  public func getMatches(
    profiles : Map.Map<CommonTypes.UserId, ProfileTypes.UserProfile>,
    matches : List.List<MatchTypes.Match>,
    caller : CommonTypes.UserId,
  ) : [MatchTypes.MatchResult] {
    var results : [MatchTypes.MatchResult] = [];

    for (m in matches.values()) {
      let isParticipant = Principal.equal(m.user1, caller) or Principal.equal(m.user2, caller);
      if (isParticipant) {
        let otherId = if (Principal.equal(m.user1, caller)) m.user2 else m.user1;
        switch (profiles.get(otherId), profiles.get(caller)) {
          case (?other, ?callerProfile) {
            var theyOfferYouWant : [ProfileTypes.SkillEntry] = [];
            for (want in callerProfile.skillsWanted.values()) {
              for (offer in other.skillsOffered.values()) {
                if (Nat.equal(want.skillId, offer.skillId)) {
                  theyOfferYouWant := theyOfferYouWant.concat([offer]);
                };
              };
            };

            var youOfferTheyWant : [ProfileTypes.SkillEntry] = [];
            for (want in other.skillsWanted.values()) {
              for (offer in callerProfile.skillsOffered.values()) {
                if (Nat.equal(want.skillId, offer.skillId)) {
                  youOfferTheyWant := youOfferTheyWant.concat([offer]);
                };
              };
            };

            let result : MatchTypes.MatchResult = {
              matchId = m.id;
              user = other.toPublic();
              theyOfferYouWant = theyOfferYouWant;
              youOfferTheyWant = youOfferTheyWant;
              createdAt = m.createdAt;
            };
            results := results.concat([result]);
          };
          case _ {};
        };
      };
    };

    results;
  };
};
