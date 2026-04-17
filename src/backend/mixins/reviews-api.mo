import Map "mo:core/Map";
import List "mo:core/List";
import ReviewLib "../lib/reviews";
import ProfileLib "../lib/profile";
import ReviewTypes "../types/reviews";
import SessionTypes "../types/sessions";
import ProfileTypes "../types/profile";
import CommonTypes "../types/common";

mixin (
  reviews : List.List<ReviewTypes.Review>,
  sessions : List.List<SessionTypes.Session>,
  profiles : Map.Map<CommonTypes.UserId, ProfileTypes.UserProfile>,
) {
  var nextReviewId : Nat = 1;

  public shared ({ caller }) func submitReview(
    sessionId : CommonTypes.SessionId,
    rating : Nat,
    comment : ?Text,
  ) : async ReviewTypes.Review {
    let review = ReviewLib.submitReview(reviews, sessions, nextReviewId, caller, sessionId, rating, comment);
    nextReviewId += 1;
    // Update trust score of the reviewee
    ProfileLib.updateTrustScore(profiles, review.revieweeId, rating);
    review;
  };

  public query ({ caller }) func getReceivedReviews() : async [ReviewTypes.Review] {
    ReviewLib.getReceivedReviews(reviews, caller);
  };

  public query ({ caller = _ }) func getReviewsForUser(userId : CommonTypes.UserId) : async [ReviewTypes.Review] {
    ReviewLib.getReceivedReviews(reviews, userId);
  };
};
