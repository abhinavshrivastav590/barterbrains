import List "mo:core/List";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import ReviewTypes "../types/reviews";
import SessionTypes "../types/sessions";
import CommonTypes "../types/common";

module {
  public func submitReview(
    reviews : List.List<ReviewTypes.Review>,
    sessions : List.List<SessionTypes.Session>,
    nextId : Nat,
    reviewer : CommonTypes.UserId,
    sessionId : CommonTypes.SessionId,
    rating : Nat,
    comment : ?Text,
  ) : ReviewTypes.Review {
    if (rating < 1 or rating > 5) {
      Runtime.trap("Rating must be between 1 and 5");
    };

    let session = switch (sessions.find(func(s : SessionTypes.Session) : Bool { Nat.equal(s.id, sessionId) })) {
      case (?s) s;
      case null Runtime.trap("Session not found");
    };

    let isCompleted = switch (session.status) {
      case (#completed) true;
      case _ false;
    };
    if (not isCompleted) {
      Runtime.trap("Session must be completed before reviewing");
    };

    let isParticipant = Principal.equal(session.requesterId, reviewer) or Principal.equal(session.receiverId, reviewer);
    if (not isParticipant) {
      Runtime.trap("Only session participants can submit a review");
    };

    // Check no duplicate review from this reviewer for this session
    let alreadyReviewed = reviews.find(func(r : ReviewTypes.Review) : Bool {
      Nat.equal(r.sessionId, sessionId) and Principal.equal(r.reviewerId, reviewer)
    });
    if (alreadyReviewed != null) {
      Runtime.trap("You have already reviewed this session");
    };

    let revieweeId = if (Principal.equal(session.requesterId, reviewer)) session.receiverId else session.requesterId;

    let review : ReviewTypes.Review = {
      id = nextId;
      sessionId = sessionId;
      reviewerId = reviewer;
      revieweeId = revieweeId;
      rating = rating;
      comment = comment;
      createdAt = Time.now();
    };
    reviews.add(review);
    review;
  };

  public func getReceivedReviews(
    reviews : List.List<ReviewTypes.Review>,
    userId : CommonTypes.UserId,
  ) : [ReviewTypes.Review] {
    var results : [ReviewTypes.Review] = [];
    for (r in reviews.values()) {
      if (Principal.equal(r.revieweeId, userId)) {
        results := results.concat([r]);
      };
    };
    results;
  };

  public func computeTrustScore(
    reviews : List.List<ReviewTypes.Review>,
    userId : CommonTypes.UserId,
  ) : Float {
    var total : Nat = 0;
    var count : Nat = 0;
    for (r in reviews.values()) {
      if (Principal.equal(r.revieweeId, userId)) {
        total += r.rating;
        count += 1;
      };
    };
    if (count == 0) return 0.0;
    total.toFloat() / count.toFloat();
  };
};
