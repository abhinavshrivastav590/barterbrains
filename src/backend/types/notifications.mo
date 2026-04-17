import CommonTypes "common";

module {
  public type NotificationKind = {
    #newMatch : { matchId : CommonTypes.MatchId; fromUserId : CommonTypes.UserId };
    #newMessage : { messageId : CommonTypes.MessageId; fromUserId : CommonTypes.UserId };
    #sessionRequest : { sessionId : CommonTypes.SessionId; fromUserId : CommonTypes.UserId };
    #sessionAccepted : { sessionId : CommonTypes.SessionId };
    #sessionRejected : { sessionId : CommonTypes.SessionId };
    #sessionCompleted : { sessionId : CommonTypes.SessionId };
  };

  public type Notification = {
    id : CommonTypes.NotificationId;
    userId : CommonTypes.UserId;
    kind : NotificationKind;
    var dismissed : Bool;
    createdAt : CommonTypes.Timestamp;
  };

  // Shared version
  public type NotificationPublic = {
    id : CommonTypes.NotificationId;
    kind : NotificationKind;
    dismissed : Bool;
    createdAt : CommonTypes.Timestamp;
  };
};
