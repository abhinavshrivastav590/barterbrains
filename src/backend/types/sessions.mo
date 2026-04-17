import CommonTypes "common";

module {
  public type SessionStatus = { #pending; #confirmed; #completed; #rejected };

  public type Session = {
    id : CommonTypes.SessionId;
    requesterId : CommonTypes.UserId;
    receiverId : CommonTypes.UserId;
    topic : Text;
    scheduledAt : CommonTypes.Timestamp;
    var status : SessionStatus;
    message : ?Text;
    createdAt : CommonTypes.Timestamp;
  };

  // Shared version
  public type SessionPublic = {
    id : CommonTypes.SessionId;
    requesterId : CommonTypes.UserId;
    receiverId : CommonTypes.UserId;
    topic : Text;
    scheduledAt : CommonTypes.Timestamp;
    status : SessionStatus;
    message : ?Text;
    createdAt : CommonTypes.Timestamp;
  };

  public type SessionRequest = {
    receiverId : CommonTypes.UserId;
    topic : Text;
    scheduledAt : CommonTypes.Timestamp;
    message : ?Text;
  };
};
