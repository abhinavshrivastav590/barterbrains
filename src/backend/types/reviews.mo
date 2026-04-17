import CommonTypes "common";

module {
  public type Review = {
    id : CommonTypes.ReviewId;
    sessionId : CommonTypes.SessionId;
    reviewerId : CommonTypes.UserId;
    revieweeId : CommonTypes.UserId;
    rating : Nat; // 1–5
    comment : ?Text;
    createdAt : CommonTypes.Timestamp;
  };
};
